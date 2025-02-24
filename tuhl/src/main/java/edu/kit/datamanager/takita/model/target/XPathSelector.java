package edu.kit.datamanager.takita.model.target;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import javax.xml.xpath.XPathFactoryConfigurationException;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;

public class XPathSelector implements ISelector {

	// TODO: change datatype of svgCode
	private String xPath;
	
	public XPathSelector(String xPath) {
		this.xPath = xPath;
	}

	public String getxPath() {
		return xPath;
	}

	public void setxPath(String xPath) {
		this.xPath = xPath;
	}

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
		wadmSelector.put(AnnotationStoreStrings.TYPE.getName(), AnnotationStoreStrings.XPATH_SELECTOR.getName());
		wadmSelector.put(AnnotationStoreStrings.VALUE.getName(), this.xPath);
		
		return wadmSelector;
	}
	
	public String toString() {
		 return this.xPath;
	}
		

}
