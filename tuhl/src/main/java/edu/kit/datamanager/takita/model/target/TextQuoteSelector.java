package edu.kit.datamanager.takita.model.target;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;

public class TextQuoteSelector implements ISelector{
	
	// only "exact" is mandatory according to https://www.w3.org/TR/annotation-model/#text-quote-selector
	// so only "exact" is used in the constructor, the rest can be set/get
	private String exact;
	private String prefix;
	private String suffix;

	public TextQuoteSelector(String exact) {
		this.exact = exact;
	}
	
	public String getExact() {
		return this.exact;
	}

	public void setExact(String exact) {
		this.exact = exact;
	}

	public String getPrefix() {
		return this.prefix;
	}

	public void setPrefix(String prefix) {
		this.prefix = prefix;
	}

	public String getSuffix() {
		return this.suffix;
	}

	public void setSuffix(String suffix) {
		this.suffix = suffix;
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
		wadmSelector.put(AnnotationStoreStrings.TYPE.getName(), AnnotationStoreStrings.TEXTQUOTESELECTOR_SELECTOR.getName());
		wadmSelector.put(AnnotationStoreStrings.EXACT.getName(), this.exact);
		if (this.prefix != null) {
			wadmSelector.put(AnnotationStoreStrings.PREFIX.getName(), this.prefix);
		}
		if (this.suffix != null) {
			wadmSelector.put(AnnotationStoreStrings.SUFFIX.getName(), this.suffix);
		}
		
		return wadmSelector;
	}
	
	public String toString() {
		String selectorString = this.exact;
		if (this.prefix != null) {
			selectorString += " |prefix: " + this.prefix;
		}
		if (this.suffix != null) {
			selectorString += " |suffix: " + this.suffix;
		}
		return selectorString;
		
	}

}
