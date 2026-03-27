// Mock SDK Interfaces
interface Braze {
    logCustomEvent: (eventName: string, properties?: any) => void;
    changeUser: (userId: string) => void;
}

interface Amplitude {
    track: (eventName: string, eventProperties?: any) => void;
    setUserId: (userId: string | null) => void;
}

interface Appsflyer {
    trackEvent: (eventName: string, eventValues?: any) => void;
}

// Global declaration
declare global {
    interface Window {
        braze?: Braze;
        amplitude?: Amplitude;
        appsflyer?: Appsflyer;
    }
}

export const sdkAdapters = {
    braze: {
        logEvent: (eventName: string, props: any) => {
            if (window.braze) {
                window.braze.logCustomEvent(eventName, props);
                console.log('✅ [Braze] Event:', eventName, props);
            } else {
                console.log('⚠️ [Braze] Not initialized:', eventName);
            }
        },
        identify: (userId: string) => {
            if (window.braze) window.braze.changeUser(userId);
        }
    },
    amplitude: {
        logEvent: (eventName: string, props: any) => {
            if (window.amplitude) {
                window.amplitude.track(eventName, props);
                console.log('✅ [Amplitude] Event:', eventName, props);
            } else {
                console.log('⚠️ [Amplitude] Not initialized:', eventName);
            }
        },
        identify: (userId: string | null) => {
            if (window.amplitude) window.amplitude.setUserId(userId);
        }
    },
    appsflyer: {
        logEvent: (eventName: string, props: any) => {
            if (window.appsflyer) {
                window.appsflyer.trackEvent(eventName, props);
                console.log('✅ [Appsflyer] Event:', eventName, props);
            } else {
                console.log('⚠️ [Appsflyer] Not initialized:', eventName);
            }
        }
    }
};
