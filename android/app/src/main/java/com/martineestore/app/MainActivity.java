package com.martineestore.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.braze.Braze;
import com.braze.support.BrazeLogger;
import com.braze.js.InAppMessageJavascriptInterface;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable Braze location tracking
        Braze.getInstance(this).requestLocationInitialization();

        // Inject Braze WebView Bridge
        // This allows the Braze Web SDK to talk to the Native Android SDK
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new InAppMessageJavascriptInterface(this), "AppboyJavascriptInterface");
        }
    }
}
