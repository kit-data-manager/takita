package edu.kit.datamanager.takita.dataaccess.existDb;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.xpath.XPathExpressionException;

import org.w3c.dom.DOMException;
import org.xml.sax.SAXException;

public interface IExistDbAccessService {

	/**
	 * Gets the content of a page that is given in the TEI standard from eXist.
	 *
	 * @param documentId the id of the document (usually the id of the pageDo in the base-repo)
	 * @return the xml as a String
	 * @throws IOException if an error occurs while sending or receiving
	 * @throws InterruptedException if the get request is interrupted
	 */
	String getXMLDocument(String documentId) throws IOException, InterruptedException;
	

	/**
	 * Gets a fragment/node of a document that is given in the TEI standard.
	 *
	 * @param documentId the id of the document (usually the id of the pageDo in the base-repo)
	 * @param xPath (encoded) identifies the document fragment
	 * @param trimmed decides if the resolved xPath should have its content trimmed
	 * according to the substring() function in the xPath. 
	 * - "true" will lead to text contents of elements to be trimmed according to the substring-function
	 * - "false" will leave the text contents of elements untouched (ignoring the substring-function)
     * @param indented decides if the resulting xml-fragment should be indented by exist-db (true) or preserve the
     * indentation of the original document (false)
     * @return the xml as a String
	 * @throws IOException if an error occurs while sending or receiving
	 * @throws InterruptedException if the get request is interrupted
	 * @throws ParserConfigurationException 
	 * @throws SAXException 
	 * @throws TransformerException 
	 * @throws TransformerConfigurationException 
	 * @throws DOMException 
	 * @throws XPathExpressionException 
     * @throws UnsupportedEncodingException
	 */
	String getXMLDocumentFragment(String documentId, String xPath, Boolean trimmed, Boolean indented) throws IOException, InterruptedException, ParserConfigurationException, SAXException, TransformerConfigurationException, TransformerException, XPathExpressionException, DOMException, UnsupportedEncodingException;
	
}
