package com.smn947.pacomprar;
import android.webkit.*;
import android.content.*;
import android.widget.*;
import java.io.*;
import android.os.*;
import android.util.*;

public class WebAppInterface
{
	Context mContext;

	File root = new File(Environment.getExternalStorageDirectory(), "Notes");
	
    /** Instantiate the interface and set the context */
    WebAppInterface(Context c) {
        mContext = c;
    }

    /** Show a toast from the web page */
    @JavascriptInterface
    public void showToast(String toast) {
        Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show();
    }
	
	@JavascriptInterface
	public String checkDB() {
		if(root.exists()){
			return "true";
		}else{
			return "false";
		}
	}
	
	@JavascriptInterface
	public void generateNoteOnSD(String sFileName, String sBody){
		try
		{
			if (!root.exists()) {
				root.mkdirs();
			}
			File gpxfile = new File(root, sFileName);
			FileWriter writer = new FileWriter(gpxfile);
			writer.append(sBody);
			writer.flush();
			writer.close();
			Toast.makeText(mContext, "Saved", Toast.LENGTH_SHORT).show();
		}
		catch(IOException e)
		{
			e.printStackTrace();
			String importError = e.getMessage();
			Log.d("ERROR CREATING FILE",importError);
		}
	}
}
