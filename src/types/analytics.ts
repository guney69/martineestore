export interface AnalyticsEvent {
    event_category: string;
    event_name: string;
    event_description: string;
    user_id: string | null;
    session_id: string;
    timestamp: string; // ISO8601
    page_url: string;
    device_type: 'web' | 'app_webview';
    additional_params?: Record<string, any>;
    utm_source?: string;
    utm_campaign?: string;
    utm_medium?: string;
    utm_term?: string;
    utm_content?: string;
    referrer?: string;
}

export interface DataLayerWindow extends Window {
    dataLayer: AnalyticsEvent[];
}
