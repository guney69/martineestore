import { useCallback } from 'react';
import { AnalyticsEvent, DataLayerWindow } from '../types/analytics';
import { sdkAdapters } from '../utils/sdkAdapters';

export const useDataLayer = () => {
    const pushEvent = useCallback((event: Omit<AnalyticsEvent, 'timestamp' | 'page_url' | 'device_type'>) => {
        const timestamp = new Date().toISOString();
        const page_url = window.location.href;
        const device_type = window.navigator.userAgent.includes('wv') ? 'app_webview' : 'web';

        // Parse UTMs
        const searchParams = new URLSearchParams(window.location.search);
        const currentUtms = {
            utm_source: searchParams.get('utm_source'),
            utm_medium: searchParams.get('utm_medium'),
            utm_campaign: searchParams.get('utm_campaign'),
            utm_term: searchParams.get('utm_term'),
            utm_content: searchParams.get('utm_content'),
        };

        // Check/Save stored initial UTMs
        let storedUtms = {};
        const storedUtmStr = localStorage.getItem('martinee_initial_utms');
        if (storedUtmStr) {
            storedUtms = JSON.parse(storedUtmStr);
        } else if (currentUtms.utm_source || currentUtms.utm_campaign) {
            // Only store if we have at least source or campaign
            const utmsToStore = {
                utm_source: currentUtms.utm_source,
                utm_medium: currentUtms.utm_medium,
                utm_campaign: currentUtms.utm_campaign,
                utm_term: currentUtms.utm_term,
                utm_content: currentUtms.utm_content
            };
            // Remove nulls
            Object.keys(utmsToStore).forEach(key => {
                if (utmsToStore[key as keyof typeof utmsToStore] === null) {
                    delete utmsToStore[key as keyof typeof utmsToStore];
                }
            });

            localStorage.setItem('martinee_initial_utms', JSON.stringify(utmsToStore));
            storedUtms = utmsToStore;
        }

        const fullEvent: AnalyticsEvent = {
            ...event,
            timestamp,
            page_url,
            device_type,
            // Merge current UTMs with stored initial ones (priority to current if exists? Or always include initial?)
            // Requirement: "최초 유입 채널 localStorage에 저장", "모든 이벤트에 포함"
            // Usually we send current if exists, else initial. Or send both as different fields.
            // Standard GA4/Amplitude behavior: Use current context.
            // Let's mix them carefully. 
            ...storedUtms, // Spread stored first
            // Then override with current if present (optional, or we keep strict "Initial" fields?)
            // Let's stick to standard params populated by current, but maybe add `initial_utm_source` in additional_params if needed?
            // For now, let's just use the values we have. If current is null, use stored.
            utm_source: currentUtms.utm_source || (storedUtms as any).utm_source,
            utm_medium: currentUtms.utm_medium || (storedUtms as any).utm_medium,
            utm_campaign: currentUtms.utm_campaign || (storedUtms as any).utm_campaign,
            utm_term: currentUtms.utm_term || (storedUtms as any).utm_term,
            utm_content: currentUtms.utm_content || (storedUtms as any).utm_content,
        };

        const win = window as unknown as DataLayerWindow;
        if (!win.dataLayer) {
            win.dataLayer = [];
        }

        console.log('📊 [DataLayer Push]', fullEvent.event_name, fullEvent);
        win.dataLayer.push(fullEvent);

        // SDK Integration
        try {
            sdkAdapters.braze.logEvent(fullEvent.event_name, fullEvent.additional_params);
            sdkAdapters.amplitude.logEvent(fullEvent.event_name, fullEvent.additional_params);
            sdkAdapters.appsflyer.logEvent(fullEvent.event_name, fullEvent.additional_params);

            if (fullEvent.event_name === 'login_completed' || fullEvent.event_name === 'sign_up_completed') {
                if (fullEvent.user_id) {
                    sdkAdapters.braze.identify(fullEvent.user_id);
                    sdkAdapters.amplitude.identify(fullEvent.user_id);
                }
            }
        } catch (e) {
            console.error('SDK Error', e);
        }

        // Dispatch custom event for Admin logs
        window.dispatchEvent(new CustomEvent('martinee_analytics_event', { detail: fullEvent }));

    }, []);

    return { pushEvent };
};
