package edu.kit.datamanager.takita.model.target;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

public interface ISelector {
	
	public JSONObject getWADMSerialization() throws JSONException;
}
