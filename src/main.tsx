import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProviders } from './context/index.tsx'
import * as braze from '@braze/web-sdk';

// Initialize Braze Web SDK
// The SDK will automatically detect the Native Bridge (Android/iOS) if present
braze.initialize('d884a2f3-e6a9-4005-9e93-ba68d88518af', {
    baseUrl: 'sdk.iad-07.braze.com',
    enableLogging: true,
});

// Make braze globally available for sdkAdapters and debugging
(window as any).braze = braze;
console.log('✅ [Braze] Web SDK Initialized and attached to window');

braze.automaticallyShowInAppMessages();
braze.openSession();
// Request location permission for tracking
// braze.requestLocationPermission(); // Note: This should usually be triggered by a user action.



ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </React.StrictMode>,
)
