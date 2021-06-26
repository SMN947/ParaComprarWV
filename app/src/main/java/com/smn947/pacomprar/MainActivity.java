package com.smn947.pacomprar;

import android.app.*;
import android.os.*;
import android.webkit.*;
import android.view.*;
import java.io.*;
import android.widget.*;
import android.util.*;

public class MainActivity extends Activity 
{
    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
		this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.main);

		final Long start = System.currentTimeMillis();
		final WebView webview = findViewById(R.id.webview);
		webview.getSettings().setJavaScriptEnabled(true);
		webview.getSettings().setDomStorageEnabled(true);
		
		webview.loadUrl("file:///android_asset/index.html");
		webview.getSettings().setDatabaseEnabled(true);
		webview.addJavascriptInterface(new WebAppInterface(this), "Android");
		if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT) {
			webview.getSettings().setDatabasePath("/data/data/" + webview.getContext().getPackageName() + "/databases/");
		}
		webview.setWebViewClient(new WebViewClient(){
			public void onPageFinished(WebView view, String url){
				webview.loadUrl("javascript:tst('"+((System.currentTimeMillis()) - start)+"')");
			}           
		});
    }

	
	
	
	
}
