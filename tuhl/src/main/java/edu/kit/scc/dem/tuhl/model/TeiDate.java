package edu.kit.scc.dem.tuhl.model;

import java.time.LocalDate;

import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

//modeled according to the TEI-guidelines:
//https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-date.html
public class TeiDate {
	private String content;
	private String type;
	@Field(type = FieldType.Date, format = DateFormat.custom, pattern ="uuuu-MM-dd")
	private LocalDate when;
	@Field(type = FieldType.Date, format = DateFormat.custom, pattern ="uuuu-MM-dd")
	private LocalDate notBefore;
	@Field(type = FieldType.Date, format = DateFormat.custom, pattern ="uuuu-MM-dd")
	private LocalDate notAfter;
	@Field(type = FieldType.Date, format = DateFormat.custom, pattern ="uuuu-MM-dd")
	private LocalDate from;
	@Field(type = FieldType.Date, format = DateFormat.custom, pattern ="uuuu-MM-dd")
	private LocalDate to;
	
	public TeiDate() {
		
	}

	/**
	 * @return the when
	 */
	public LocalDate getWhen() {
		return when;
	}

	/**
	 * @param when the when to set
	 */
	public void setWhen(LocalDate when) {
		this.when = when;
	}

	/**
	 * @return the notBefore
	 */
	public LocalDate getNotBefore() {
		return notBefore;
	}

	/**
	 * @param notBefore the notBefore to set
	 */
	public void setNotBefore(LocalDate notBefore) {
		this.notBefore = notBefore;
	}

	/**
	 * @return the notAfter
	 */
	public LocalDate getNotAfter() {
		return notAfter;
	}

	/**
	 * @param notAfter the notAfter to set
	 */
	public void setNotAfter(LocalDate notAfter) {
		this.notAfter = notAfter;
	}

	/**
	 * @return the from
	 */
	public LocalDate getFrom() {
		return from;
	}

	/**
	 * @param from the from to set
	 */
	public void setFrom(LocalDate from) {
		this.from = from;
	}

	/**
	 * @return the to
	 */
	public LocalDate getTo() {
		return to;
	}

	/**
	 * @param to the to to set
	 */
	public void setTo(LocalDate to) {
		this.to = to;
	}
	
	/**
	 * @return the content
	 */
	public String getContent() {
		return content;
	}

	/**
	 * @param content the content to set
	 */
	public void setContent(String content) {
		this.content = content;
	}

	/**
	 * @return the type
	 */
	public String getType() {
		return type;
	}

	/**
	 * @param type the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}

	// TODO: implement a method that turns the object into a string
	public String toString() {
		String dateString = this.getContent();

		if (this.getType() != null) {
			dateString = dateString + " (" + this.getType() + ")";
		}
		
		return dateString;
	}
}
