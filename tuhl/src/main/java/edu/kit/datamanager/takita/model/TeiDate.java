package edu.kit.datamanager.takita.model;

import java.time.LocalDate;

import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

//modeled according to the TEI-guidelines:
//https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-date.html
public class TeiDate {
	private String content;
	private String type;
	//@Field(type = FieldType.Date, format = DateFormat.year_month_day, pattern ="uuuu-MM-dd")
	private PartialDate when;
	//@Field(type = FieldType.Date, format = DateFormat.year_month_day, pattern ="uuuu-MM-dd")
	private PartialDate notBefore;
	//@Field(type = FieldType.Date, format = DateFormat.year_month_day, pattern ="uuuu-MM-dd")
	private PartialDate notAfter;
	//@Field(type = FieldType.Date, format = DateFormat.year_month_day, pattern ="uuuu-MM-dd")
	private PartialDate from;
	//@Field(type = FieldType.Date, format = DateFormat.year_month_day, pattern ="uuuu-MM-dd")
	private PartialDate to;
	
	public TeiDate() {
		
	}

	/**
	 * @return the when
	 */
	public PartialDate getWhen() {
		return when;
	}

	/**
	 * get 'when' attribute as normalized YYYY-MM-DD
	 * @return first of month and/or year if partial date is given
	 */
	@Field(type = FieldType.Date, format = DateFormat.year_month_day, pattern ="uuuu-MM-dd")
	public LocalDate getWhenDate() {
		return when.toFirstLocalDate();
	}

	/**
	 * @param when the when to set
	 */
	public void setWhen(PartialDate when) {
		this.when = when;
	}

	/**
	 * @return the notBefore
	 */
	public PartialDate getNotBefore() {
		return notBefore;
	}

	/**
	 * get 'notBefore' attribute as normalized YYYY-MM-DD
	 * @return first of month and/or year if partial date is given
	 */
	@Field(type = FieldType.Date, format = DateFormat.year_month_day, pattern ="uuuu-MM-dd")
	public LocalDate getNotBeforeDate() {
		return notBefore.toFirstLocalDate();
	}

	/**
	 * @param notBefore the notBefore to set
	 */
	public void setNotBefore(PartialDate notBefore) {
		this.notBefore = notBefore;
	}

	/**
	 * @return the notAfter
	 */
	public PartialDate getNotAfter() {
		return notAfter;
	}

	/**
	 * get 'notAfter' attribute as normalized YYYY-MM-DD
	 * @return last of month and/or year if partial date is given
	 */
	@Field(type = FieldType.Date, format = DateFormat.year_month_day, pattern ="uuuu-MM-dd")
	public LocalDate getNotAfterDate() {
		return notBefore.toLastLocalDate();
	}

	/**
	 * @param notAfter the notAfter to set
	 */
	public void setNotAfter(PartialDate notAfter) {
		this.notAfter = notAfter;
	}

	/**
	 * @return the from
	 */
	public PartialDate getFrom() {
		return from;
	}

	/**
	 * get 'from' attribute as normalized YYYY-MM-DD
	 * @return first of month and/or year if partial date is given
	 */
	@Field(type = FieldType.Date, format = DateFormat.year_month_day, pattern ="uuuu-MM-dd")
	public LocalDate getFromDate() {
		return notBefore.toFirstLocalDate();
	}

	/**
	 * @param from the from to set
	 */
	public void setFrom(PartialDate from) {
		this.from = from;
	}

	/**
	 * @return the to
	 */
	public PartialDate getTo() {
		return to;
	}

	/**
	 * get 'to' attribute as normalized YYYY-MM-DD
	 * @return last of month and/or year if partial date is given
	 */
	@Field(type = FieldType.Date, format = DateFormat.year_month_day, pattern ="uuuu-MM-dd")
	public LocalDate getToDate() {
		return notBefore.toLastLocalDate();
	}

	/**
	 * @param to the to to set
	 */
	public void setTo(PartialDate to) {
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
