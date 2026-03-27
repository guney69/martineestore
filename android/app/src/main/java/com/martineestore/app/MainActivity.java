package com.martineestore.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.braze.Braze;
import com.braze.support.BrazeLogger;
import com.braze.ui.inappmessage.jsinterface.InAppMessageJavascriptInterface;
import com.braze.ui.inappmessage.BrazeInAppMessageManager;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable Braze location tracking
        Braze.getInstance(this).requestLocationInitialization();

        // Ensure Activity is subscribed to IAM events
        BrazeInAppMessageManager.getInstance().ensureSubscribedToInAppMessageEvents(this);
    }

    @Override
    public void onResume() {
        super.onResume();
        // Register InAppMessageManager for Activity
        BrazeInAppMessageManager.getInstance().registerInAppMessageManager(this);
    }

    @Override
    public void onPause() {
        super.onPause();
        // Unregister InAppMessageManager
        BrazeInAppMessageManager.getInstance().unregisterInAppMessageManager(this);
    }
}
