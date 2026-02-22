package edu.kit.datamanager.takita.model.target;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;

public class XPathSelector implements ISelector {

	// TODO: change datatype of svgCode
	private String value;
	private final String type = AnnotationStoreStrings.XPATH_SELECTOR.getName();
	
	public XPathSelector(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	@Override
	public String getType() { return type; }

	@Override
	public JSONObject getWADMSerialization() throws JSONException {
		
		JSONObject wadmSelector = new JSONObject();
		/*try {
			XPath xPathP = XPathFactory.newInstance().newXPath();
			XPathExpression xPathE = XPathFactory.newInstance().newXPath().compile(this.xPath);
			System.out.println("Path: " + xPathP);
			System.out.println("Expression: " + xPathE);
			System.out.println(this.xPath);
		} catch (XPathExpressionException e) {
			e.printStackTrace();
		}*/
		wadmSelector.put(AnnotationStoreStrings.TYPE.getName(), this.type);
		wadmSelector.put(AnnotationStoreStrings.VALUE.getName(), this.value);
		
		return wadmSelector;
	}
	
	public String toString() {
		 return this.value;
	}
		

}
