package edu.kit.scc.dem.tuhl.model.target;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

public interface ISelector {
	
	public JSONObject getWADMSerialization() throws JSONException;
}
