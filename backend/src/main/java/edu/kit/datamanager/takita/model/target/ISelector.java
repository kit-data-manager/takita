package edu.kit.datamanager.takita.model.target;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

/**
 * Interface for selectors in annotations
 */
public interface ISelector {
	/**
	 * Gets selector type
	 * @return type of selector
	 */
	public String getType();

	/**
	 * Constructs serialization compliant with WADM spec
	 * @return json of WADM fragment
	 * @throws JSONException
	 */
	public JSONObject getWADMSerialization() throws JSONException;
}
