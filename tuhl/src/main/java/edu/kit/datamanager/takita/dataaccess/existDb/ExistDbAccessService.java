package edu.kit.datamanager.takita.dataaccess.existDb;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import edu.kit.datamanager.takita.dataaccess.HttpRequestHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.DOMException;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import edu.kit.datamanager.takita.MissingPropertyException;
import jakarta.annotation.PostConstruct;

import static edu.kit.datamanager.takita.dataaccess.utils.XmlUtilities.getNamespaceContext;

@Service
@ConditionalOnProperty(
        value = "exist.baseUrl",
        matchIfMissing = false)
public class ExistDbAccessService implements IExistDbAccessService {

	private static final Logger logger = LoggerFactory.getLogger(ExistDbAccessService.class);

	private static final String SEARCH_URL = "?_query=";
	private static final String NO_INDENT_FLAG = "&_indent=no";

	@Value("${exist.baseUrl:#{null}}")
	private String baseUrl;
	@Value("${exist.restEndpoint:rest/db/}")
	private String restEndpoint;
	@Value("${exist.idPrefix:#{null}}")
	private String idPrefix;

	private final HttpRequestHelper httpRequestHelper;

    /**
     * Implements IExistAccessService, contains logic for accessing the eXist-db.
     * If a username and password is provided in the application.properties, the
     * HTTP-requests will be sent with authentication enabled as the HttpRequestHelper
     * will be constructed using these credentials.
     *
     * @param username for the user in the eXist-db. It can also be null, if none was
     *                 given in the application.properties.
     * @param password for the user in the eXist-db. It can also be null, if none was
     *                 given in the application.properties.
     */
	public ExistDbAccessService(@Value("${exist.user.name:#{null}}") String username, @Value("${exist.user.password:#{null}}") String password) {
        boolean credentialsGiven = (username != null && !username.isEmpty()) && (password != null && !password.isEmpty());
        logger.info(credentialsGiven ?
                "Creating httpRequestHelper for ExistAccessService with authentication as a username and password was given" :
                "Creating httpRequestHelper for ExistAccessService without authentication as no username and password was given");
        httpRequestHelper = credentialsGiven ? new HttpRequestHelper(username, password) : new HttpRequestHelper();
	}

	@PostConstruct
	public void checkProperty() {
		if (baseUrl == null || baseUrl.isEmpty()) {
			throw new MissingPropertyException("exist.baseUrl");
		}
	}

	/**
	 * Gets the content of a page that is given in the TEI standard from eXist-db.
	 *
	 * @param documentId the id of the document (usually the id of the pageDo in the base-repo)
	 * @return the xml as a String
	 * @throws IOException if an error occurs while sending or receiving
	 * @throws InterruptedException if the get request is interrupted
	 */
	@Override
	public String getXMLDocument(String documentId) throws IOException, InterruptedException {
		// xml:ids are not valid, if they start with a number. The base-repo generates ids, which
        // can start with a number, and if these ids are used as xml:ids for fragments in the xml
        // document it can lead to problems. Adding a prefix to the xml:ids prior to uploading
        // the documents to eXist-db might be necessary. So depending on the  ids used by a
        // project the ids have to be prefixed with at least one letter. The letter can be changed
        // in the application.properties. If a prefix is given use it.
		if (idPrefix != null) {
			documentId = idPrefix + documentId;
		}
		
		// the context for the xPath should only be a tei-body with the pageId
		String query = "//id('" + documentId + "')";
		String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
		logger.info("Trying to get content for document: {}", documentId);
		// using the flag to not indent the result to keep original document format
		return httpRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + encodedQuery + NO_INDENT_FLAG).body();
	}
	
	/**
	 * Gets one fragment of a page that is given in the TEI standard from eXist-db.
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
	 * 1. if called with an xPath holding only one id ("pageId/filename/id("e.id")/false")
	 * consisting of one element and its descendants like a division or a word
	 * 2. a) if called with an xPath holding only multiple ids ("pageId/filename/id("e.id")|id("e.id2")/false")
	 * consisting of the closest parent of the first and last element given in the xPath. The whole parent is
	 * included if the "trimmed" variable is false
	 *    b) if called with an xPath holding only multiple ids ("pageId/filename/id("e.id")|id("e.id2")/false")
	 * consisting of the closest parent of the first and last element given in the xPath. Only the elements, whose
	 * ids are present in the xPath are included in the result, the others are getting removed, if the
	 * "trimmed" variable is false
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
	@Override
	public String getXMLDocumentFragment(String documentId, String xPath, Boolean trimmed, Boolean indented)
			throws IOException, InterruptedException, ParserConfigurationException, SAXException, TransformerConfigurationException, TransformerException, XPathExpressionException, DOMException, UnsupportedEncodingException {
		logger.info("Trying to resolve xPath: {}, for document: {}", xPath, documentId);
		String query = constructQueryForXPath(documentId, xPath);
		String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
		// instead of "get()" you might have to use "getFromExistDbWithAuth()" to use the credentials
		// for the exist-db user specified in the application.properties.
		// using the flag to not indent the result to keep original document format, if desired
		HttpResponse<String> response = httpRequestHelper
                .get(baseUrl + restEndpoint + SEARCH_URL + encodedQuery + (indented ? "" : NO_INDENT_FLAG));

        if (response.statusCode() == 200) {
            String teiString = response.body();
            // parsing the string into a document
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document teiDocument = builder.parse(new InputSource(new StringReader(teiString)));

            if (trimmed) {
                NamespaceContext namespaceContext = getNamespaceContext();

                // creating the xPath object
                XPath xPathInstance = XPathFactory.newInstance().newXPath();
                xPathInstance.setNamespaceContext(namespaceContext);

                List<String> ids = extractIDsFromXPath(xPath);
                iterateNodeList(teiDocument.getDocumentElement().getChildNodes(), ids, xPathInstance);
                String docString = documentToString(teiDocument);
                logger.info("Successfully resolved xPath: {}, for document: {} with trimmed content.", xPath, documentId);
                return docString;
            } else {
                String docString = documentToString(teiDocument);
                logger.info("Successfully resolved xPath: {}, for document: {} with untrimmed content.", xPath, documentId);
                return docString;
            }
        } else {
            logger.info("Could not access document: {} from eXist-db.", documentId);
            return response.body();
        }

			
	}

	/**
	 * extract ids from xPath and construct a query to be send to the exist-db, which will
	 * return the closest common ancestor of the first and last element given in the xPath
	 * 
	 * @param documentId id of the document fragment of a file in exist-db (this should be the id of the
	 * page DO from the base-repo)
	 * @param xPath which is encoded and holding all the ids
	 * @return query string
	 * @throws UnsupportedEncodingException
	 */
	private String constructQueryForXPath(String documentId, String xPath) throws UnsupportedEncodingException {
		// xml:ids are not valid, if they start with a number, so depending on the
		// ids used by a project the ids have to be prefixed with at least one
		// letter. The letter can be changed in the application.properties. If a prefix
		// is given use it.
		if (idPrefix != null) {
			documentId = idPrefix + documentId;
		}
		
		// the context for the xPath should only be a tei-body with the pageId
		String contextNodeForQuery = "//id('" + documentId + "')//";
		String query = "";
		List<String> parts = extractIDsFromXPath(xPath);
		
		if (parts.size() == 1) {
			// A long query should look like: //id('testFileId')//id("w.122")
			query = contextNodeForQuery + "id(\"" + parts.get(0) + "\")";
		} else if (parts.size() > 1) {
			String firstElementID =  parts.get(0);
			String lastElementID = parts.get(parts.size()-1);
			// A long query should look like: //id('testFileId')//((id("w.122")/ancestor::* intersect id("w.133")/ancestor::*)[last()])
			// the query does the following
			// 1. get the correct document via its id "//id('" + pageId + "')" (this is done by the
			//	  contextNodeForQuery variable)
			// 2. set the document as the context for the next part of the xpath by appending "//"
			//	  id('" + pageId + "')//" (this is done by the contextNodeForQuery variable)
			// 3. get the ancestors of the first and last targeted element
			//	  "(" + firstElementID + "/ancestor::* intersect " + lastElementID + "/ancestor::*)"
			// 4. pick the first ancestor, that is shared by both elements
			// Note: the "()" around the second part ("((id("w. ... last()])") of the query are necessary
			// on order for the second part of the query to be executed as a subquery
			// Note: For some reason "[last()]" does not work with exist-db v6.4.0 as the whole xPath
			// won't return anything. Changing it to "[last()-1]" fixes the issue. If you encounter
			// problems with the xPath/the results are not what you expected or you use another version
			// of exist-db, you can try to remove the "-1".
			query = contextNodeForQuery + "((id(\"" + firstElementID + "\")/ancestor::* intersect id(\"" + lastElementID + "\")/ancestor::*)[last()-1])";
			
		}
		return query;
	}
	

	
	/**
	 * extract ids from a string using string-magic (splitting)
	 * 
	 * @param xPath the full encoded xPath. contains a substring like:
	 * 'concat(substring(id("w.1_6-1"), 2, 7), " ", id("w.1_6-2"), " ", id("w.1_6-3"))'
	 * or not like:
	 * 'id("w.1") | id("w.2") | id("w.3"'
	 * @return an array holding all ids present in the xPath like:
	 * ["w.1_6-1", "w.1_6-2", "w.1_6-3"]
	 * or:
	 * ["w.1", "w.2", "w.3"]
	 * @throws UnsupportedEncodingException
	 */
	private List<String> extractIDsFromXPath(String xPath) throws UnsupportedEncodingException {
		String decodedXPath = URLDecoder.decode(xPath, StandardCharsets.UTF_8);
		
		if(decodedXPath.contains("concat(")) {
			// if the xPath contains substrings, e.g.
			// 'concat(substring(id("w.1_6-1"), 2, 7), " ", id("w.1_6-2"), " ", id("w.1_6-3"))'
			String[] parts = decodedXPath.split("id\\(");

			List<String> ids = new ArrayList<>(parts.length-1);
			// add all ids to the ids array, but skip the first entry of the parts array
			// as it is "concat("
			for (int i = 1; i < parts.length; i++) {
				ids.add(parts[i].split("\"")[1]);
			}
			return ids;
		} else {
			// if the xPath doesn't contain a substring, e.g.
			// 'id("w.1") | id("w.2") | id("w.3"'
			String[] parts = URLDecoder.decode(xPath, StandardCharsets.UTF_8).split("\\|");

			List<String> ids= new ArrayList<>(parts.length);
			for (String part :parts) {
				ids.add(part.split("\"")[1]);
			}
			return ids;
			
		}
	}
	
	/**
	 * recursively iterate a nodelist to access every node regardless of its position
	 * in the hierarchy. Start with a node and checks its children, so the way to traverse
	 * the tree is downwards. Deletes nodes and its children, if the nodes or its children's id
	 * are not present in the id list. The decision to delete a node/its children is based on the
	 * result of an xPath, which is checking for the presence of ids in a node.
	 * 
	 * @param nodeList holding elements or document fragments
	 * @param ids list of ids to check, wether they are present in the nodelists entries
	 * @param xPathInstance used to check the presence of ids and injected into the function
	 * performing the check
	 * @throws DOMException 
	 * @throws XPathExpressionException 
	 */
	private void iterateNodeList(NodeList nodeList, List<String> ids, XPath xPathInstance) throws XPathExpressionException, DOMException {

		// going through the list backwards as we want to delete items from it and we don't want to
		// mess up the iteration
		for (int i = nodeList.getLength()-1; i >= 0; i--) {
			// if node is element or document fragment, check whether itself or its descendants
			// have an id which is present in the list of ids.
			// textNodes etc. will be ignored.
			if (nodeList.item(i).getNodeType() == 1 || nodeList.item(i).getNodeType() == 11) {
				// check if the node itself is included in the given xPath. If it is included
				// continue with the next sibling to prevent child nodes to be deleted
				if (selfIsIncludedInIDList(nodeList.item(i), ids)) {
					continue;
				}
				// check if the nodes descendants are included in the given xPath.
				// If not the node is deleted.
				if (!descendantsAreIncludedInIDList(nodeList.item(i), ids, xPathInstance)) {
					nodeList.item(i).getParentNode().removeChild(nodeList.item(i));
					continue;
				}
			}
						
			// recursively call this function to access every (child)node in the document
			if (nodeList.item(i).hasChildNodes()) {
				iterateNodeList(nodeList.item(i).getChildNodes(), ids, xPathInstance);
			}
		}
	}

	/**
	 * check, if the nodes id is present in the list of ids. The decision is based on the
	 * presence of ids from the id-list in a node.
	 * 
	 * @param node to be checked
	 * @param ids list of ids
	 * @return boolean, true: if the node has any id from the nodelist;
	 * false (default return): if the node does not have any id from the nodelist
	 */
	private Boolean selfIsIncludedInIDList(Node node, List<String> ids) {
		// Cloning or stuff is getting weird.
		// It might get weird because somehow the node still has connections to its parents
		// and then the xPaths are acting up
		Node clone = node.cloneNode(true);
		
		// check for every id, if it is present in the node. This is solely via the attributes
		// of the node
		for (String id : ids) {
			// here we don't use xPath as we are only interested in one node. And can't even use
			// xPath as for some reason using the xPath "//*[@xml:id='w.121']" on 
			// the xml "<w xml:id="w.121">Blessed</w>" is returning nothing in java (in oxygen it correctly
			// returns the node). so we have to check for some nodes (i think only for the
			// "smallest" descendant) via the attributes as well.
			for (int i = 0; i < node.getAttributes().getLength(); i++) {
				if (node.getAttributes().item(i).getNodeValue().contentEquals(id)) {
					return true;
				}
			}
		}
		return false;
	}
	
	/**
	 * check, if the nodes children's id is present in the list of ids. The decision is based on the
	 * result of an xPath, which is checking for the presence of ids in a node.
	 * 
	 * @param node to be checked
	 * @param ids list of ids
	 * @param xPathInstance used to evaluate an xPath, which is checking for the presence of an id
	 * @return boolean, true: if the node or any of its children have any id from the nodelist;
	 * false (default return): if neither the node nor any of its children have any id from the nodelist
	 * @throws XPathExpressionException
	 */
	private Boolean descendantsAreIncludedInIDList(Node node, List<String> ids, XPath xPathInstance) throws XPathExpressionException {
        // Cloning or stuff is getting weird.
        // It might get weird because somehow the node still has connections to its parents
		// and then the xPaths are acting up
		Node clone = node.cloneNode(true);
		
		// check for every id, if it is present in the node. This is done via xPath.
		for (String id : ids) {
			if ((Boolean) xPathInstance.compile("//*[@xml:id='"+ id +"']").evaluate(clone, XPathConstants.BOOLEAN)) {
				return true;
			}
		}
		return false;
	}
	
	/**
	 * turn xml document into a string
	 * 
	 * @param document to be converted
	 * @return the xml document as string
	 * @throws TransformerConfigurationException
	 * @throws TransformerException
	 */
	private String documentToString(Document document) throws TransformerConfigurationException, TransformerException {
	    TransformerFactory transformerFactory = TransformerFactory.newInstance();
	    Transformer transformer = transformerFactory.newTransformer();
	    StringWriter stringWriter = new StringWriter();
	    transformer.transform(new DOMSource(document), new StreamResult(stringWriter));
	    return stringWriter.toString();
	}

}
