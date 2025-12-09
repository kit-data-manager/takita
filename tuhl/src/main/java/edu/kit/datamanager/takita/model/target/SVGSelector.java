package edu.kit.datamanager.takita.model.target;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;

public class SVGSelector implements ISelector {

	// TODO: change datatype of svgCode
	private String svgCode;
	
	public SVGSelector(String svgCode) {
		this.svgCode = svgCode;
	}

	public void setSVGCode(String svgCode) {
		this.svgCode = svgCode;
	}
	
	public String getSVGCode() {
		return this.svgCode;
	}
	@Override
	public JSONObject getWADMSerialization() throws JSONException {
		JSONObject wadmSelector = new JSONObject();

		wadmSelector.put(AnnotationStoreStrings.TYPE.getName(), AnnotationStoreStrings.SVG_SELECTOR.getName());
        if (!this.svgCode.contains("<svg")) {
            wadmSelector.put(AnnotationStoreStrings.VALUE.getName(), "<svg xmlns=\"http://www.w3.org/2000/svg\">" + this.svgCode + "</svg>");
        } else {
	        String svgString = this.svgCode.substring(this.svgCode.indexOf('>') + 1, this.svgCode.lastIndexOf('<'));
	        wadmSelector.put(AnnotationStoreStrings.VALUE.getName(), "<svg xmlns=\"http://www.w3.org/2000/svg\">" + svgString + "</svg>");
	    };

		return wadmSelector;
	}
	
	public String toString() {
		 return this.svgCode;
	}
}
