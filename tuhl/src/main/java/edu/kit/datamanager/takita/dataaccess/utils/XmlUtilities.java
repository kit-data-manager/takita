package edu.kit.datamanager.takita.dataaccess.utils;

import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.PartialDate;
import edu.kit.datamanager.takita.model.TeiDate;
import edu.kit.datamanager.takita.model.TeiTitle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.StringReader;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class XmlUtilities {

    private static final Logger logger = LoggerFactory.getLogger(XmlUtilities.class);

    public static NamespaceContext getNamespaceContext() {
        // defining the namespaces to be used by the following code
        // see: https://stackoverflow.com/questions/13702637/xpath-with-namespace-in-java
        // and https://web.archive.org/web/20070328212209/http://blog.davber.com/2006/09/17/xpath-with-namespaces-in-java/
        // We map the prefixes to URIs
        return new NamespaceContext() {
            public String getNamespaceURI(String prefix) {
                return switch (prefix) {
                    case "tei" -> "http://www.tei-c.org/ns/1.0";
                    case "xi" -> "http://www.w3.org/2001/XInclude";
                    case "xml" -> "http://www.w3.org/XML/1998/namespace";
                    case "exist" -> "http://exist.sourceforge.net/NS/exist";
                    default -> null;
                };
            }

            // Dummy implementation - not used!
            public Iterator getPrefixes(String val) {
                return null;
            }

            // Dummy implemenation - not used!
            public String getPrefix(String uri) {
                return null;
            }
        };
    }
    /*
     * Extract metadata from manuscript_metadata.xml for the given manuscript. Then add the metadata
     * to the manuscript.
     */
    public static void addTeiMetadata(Manuscript manuscript, String teiString) {

        try {

            // parsing the string into a document
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document teiDocument = builder.parse(new InputSource(new StringReader(teiString)));

            NamespaceContext namespaceContext = getNamespaceContext();

            // creating the xPath object
            XPath xPath = XPathFactory.newInstance().newXPath();
            xPath.setNamespaceContext(namespaceContext);

            // adding the titles
            // xPath query string to get the title of the text
            String titleQuery = "//tei:teiHeader/tei:fileDesc[1]/tei:titleStmt[1]/tei:title";
            NodeList titles = (NodeList) xPath.compile(titleQuery)
                    .evaluate(teiDocument.getDocumentElement(), XPathConstants.NODESET);
            if (titles.getLength() > 0) {
                addTeiTitles(manuscript, titles);
            }

            // adding the author names
            // xPath for getting the author of the text
            String authorsQuery = "//tei:teiHeader/tei:fileDesc[1]/tei:titleStmt[1]/tei:author";
            NodeList authors = (NodeList) xPath.compile(authorsQuery)
                    .evaluate(teiDocument.getDocumentElement(), XPathConstants.NODESET);
            if (authors.getLength() > 0) {
                addTeiAuthor(manuscript, authors);
            }


            // adding the dates
            // xPath for getting the creation dates of the text
            String datesQuery = "//tei:teiHeader[1]/tei:profileDesc[1]/tei:creation[1]/tei:date[not(@type=\"file\")]";
            NodeList dates = (NodeList) xPath.compile(datesQuery)
                    .evaluate(teiDocument.getDocumentElement(), XPathConstants.NODESET);
            if (dates.getLength() > 0) {
                addTeiDate(manuscript, dates);
            }

        } catch (Exception e) {
            logger.info("Could not convert manuscript metadata for"
                    + " elastic index for manuscript: " + manuscript.getId());
            e.printStackTrace();
        }
    }

    /*
     * Adds the titles obtained from the metadata tei-xml-file to a manuscript.
     */
    private static void addTeiTitles(Manuscript manuscript, NodeList titles) {

        List<TeiTitle> titlesSeries = new ArrayList<TeiTitle>();
        List<TeiTitle> titlesMonographic = new ArrayList<TeiTitle>();
        List<TeiTitle> titlesAnalytic = new ArrayList<TeiTitle>();
        List<TeiTitle> titlesDefault = new ArrayList<TeiTitle>();

        for (int i = 0; i < titles.getLength(); i++) {
            try {
                String titleType = titles.item(i).getAttributes().getNamedItem("type") != null ? titles.item(i).getAttributes().getNamedItem("type").getNodeValue() : null;
                String titleLevel = titles.item(i).getAttributes().getNamedItem("level") != null ? titles.item(i).getAttributes().getNamedItem("level").getNodeValue() : null;
                String titleLang = titles.item(i).getAttributes().getNamedItem("xml:lang") != null ? titles.item(i).getAttributes().getNamedItem("xml:lang").getNodeValue() : null;

                TeiTitle title = new TeiTitle(
                        titles.item(i).getTextContent(),
                        titleType,
                        titleLevel,
                        titleLang
                );

                switch (title.level()) {
                    case "s":
                        titlesSeries.add(title);
                        break;
                    case "m":
                        titlesMonographic.add(title);
                        break;
                    case "a":
                        titlesAnalytic.add(title);
                        break;
                    case null:
                    default:
                        titlesDefault.add(title);
                }
            } catch (Exception e) {
                logger.info("Could not parse titles for manuscript: " + manuscript.getId());
                e.printStackTrace();
            }
        }

        if (!titlesSeries.isEmpty()) {
            manuscript.setTeiTitleSeries(titlesSeries);
        }
        if (!titlesMonographic.isEmpty()) {
            manuscript.setTeiTitleMonographic(titlesMonographic);
        }
        if (!titlesAnalytic.isEmpty()) {
            manuscript.setTeiTitleAnalytic(titlesAnalytic);
        }
        if (!titlesDefault.isEmpty()) {
            manuscript.setTeiTitle(titlesDefault);
        }
    }

    /*
     * Adds the author obtained from the metadata tei-xml-file to a manuscript.
     */
    private static void addTeiAuthor(Manuscript manuscript, NodeList authors) {

        List<String> authorList = new ArrayList<String>();

        for (int i = 0; i < authors.getLength(); i++) {
            try {
                NodeList persNames = authors.item(i).getChildNodes();

                // removing all the text nodes
                List<Node> cleanedPersNames = new ArrayList<Node>();
                for (int l = 0; l < persNames.getLength(); l++) {
                    if (persNames.item(l).getNodeType() != 3) {
                        cleanedPersNames.add(persNames.item(l));
                    }
                }

                // getting the persNames text content and adding them to the
                // list of authors
                List<String> persNamesList = new ArrayList<String>();
                for (int l = 0; l < cleanedPersNames.size(); l++) {
                    persNamesList.add(cleanedPersNames.get(l).getTextContent());
                }
                if (persNamesList.size() > 1) {
                    String concatedPersNames = concatList(persNamesList);
                    authorList.add(concatedPersNames);
                } else {
                    authorList.add(persNamesList.get(0));
                }
            } catch (Exception e) {
                logger.info("Could not parse authors for manuscript: " + manuscript.getId());
                e.printStackTrace();
            }
        }

        if(!authorList.isEmpty()) {
            manuscript.setTeiAuthor(authorList);
        }
    }

    /*
     * Adds the date obtained from the metadata tei-xml-file to a manuscript.
     */
    private static void addTeiDate(Manuscript manuscript, NodeList dates) {
        List<TeiDate> datesList = new ArrayList<TeiDate>();

        for (int i = 0; i < dates.getLength(); i++) {
            try {
                TeiDate date = new TeiDate();

                if (dates.item(i).getTextContent() != null) {
                    date.setContent(dates.item(i).getTextContent());
                }
                if (dates.item(i).getAttributes().getNamedItem("type") != null) {
                    date.setType(dates.item(i).getAttributes().getNamedItem("type").getNodeValue());
                }

                // set the various dates after the string a valid string, that can be parsed
                if (dates.item(i).getAttributes().getNamedItem("when") != null) {
                    String whenValue = dates.item(i).getAttributes().getNamedItem("when").getNodeValue();
                    PartialDate when = PartialDate.parse(whenValue);
                    date.setWhen(when);
                }
                if (dates.item(i).getAttributes().getNamedItem("notBefore") != null) {
                    String notBeforeValue = dates.item(i).getAttributes().getNamedItem("notBefore").getNodeValue();
                    PartialDate notBefore = PartialDate.parse(notBeforeValue);
                    date.setNotBefore(notBefore);
                }
                if (dates.item(i).getAttributes().getNamedItem("notAfter") != null) {
                    String notAfterValue = dates.item(i).getAttributes().getNamedItem("notAfter").getNodeValue();
                    PartialDate notAfter = PartialDate.parse(notAfterValue);
                    date.setNotAfter(notAfter);
                }
                if (dates.item(i).getAttributes().getNamedItem("from") != null) {
                    String fromValue = dates.item(i).getAttributes().getNamedItem("from").getNodeValue();
                    PartialDate from = PartialDate.parse(fromValue);
                    date.setFrom(from);
                }
                if (dates.item(i).getAttributes().getNamedItem("to") != null) {
                    String toValue = dates.item(i).getAttributes().getNamedItem("to").getNodeValue();
                    PartialDate to = PartialDate.parse(toValue);
                    date.setTo(to);
                }
                datesList.add(date);
            } catch (Exception e) {
                logger.info("Could not parse dates for manuscript: " + manuscript.getId());
                e.printStackTrace();
            }
        }

        if(!datesList.isEmpty()) {
            manuscript.setTeiManuscriptCreationDate(datesList);
        }
    }

    /**
     * Helper function to concatenate a list into a string, where all entries apart from
     * the first are surrounded by brackets.
     */
    private static String concatList(List list) {
        String result = list.get(0).toString();
        list.remove(0);
        if (list.size() >= 1) {
            result = result + " (" + String.join("; ", list) + ")";
        }
        return result;
    }
}
