package edu.kit.datamanager.takita.model;


// modeled according to the TEI-guidelines:
// https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-title.html
public class TeiTitle {
	private String content;
	private String type;
	private String level;
	private String language;
	
	public TeiTitle(String content) {
		this.content = content;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}
}

