package edu.kit.datamanager.takita.dataaccess.utils;

import edu.kit.datamanager.takita.model.Manuscript;
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
                TeiTitle title = new TeiTitle(titles.item(i).getTextContent());

                // getting the values of the attribute of the title (title[@attribute])
                if (titles.item(i).getAttributes().getNamedItem("type") != null) {
                    title.setType(titles.item(i).getAttributes().getNamedItem("type").getNodeValue());
                }

                if (titles.item(i).getAttributes().getNamedItem("xml:lang") != null) {
                    title.setLanguage(titles.item(i).getAttributes().getNamedItem("xml:lang").getNodeValue());;
                }

                if (titles.item(i).getAttributes().getNamedItem("level") != null) {

                    String level = titles.item(i).getAttributes().getNamedItem("level").getNodeValue();
                    title.setLevel(level);

                    switch (level) {
                        case "s":
                            titlesSeries.add(title);
                            break;
                        case "m":
                            titlesMonographic.add(title);
                            break;
                        case "a":
                            titlesAnalytic.add(title);
                            break;
                        default:
                            titlesDefault.add(title);
                    }
                } else {
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
                    whenValue = makeDateStringValid(whenValue, true);
                    LocalDate when = LocalDate.parse(whenValue);
                    date.setWhen(when);
                }
                if (dates.item(i).getAttributes().getNamedItem("notBefore") != null) {
                    String notBeforeValue = dates.item(i).getAttributes().getNamedItem("notBefore").getNodeValue();
                    notBeforeValue = makeDateStringValid(notBeforeValue, true);
                    LocalDate notBefore = LocalDate.parse(notBeforeValue);
                    date.setNotBefore(notBefore);
                }
                if (dates.item(i).getAttributes().getNamedItem("notAfter") != null) {
                    String notAfterValue = dates.item(i).getAttributes().getNamedItem("notAfter").getNodeValue();
                    notAfterValue = makeDateStringValid(notAfterValue, false);
                    LocalDate notAfter = LocalDate.parse(notAfterValue);
                    date.setNotAfter(notAfter);
                }
                if (dates.item(i).getAttributes().getNamedItem("from") != null) {
                    String fromValue = dates.item(i).getAttributes().getNamedItem("from").getNodeValue();
                    fromValue = makeDateStringValid(fromValue, true);
                    LocalDate from = LocalDate.parse(fromValue);
                    date.setFrom(from);
                }
                if (dates.item(i).getAttributes().getNamedItem("to") != null) {
                    String toValue = dates.item(i).getAttributes().getNamedItem("to").getNodeValue();
                    toValue = makeDateStringValid(toValue, false);
                    LocalDate to = LocalDate.parse(toValue);
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
     * Helper function to make sure that the string passed is a valid date in
     * YYYY-MM-DD format.
     *
     * @param dateString to be validated
     * @param yearStart Boolean to decide if the date should be the start/end of a year
     * @return valid dateString
     */
    private static String makeDateStringValid(String dateString, Boolean yearStart) {
        // check if the data is in YYYY-MM-DD format
        if (dateString.length() < 10) {
            // add MM-DD if missing
            if (dateString.length() <= 5) {
                if (yearStart) {
                    if (dateString.startsWith("-")) {
                        dateString = dateString + "-12-31";
                    } else {
                        dateString = dateString + "-01-01";
                    }
                } else {
                    if (dateString.startsWith("-")) {
                        dateString = dateString + "-01-01";
                    } else {
                        dateString = dateString + "-12-31";
                    }
                }
            }
            // add DD if missing
            if (dateString.length() <= 8 ) {
                if (yearStart) {
                    if (dateString.startsWith("-")) {
                        dateString = dateString + "-12";
                    } else {
                        dateString = dateString + "-01";
                    }
                } else {
                    if (dateString.startsWith("-")) {
                        dateString = dateString + "-01";
                    } else {
                        dateString = dateString + "-31";
                    }
                }
            }
        }

        // dates including a time have to be cut. They are longer than 11 characters
        // and usually contain a "T" to mark the beginning of the time stamp
        // (10 would be the length for YYYY-MM-DD AD dates, but BC dates include a leading "-")
        if (dateString.length() > 11 && dateString.contains("T")) {
            if (dateString.startsWith("-")) {
                dateString = dateString.substring(0, 11);
            } else {
                dateString = dateString.substring(0, 10);
            }
        }
        return dateString;
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
