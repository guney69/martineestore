package com.martineestore.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.braze.Braze;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable Braze location tracking if permissions are granted
        // This will automatically start tracking when permissions are available
        Braze.getInstance(this).requestLocationInitialization();
    }
}
