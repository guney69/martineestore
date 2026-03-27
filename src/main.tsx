import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProviders } from './context/index.tsx'
import * as braze from '@braze/web-sdk';
import * as amplitude from '@amplitude/analytics-browser';

const isDev = import.meta.env.DEV;

// Initialize Braze Web SDK
// The SDK will automatically detect the Native Bridge (Android/iOS) if present
braze.initialize(import.meta.env.VITE_BRAZE_API_KEY, {
    baseUrl: import.meta.env.VITE_BRAZE_BASE_URL,
    enableLogging: isDev, // 개발 환경에서만 로깅 활성화
});

// Make braze globally available for sdkAdapters and debugging
(window as any).braze = braze;
if (isDev) console.log('✅ [Braze] Web SDK Initialized and attached to window');

braze.automaticallyShowInAppMessages();
braze.openSession();
// Request location permission for tracking
// braze.requestLocationPermission(); // Note: This should usually be triggered by a user action.

// Initialize Amplitude Browser SDK 2
amplitude.init(import.meta.env.VITE_AMPLITUDE_API_KEY, {
    logLevel: isDev ? amplitude.Types.LogLevel.Warn : amplitude.Types.LogLevel.None,
    defaultTracking: false, // 자동 트래킹 비활성화 (수동 이벤트만 사용)
});

// Make amplitude globally available for sdkAdapters and debugging
(window as any).amplitude = amplitude;
if (isDev) console.log('✅ [Amplitude] Browser SDK Initialized and attached to window');



ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </React.StrictMode>,
)
