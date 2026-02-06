package edu.kit.datamanager.takita.model.target;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;

public class SVGSelector implements ISelector {

	// TODO: change datatype of svgCode
	private String value;
	private final String type = AnnotationStoreStrings.SVG_SELECTOR.getName();
	
	public SVGSelector(String value) {
		this.value = value;
	}

	public void setValue(String value) {
		this.value = value;
	}
	
	public String getValue() {
		return this.value;
	}

	@Override
	public String getType() {
		return this.type;
	}

	@Override
	public JSONObject getWADMSerialization() throws JSONException {
		JSONObject wadmSelector = new JSONObject();

		wadmSelector.put(AnnotationStoreStrings.TYPE.getName(), this.type);
        if (!this.value.contains("<svg")) {
            wadmSelector.put(AnnotationStoreStrings.VALUE.getName(), "<svg xmlns=\"http://www.w3.org/2000/svg\">" + this.value + "</svg>");
        } else {
	        String svgString = this.value.substring(this.value.indexOf('>') + 1, this.value.lastIndexOf('<'));
	        wadmSelector.put(AnnotationStoreStrings.VALUE.getName(), "<svg xmlns=\"http://www.w3.org/2000/svg\">" + svgString + "</svg>");
	    };

		return wadmSelector;
	}
	
	public String toString() {
		 return this.value;
	}
}
