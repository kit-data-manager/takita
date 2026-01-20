package edu.kit.datamanager.takita.model.target;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import edu.kit.datamanager.takita.dataaccess.AnnotationStoreStrings;
import edu.kit.datamanager.takita.dataaccess.RepositoryAccessService;
import edu.kit.datamanager.takita.dataaccess.RepositoryStrings;
import edu.kit.datamanager.takita.model.target.ISelector;

public class Target {
	
	// TODO: create an enum for target types
	private String type;
	private String linkToResource;
	//private List<ISelector> selector;
	private ISelector selector;
	
	public Target (String linkToResource) {
		this.linkToResource = linkToResource;
		//this.selector = new ArrayList<>();
	}
	
	public Target () {
		//this.linkToResource = linkToResource;
		//this.selector = new ArrayList<>();
	}

    public Target (String linkToResource, JSONObject selector) throws JSONException {
        if (linkToResource != null) {
            this.linkToResource = linkToResource;
        }

        if (selector != null) {
            String selectorType = selector.getString("type");
            if (selectorType.equals(AnnotationStoreStrings.XPATH_SELECTOR.getName())) {
                this.type = "TEXT";
                this.selector = new XPathSelector(selector.getString(AnnotationStoreStrings.VALUE.getName()));
            } else if (selectorType.equals(AnnotationStoreStrings.SVG_SELECTOR.getName())) {
                this.type = "IMAGE";
                this.selector = new SVGSelector(selector.getString(AnnotationStoreStrings.VALUE.getName()));
            } else if (selectorType.equals(AnnotationStoreStrings.TEXTQUOTE_SELECTOR.getName())) {
                this.type = "TEXT";
                TextQuoteSelector textQuoteSelector = new TextQuoteSelector(selector.getString(AnnotationStoreStrings.EXACT.getName()));
                if (selector.getString(AnnotationStoreStrings.PREFIX.getName()) != null) {
                    textQuoteSelector.setPrefix(selector.getString(AnnotationStoreStrings.PREFIX.getName()));
                }
                if (selector.getString(AnnotationStoreStrings.SUFFIX.getName()) != null) {
                    textQuoteSelector.setSuffix(selector.getString(AnnotationStoreStrings.SUFFIX.getName()));
                }
                this.selector = textQuoteSelector;
            }
        } else {
            this.type = "PAGE";
        }
    }

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getLinkToResource() {
		return linkToResource;
	}

	public void setLinkToResource(String linkToResource) {
		this.linkToResource = linkToResource;
	}

	public ISelector getSelector(){
		return this.selector;
	}
	
	/*public List<ISelector> getSelector(){
		return this.selector;
	}*/
	
	public void setSelector(ISelector selector) {
		this.selector = selector;
	}
	/*public void addSelector (String svgCode) {
		if (svgCode.contains("@xml:id")) {
			this.type = "TEXT";
			XPathSelector xPathSelector  = new XPathSelector(svgCode);
			selector.add(xPathSelector);
		} else {
			this.type = "IMAGE";
			SVGSelector svgSelector = new SVGSelector(svgCode);
			selector.add(svgSelector);
		}
		
		 for later use
		if (svgCode.contains("<svg>")) {
			this.type = "IMAGE";
			SVGSelector svgSelector = new SVGSelector(svgCode);
			selector.add(svgSelector);
		}
	}*/
	
	public JSONObject getWADMSerialization() throws JSONException {
		JSONObject wadmTarget = new JSONObject();
		
		wadmTarget.put(AnnotationStoreStrings.TYPE.getName(),
  	            AnnotationStoreStrings.SPECIFIC_RESOURCE.getName());
		wadmTarget.put(AnnotationStoreStrings.SOURCE.getName(), this.linkToResource);
		// this check is necessary for "page"-annotations, which don't have a selector, i.e. which
    	// target the whole document/image
		if (this.selector != null) {
			wadmTarget.put(AnnotationStoreStrings.SELECTOR.getName(), this.selector.getWADMSerialization());
		}
		/*for (ISelector wadmSelector : this.selector) {
			wadmTarget.put(AnnotationStoreStrings.TYPE.getName(),
	  	            AnnotationStoreStrings.SPECIFIC_RESOURCE.getName());
			wadmTarget.put(AnnotationStoreStrings.SOURCE.getName(), this.linkToResource);
			wadmTarget.put(AnnotationStoreStrings.SELECTOR.getName(), wadmSelector.getWADMSerialization());
		}*/

		return wadmTarget;
		
	}
	
}
