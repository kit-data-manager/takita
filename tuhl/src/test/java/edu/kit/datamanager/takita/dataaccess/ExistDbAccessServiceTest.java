package edu.kit.datamanager.takita.dataaccess;

import edu.kit.datamanager.takita.dataaccess.existDb.ExistDbAccessService;
import edu.kit.datamanager.takita.dataaccess.existDb.IXMLDbAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.xpath.XPathExpressionException;
import java.io.IOException;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(classes = ExistDbAccessService.class)
@TestPropertySource("classpath:application-test.properties")
public class ExistDbAccessServiceTest {

    private static final String SEARCH_URL = "?_query=";
    private static final String NO_INDENT_FLAG = "&_indent=no";
    @Value("${exist.baseUrl:#{null}}")
    private String baseUrl;
    @Value("${exist.restEndpoint:rest/db/}")
    private String restEndpoint;
    @Value("${exist.idPrefix:#{null}}")
    private String idPrefix;

    @Mock
    public HttpResponse<String> mockedResponse;

    @Mock
    public HttpRequestHelper mockedRequestHelper;

    @Autowired
    private IXMLDbAccessService existDbAccessService;

    @BeforeEach
    void init() throws NoSuchFieldException {
        //Insert mock HttpRequestHelper into private field of the ExistDbAccessService instance
        ReflectionTestUtils.setField(existDbAccessService, "httpRequestHelper", mockedRequestHelper);
    }

    // all xml documents in this test class are based on the texts from "Stigel, Johann: Ioannis Stigelii Elegia, Qua Celebratur Dignitas Et Fructus Legitimi coniugij.
    // Scripta in nuptijs Doctissimi viri Davidis Chytraei professoris Academiae Rostochiana. Wittenberg 1553." The text was converted into XML by CRC1475
    // and will be available on zenodo by June 2026.
    @Test
    public void testGetXMLDocument() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = """
                <exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:hits="1" exist:start="1" exist:count="1" exist:compilation-time="0" exist:execution-time="0"><text xmlns="http://www.tei-c.org/ns/1.0" xml:lang="grc" type="poem" xml:id="id.ecc2e156-5d96-48e4-846a-cf4c987ca99c">
                    <body xml:id="b.8" n="bridegroom and bride">
                        <lg>
                            <l><w xml:id="w.1">Νυμφίου</w> <w xml:id="w.2">ὡς</w> <w xml:id="w.3">κραδίη</w> <w xml:id="w.4">φλέγετ'</w> <w xml:id="w.5">ἐν</w> <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w></l>
                            <l rend="indent"><w xml:id="w.8">τῆς</w> <w xml:id="w.9">νύμφης</w> <w xml:id="w.10">στοργῇ</w> <w xml:id="w.11">ἣν</w> <supplied><w xml:id="w.12">ἀγαπᾷ</w> <w xml:id="w.13">καϑαρᾷ</w></supplied><pc xml:id="pc.1">,</pc></l>
                            <l><w xml:id="w.14">οὕτως</w> <w xml:id="w.15">καὶ</w> <w xml:id="w.16">ὁ</w> <w xml:id="w.17">λόγος</w><supplied><pc xml:id="pc.2">,</pc></supplied> <w xml:id="w.18">τέκνον</w> <w xml:id="w.19">πατρὸς</w> <w xml:id="w.20">ἀϊδίοιο</w><pc xml:id="pc.3">,</pc></l>
                            <l rend="indent"><w xml:id="w.21">τῆς</w> <w xml:id="w.22">βροτέης</w> <w xml:id="w.23">φύσεως</w> <w xml:id="w.24">ἣν</w> <w xml:id="w.25">ἐνεδύσατ'</w><supplied><pc xml:id="pc.4">,</pc> <w xml:id="w.26">ἐρᾷ</w></supplied><pc xml:id="pc.5">.</pc></l>
                            <l><w xml:id="w.27">Ἧς</w> <supplied><w xml:id="w.28">ἕνεκ</w></supplied> <w xml:id="w.29">ἀνθρώπους</w> <w xml:id="w.30">μέλη</w> <w xml:id="w.31">ὥσπερ</w> <w xml:id="w.32">σύμφυτα</w> <w xml:id="w.33">ἄλλους</w></l>
                            <l rend="indent"><w xml:id="w.34">βαστάζει</w> <w xml:id="w.35">αὐτοῖς</w> <w xml:id="w.36">καὶ</w> <w xml:id="w.37">ἐπίηρα</w> <w xml:id="w.38">φέρει</w><pc xml:id="pc.6">.</pc></l>
                            <l><w xml:id="w.39">᾿Αλλὰ</w> <w xml:id="w.40">ϑέλει</w> <w xml:id="w.41">ἀγαπὴν</w> <w xml:id="w.42">τῇ</w> <w xml:id="w.43">αὑτοῦ</w> <w xml:id="w.44">Χριστὸς</w> <supplied><w xml:id="w.45">ὁμοίαν</w></supplied></l>
                            <l rend="indent"><w xml:id="w.46">ἐν</w> <w xml:id="w.47">κραδίαις</w> <w xml:id="w.48">ἁγνὴν</w> <w xml:id="w.49">ἔμμεναι</w> <w xml:id="w.50">ἡμετέραις</w><pc xml:id="pc.7">.</pc></l>
                            <l><w xml:id="w.51">Ἤπιος</w> <w xml:id="w.52">οὖν</w> <w xml:id="w.53">εὖ</w> <w xml:id="w.54">ποιήσει</w> <supplied><w xml:id="w.55">σὲ</w></supplied> <w xml:id="w.56">τεὴν</w> <w xml:id="w.57">ἀγαπῶντα</w></l>
                            <l rend="indent"><w xml:id="w.58">ἁρμοδίαν</w> <supplied><w xml:id="w.59">νύμφην</w><pc xml:id="pc.8">,</pc></supplied> <w xml:id="w.60">ὡς</w> <w xml:id="w.61">διέταξε</w> <w xml:id="w.62">νόμος</w><pc xml:id="pc.9">.</pc></l>
                        </lg>
                        </body>
                </text></exist:result>""";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + NO_INDENT_FLAG))
                .thenReturn(mockedResponse);

        String expected = """
                <exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:hits="1" exist:start="1" exist:count="1" exist:compilation-time="0" exist:execution-time="0"><text xmlns="http://www.tei-c.org/ns/1.0" xml:lang="grc" type="poem" xml:id="id.ecc2e156-5d96-48e4-846a-cf4c987ca99c">
                    <body xml:id="b.8" n="bridegroom and bride">
                        <lg>
                            <l><w xml:id="w.1">Νυμφίου</w> <w xml:id="w.2">ὡς</w> <w xml:id="w.3">κραδίη</w> <w xml:id="w.4">φλέγετ'</w> <w xml:id="w.5">ἐν</w> <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w></l>
                            <l rend="indent"><w xml:id="w.8">τῆς</w> <w xml:id="w.9">νύμφης</w> <w xml:id="w.10">στοργῇ</w> <w xml:id="w.11">ἣν</w> <supplied><w xml:id="w.12">ἀγαπᾷ</w> <w xml:id="w.13">καϑαρᾷ</w></supplied><pc xml:id="pc.1">,</pc></l>
                            <l><w xml:id="w.14">οὕτως</w> <w xml:id="w.15">καὶ</w> <w xml:id="w.16">ὁ</w> <w xml:id="w.17">λόγος</w><supplied><pc xml:id="pc.2">,</pc></supplied> <w xml:id="w.18">τέκνον</w> <w xml:id="w.19">πατρὸς</w> <w xml:id="w.20">ἀϊδίοιο</w><pc xml:id="pc.3">,</pc></l>
                            <l rend="indent"><w xml:id="w.21">τῆς</w> <w xml:id="w.22">βροτέης</w> <w xml:id="w.23">φύσεως</w> <w xml:id="w.24">ἣν</w> <w xml:id="w.25">ἐνεδύσατ'</w><supplied><pc xml:id="pc.4">,</pc> <w xml:id="w.26">ἐρᾷ</w></supplied><pc xml:id="pc.5">.</pc></l>
                            <l><w xml:id="w.27">Ἧς</w> <supplied><w xml:id="w.28">ἕνεκ</w></supplied> <w xml:id="w.29">ἀνθρώπους</w> <w xml:id="w.30">μέλη</w> <w xml:id="w.31">ὥσπερ</w> <w xml:id="w.32">σύμφυτα</w> <w xml:id="w.33">ἄλλους</w></l>
                            <l rend="indent"><w xml:id="w.34">βαστάζει</w> <w xml:id="w.35">αὐτοῖς</w> <w xml:id="w.36">καὶ</w> <w xml:id="w.37">ἐπίηρα</w> <w xml:id="w.38">φέρει</w><pc xml:id="pc.6">.</pc></l>
                            <l><w xml:id="w.39">᾿Αλλὰ</w> <w xml:id="w.40">ϑέλει</w> <w xml:id="w.41">ἀγαπὴν</w> <w xml:id="w.42">τῇ</w> <w xml:id="w.43">αὑτοῦ</w> <w xml:id="w.44">Χριστὸς</w> <supplied><w xml:id="w.45">ὁμοίαν</w></supplied></l>
                            <l rend="indent"><w xml:id="w.46">ἐν</w> <w xml:id="w.47">κραδίαις</w> <w xml:id="w.48">ἁγνὴν</w> <w xml:id="w.49">ἔμμεναι</w> <w xml:id="w.50">ἡμετέραις</w><pc xml:id="pc.7">.</pc></l>
                            <l><w xml:id="w.51">Ἤπιος</w> <w xml:id="w.52">οὖν</w> <w xml:id="w.53">εὖ</w> <w xml:id="w.54">ποιήσει</w> <supplied><w xml:id="w.55">σὲ</w></supplied> <w xml:id="w.56">τεὴν</w> <w xml:id="w.57">ἀγαπῶντα</w></l>
                            <l rend="indent"><w xml:id="w.58">ἁρμοδίαν</w> <supplied><w xml:id="w.59">νύμφην</w><pc xml:id="pc.8">,</pc></supplied> <w xml:id="w.60">ὡς</w> <w xml:id="w.61">διέταξε</w> <w xml:id="w.62">νόμος</w><pc xml:id="pc.9">.</pc></l>
                        </lg>
                        </body>
                </text></exist:result>""";
        String actual = existDbAccessService.getXMLDocument(documentId);
        assertEquals(expected, actual, "Getting a full document from the exist-db.");
    }

    // in the following tests for getXMLDocumentFragment() only the input parameters change. Their various combinations are
    // being tested. There are tests working with xPaths targeting only a single complete element, targeting multiple complete elements
    // and targeting multiple complete and partial elements. The trimmed and indented parameters are tested for all relevant xPaths.
    @Test
    public void testGetXMLDocumentFragment1() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.1\") | id(\"w.2\") | id(\"w.3\")";
        boolean trimmed = false;
        boolean indented = false;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2F%28%28id%28%22w.1%22%29%2Fancestor%3A%3A*+intersect+id%28%22w.3%22%29%2Fancestor%3A%3A*%29%5Blast%28%29-1%5D%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = "<exist:result xmlns:exist=\"http://exist.sourceforge.net/NS/exist\" exist:hits=\"1\" exist:start=\"1\" exist:count=\"1\" exist:compilation-time=\"0\" exist:execution-time=\"0\"><l xmlns=\"http://www.tei-c.org/ns/1.0\"><w xml:id=\"w.1\">Νυμφίου</w> <w xml:id=\"w.2\">ὡς</w> <w xml:id=\"w.3\">κραδίη</w> <w xml:id=\"w.4\">φλέγετ'</w> <w xml:id=\"w.5\">ἐν</w> <w xml:id=\"w.6\">στήθεσσιν</w> <w xml:id=\"w.7\">ἔρωτι</w></l></exist:result>";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        String expected = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><exist:result xmlns:exist=\"http://exist.sourceforge.net/NS/exist\" exist:compilation-time=\"0\" exist:count=\"1\" exist:execution-time=\"0\" exist:hits=\"1\" exist:start=\"1\"><l xmlns=\"http://www.tei-c.org/ns/1.0\"><w xml:id=\"w.1\">Νυμφίου</w> <w xml:id=\"w.2\">ὡς</w> <w xml:id=\"w.3\">κραδίη</w> <w xml:id=\"w.4\">φλέγετ'</w> <w xml:id=\"w.5\">ἐν</w> <w xml:id=\"w.6\">στήθεσσιν</w> <w xml:id=\"w.7\">ἔρωτι</w></l></exist:result>";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath targeting only complete elements to get the "
                + (trimmed ? "trimmed" : "untrimmed") + " and " + (indented ? "indented" : "unindented")
                + " fragment of the xml-document.");
    }

    @Test
    public void testGetXMLDocumentFragment2() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.1\") | id(\"w.2\") | id(\"w.3\")";
        boolean trimmed = true;
        boolean indented = false;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2F%28%28id%28%22w.1%22%29%2Fancestor%3A%3A*+intersect+id%28%22w.3%22%29%2Fancestor%3A%3A*%29%5Blast%28%29-1%5D%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = "<exist:result xmlns:exist=\"http://exist.sourceforge.net/NS/exist\" exist:hits=\"1\" exist:start=\"1\" exist:count=\"1\" exist:compilation-time=\"0\" exist:execution-time=\"0\"><l xmlns=\"http://www.tei-c.org/ns/1.0\"><w xml:id=\"w.1\">Νυμφίου</w> <w xml:id=\"w.2\">ὡς</w> <w xml:id=\"w.3\">κραδίη</w> <w xml:id=\"w.4\">φλέγετ'</w> <w xml:id=\"w.5\">ἐν</w> <w xml:id=\"w.6\">στήθεσσιν</w> <w xml:id=\"w.7\">ἔρωτι</w></l></exist:result>";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        String expected = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><exist:result xmlns:exist=\"http://exist.sourceforge.net/NS/exist\" exist:compilation-time=\"0\" exist:count=\"1\" exist:execution-time=\"0\" exist:hits=\"1\" exist:start=\"1\"><l xmlns=\"http://www.tei-c.org/ns/1.0\"><w xml:id=\"w.1\">Νυμφίου</w> <w xml:id=\"w.2\">ὡς</w> <w xml:id=\"w.3\">κραδίη</w>    </l></exist:result>";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath targeting only complete elements to get the "
                + (trimmed ? "trimmed" : "untrimmed") + " and " + (indented ? "indented" : "unindented")
                + " fragment of the xml-document.");
    }

    @Disabled("Test failing on windows, needs fixing")
    @Test
    public void testGetXMLDocumentFragment3() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.1\") | id(\"w.2\") | id(\"w.3\")";
        boolean trimmed = true;
        boolean indented = true;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2F%28%28id%28%22w.1%22%29%2Fancestor%3A%3A*+intersect+id%28%22w.3%22%29%2Fancestor%3A%3A*%29%5Blast%28%29-1%5D%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = """
                <exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:hits="1" exist:start="1" exist:count="1" exist:compilation-time="0" exist:execution-time="0">
                    <l xmlns="http://www.tei-c.org/ns/1.0">
                        <w xml:id="w.1">Νυμφίου</w> <w xml:id="w.2">ὡς</w> <w xml:id="w.3">κραδίη</w> <w xml:id="w.4">φλέγετ'</w> <w xml:id="w.5">ἐν</w> <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w>
                    </l>
                </exist:result>""";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        String expected = """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:compilation-time="0" exist:count="1" exist:execution-time="0" exist:hits="1" exist:start="1">
                    <l xmlns="http://www.tei-c.org/ns/1.0">
                        <w xml:id="w.1">Νυμφίου</w> <w xml:id="w.2">ὡς</w> <w xml:id="w.3">κραδίη</w>   \s
                    </l>
                </exist:result>""";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath targeting only complete elements to get the "
                + (trimmed ? "trimmed" : "untrimmed") + " and " + (indented ? "indented" : "unindented")
                + " fragment of the xml-document.");
    }

    @Disabled("Test failing on windows, needs fixing")
    @Test
    public void testGetXMLDocumentFragment4() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.6\") | id(\"w.7\") | id(\"w.8\")";
        boolean trimmed = false;
        boolean indented = false;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2F%28%28id%28%22w.6%22%29%2Fancestor%3A%3A*+intersect+id%28%22w.8%22%29%2Fancestor%3A%3A*%29%5Blast%28%29-1%5D%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = """
                <exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:hits="1" exist:start="1" exist:count="1" exist:compilation-time="3" exist:execution-time="3"><lg xmlns="http://www.tei-c.org/ns/1.0">
                            <l><w xml:id="w.1">Νυμφίου</w> <w xml:id="w.2">ὡς</w> <w xml:id="w.3">κραδίη</w> <w xml:id="w.4">φλέγετ'</w> <w xml:id="w.5">ἐν</w> <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w></l>
                            <l rend="indent"><w xml:id="w.8">τῆς</w> <w xml:id="w.9">νύμφης</w> <w xml:id="w.10">στοργῇ</w> <w xml:id="w.11">ἣν</w> <supplied><w xml:id="w.12">ἀγαπᾷ</w> <w xml:id="w.13">καϑαρᾷ</w></supplied><pc xml:id="pc.1">,</pc></l>
                            <l><w xml:id="w.14">οὕτως</w> <w xml:id="w.15">καὶ</w> <w xml:id="w.16">ὁ</w> <w xml:id="w.17">λόγος</w><supplied><pc xml:id="pc.2">,</pc></supplied> <w xml:id="w.18">τέκνον</w> <w xml:id="w.19">πατρὸς</w> <w xml:id="w.20">ἀϊδίοιο</w><pc xml:id="pc.3">,</pc></l>
                            <l rend="indent"><w xml:id="w.21">τῆς</w> <w xml:id="w.22">βροτέης</w> <w xml:id="w.23">φύσεως</w> <w xml:id="w.24">ἣν</w> <w xml:id="w.25">ἐνεδύσατ'</w><supplied><pc xml:id="pc.4">,</pc> <w xml:id="w.26">ἐρᾷ</w></supplied><pc xml:id="pc.5">.</pc></l>
                            <l><w xml:id="w.27">Ἧς</w> <supplied><w xml:id="w.28">ἕνεκ</w></supplied> <w xml:id="w.29">ἀνθρώπους</w> <w xml:id="w.30">μέλη</w> <w xml:id="w.31">ὥσπερ</w> <w xml:id="w.32">σύμφυτα</w> <w xml:id="w.33">ἄλλους</w></l>
                            <l rend="indent"><w xml:id="w.34">βαστάζει</w> <w xml:id="w.35">αὐτοῖς</w> <w xml:id="w.36">καὶ</w> <w xml:id="w.37">ἐπίηρα</w> <w xml:id="w.38">φέρει</w><pc xml:id="pc.6">.</pc></l>
                            <l><w xml:id="w.39">᾿Αλλὰ</w> <w xml:id="w.40">ϑέλει</w> <w xml:id="w.41">ἀγαπὴν</w> <w xml:id="w.42">τῇ</w> <w xml:id="w.43">αὑτοῦ</w> <w xml:id="w.44">Χριστὸς</w> <supplied><w xml:id="w.45">ὁμοίαν</w></supplied></l>
                            <l rend="indent"><w xml:id="w.46">ἐν</w> <w xml:id="w.47">κραδίαις</w> <w xml:id="w.48">ἁγνὴν</w> <w xml:id="w.49">ἔμμεναι</w> <w xml:id="w.50">ἡμετέραις</w><pc xml:id="pc.7">.</pc></l>
                            <l><w xml:id="w.51">Ἤπιος</w> <w xml:id="w.52">οὖν</w> <w xml:id="w.53">εὖ</w> <w xml:id="w.54">ποιήσει</w> <supplied><w xml:id="w.55">σὲ</w></supplied> <w xml:id="w.56">τεὴν</w> <w xml:id="w.57">ἀγαπῶντα</w></l>
                            <l rend="indent"><w xml:id="w.58">ἁρμοδίαν</w> <supplied><w xml:id="w.59">νύμφην</w><pc xml:id="pc.8">,</pc></supplied> <w xml:id="w.60">ὡς</w> <w xml:id="w.61">διέταξε</w> <w xml:id="w.62">νόμος</w><pc xml:id="pc.9">.</pc></l>
                        </lg></exist:result>""";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        String expected = """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:compilation-time="3" exist:count="1" exist:execution-time="3" exist:hits="1" exist:start="1"><lg xmlns="http://www.tei-c.org/ns/1.0">
                            <l><w xml:id="w.1">Νυμφίου</w> <w xml:id="w.2">ὡς</w> <w xml:id="w.3">κραδίη</w> <w xml:id="w.4">φλέγετ'</w> <w xml:id="w.5">ἐν</w> <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w></l>
                            <l rend="indent"><w xml:id="w.8">τῆς</w> <w xml:id="w.9">νύμφης</w> <w xml:id="w.10">στοργῇ</w> <w xml:id="w.11">ἣν</w> <supplied><w xml:id="w.12">ἀγαπᾷ</w> <w xml:id="w.13">καϑαρᾷ</w></supplied><pc xml:id="pc.1">,</pc></l>
                            <l><w xml:id="w.14">οὕτως</w> <w xml:id="w.15">καὶ</w> <w xml:id="w.16">ὁ</w> <w xml:id="w.17">λόγος</w><supplied><pc xml:id="pc.2">,</pc></supplied> <w xml:id="w.18">τέκνον</w> <w xml:id="w.19">πατρὸς</w> <w xml:id="w.20">ἀϊδίοιο</w><pc xml:id="pc.3">,</pc></l>
                            <l rend="indent"><w xml:id="w.21">τῆς</w> <w xml:id="w.22">βροτέης</w> <w xml:id="w.23">φύσεως</w> <w xml:id="w.24">ἣν</w> <w xml:id="w.25">ἐνεδύσατ'</w><supplied><pc xml:id="pc.4">,</pc> <w xml:id="w.26">ἐρᾷ</w></supplied><pc xml:id="pc.5">.</pc></l>
                            <l><w xml:id="w.27">Ἧς</w> <supplied><w xml:id="w.28">ἕνεκ</w></supplied> <w xml:id="w.29">ἀνθρώπους</w> <w xml:id="w.30">μέλη</w> <w xml:id="w.31">ὥσπερ</w> <w xml:id="w.32">σύμφυτα</w> <w xml:id="w.33">ἄλλους</w></l>
                            <l rend="indent"><w xml:id="w.34">βαστάζει</w> <w xml:id="w.35">αὐτοῖς</w> <w xml:id="w.36">καὶ</w> <w xml:id="w.37">ἐπίηρα</w> <w xml:id="w.38">φέρει</w><pc xml:id="pc.6">.</pc></l>
                            <l><w xml:id="w.39">᾿Αλλὰ</w> <w xml:id="w.40">ϑέλει</w> <w xml:id="w.41">ἀγαπὴν</w> <w xml:id="w.42">τῇ</w> <w xml:id="w.43">αὑτοῦ</w> <w xml:id="w.44">Χριστὸς</w> <supplied><w xml:id="w.45">ὁμοίαν</w></supplied></l>
                            <l rend="indent"><w xml:id="w.46">ἐν</w> <w xml:id="w.47">κραδίαις</w> <w xml:id="w.48">ἁγνὴν</w> <w xml:id="w.49">ἔμμεναι</w> <w xml:id="w.50">ἡμετέραις</w><pc xml:id="pc.7">.</pc></l>
                            <l><w xml:id="w.51">Ἤπιος</w> <w xml:id="w.52">οὖν</w> <w xml:id="w.53">εὖ</w> <w xml:id="w.54">ποιήσει</w> <supplied><w xml:id="w.55">σὲ</w></supplied> <w xml:id="w.56">τεὴν</w> <w xml:id="w.57">ἀγαπῶντα</w></l>
                            <l rend="indent"><w xml:id="w.58">ἁρμοδίαν</w> <supplied><w xml:id="w.59">νύμφην</w><pc xml:id="pc.8">,</pc></supplied> <w xml:id="w.60">ὡς</w> <w xml:id="w.61">διέταξε</w> <w xml:id="w.62">νόμος</w><pc xml:id="pc.9">.</pc></l>
                        </lg></exist:result>""";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath targeting only complete elements to get the "
                + (trimmed ? "trimmed" : "untrimmed") + " and " + (indented ? "indented" : "unindented")
                + " fragment of the xml-document.");
    }

    @Disabled("Test failing on windows, needs fixing")
    @Test
    public void testGetXMLDocumentFragment5() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.6\") | id(\"w.7\") | id(\"w.8\")";
        boolean trimmed = true;
        boolean indented = false;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2F%28%28id%28%22w.6%22%29%2Fancestor%3A%3A*+intersect+id%28%22w.8%22%29%2Fancestor%3A%3A*%29%5Blast%28%29-1%5D%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = """
                <exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:hits="1" exist:start="1" exist:count="1" exist:compilation-time="0" exist:execution-time="0"><lg xmlns="http://www.tei-c.org/ns/1.0">
                            <l><w xml:id="w.1">Νυμφίου</w> <w xml:id="w.2">ὡς</w> <w xml:id="w.3">κραδίη</w> <w xml:id="w.4">φλέγετ'</w> <w xml:id="w.5">ἐν</w> <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w></l>
                            <l rend="indent"><w xml:id="w.8">τῆς</w> <w xml:id="w.9">νύμφης</w> <w xml:id="w.10">στοργῇ</w> <w xml:id="w.11">ἣν</w> <supplied><w xml:id="w.12">ἀγαπᾷ</w> <w xml:id="w.13">καϑαρᾷ</w></supplied><pc xml:id="pc.1">,</pc></l>
                            <l><w xml:id="w.14">οὕτως</w> <w xml:id="w.15">καὶ</w> <w xml:id="w.16">ὁ</w> <w xml:id="w.17">λόγος</w><supplied><pc xml:id="pc.2">,</pc></supplied> <w xml:id="w.18">τέκνον</w> <w xml:id="w.19">πατρὸς</w> <w xml:id="w.20">ἀϊδίοιο</w><pc xml:id="pc.3">,</pc></l>
                            <l rend="indent"><w xml:id="w.21">τῆς</w> <w xml:id="w.22">βροτέης</w> <w xml:id="w.23">φύσεως</w> <w xml:id="w.24">ἣν</w> <w xml:id="w.25">ἐνεδύσατ'</w><supplied><pc xml:id="pc.4">,</pc> <w xml:id="w.26">ἐρᾷ</w></supplied><pc xml:id="pc.5">.</pc></l>
                            <l><w xml:id="w.27">Ἧς</w> <supplied><w xml:id="w.28">ἕνεκ</w></supplied> <w xml:id="w.29">ἀνθρώπους</w> <w xml:id="w.30">μέλη</w> <w xml:id="w.31">ὥσπερ</w> <w xml:id="w.32">σύμφυτα</w> <w xml:id="w.33">ἄλλους</w></l>
                            <l rend="indent"><w xml:id="w.34">βαστάζει</w> <w xml:id="w.35">αὐτοῖς</w> <w xml:id="w.36">καὶ</w> <w xml:id="w.37">ἐπίηρα</w> <w xml:id="w.38">φέρει</w><pc xml:id="pc.6">.</pc></l>
                            <l><w xml:id="w.39">᾿Αλλὰ</w> <w xml:id="w.40">ϑέλει</w> <w xml:id="w.41">ἀγαπὴν</w> <w xml:id="w.42">τῇ</w> <w xml:id="w.43">αὑτοῦ</w> <w xml:id="w.44">Χριστὸς</w> <supplied><w xml:id="w.45">ὁμοίαν</w></supplied></l>
                            <l rend="indent"><w xml:id="w.46">ἐν</w> <w xml:id="w.47">κραδίαις</w> <w xml:id="w.48">ἁγνὴν</w> <w xml:id="w.49">ἔμμεναι</w> <w xml:id="w.50">ἡμετέραις</w><pc xml:id="pc.7">.</pc></l>
                            <l><w xml:id="w.51">Ἤπιος</w> <w xml:id="w.52">οὖν</w> <w xml:id="w.53">εὖ</w> <w xml:id="w.54">ποιήσει</w> <supplied><w xml:id="w.55">σὲ</w></supplied> <w xml:id="w.56">τεὴν</w> <w xml:id="w.57">ἀγαπῶντα</w></l>
                            <l rend="indent"><w xml:id="w.58">ἁρμοδίαν</w> <supplied><w xml:id="w.59">νύμφην</w><pc xml:id="pc.8">,</pc></supplied> <w xml:id="w.60">ὡς</w> <w xml:id="w.61">διέταξε</w> <w xml:id="w.62">νόμος</w><pc xml:id="pc.9">.</pc></l>
                        </lg></exist:result>""";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        // the code of getXMLDocumentFragment removes elements when called with trimmed=true. It only removes the elements and their
        // content, but leaves the whitespace untouched. Some IDEs remove unescaped whitespaces when there is only whitespace in a line.
        // Therefore, the spaces are escaped in this String with "\s".
        String expected = """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:compilation-time="0" exist:count="1" exist:execution-time="0" exist:hits="1" exist:start="1"><lg xmlns="http://www.tei-c.org/ns/1.0">
                            <l>     <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w></l>
                            <l rend="indent"><w xml:id="w.8">τῆς</w>    </l>
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                        </lg></exist:result>""";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath targeting only complete elements to get the "
                + (trimmed ? "trimmed" : "untrimmed") + " and " + (indented ? "indented" : "unindented")
                + " fragment of the xml-document.");
    }

    @Disabled("Test failing on windows, needs fixing")
    @Test
    public void testGetXMLDocumentFragment6() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.6\") | id(\"w.7\") | id(\"w.8\")";
        boolean trimmed = true;
        boolean indented = true;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2F%28%28id%28%22w.6%22%29%2Fancestor%3A%3A*+intersect+id%28%22w.8%22%29%2Fancestor%3A%3A*%29%5Blast%28%29-1%5D%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = """
                <exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:hits="1" exist:start="1" exist:count="1" exist:compilation-time="0" exist:execution-time="0">
                    <lg xmlns="http://www.tei-c.org/ns/1.0">
                            <l>
                            <w xml:id="w.1">Νυμφίου</w> <w xml:id="w.2">ὡς</w> <w xml:id="w.3">κραδίη</w> <w xml:id="w.4">φλέγετ'</w> <w xml:id="w.5">ἐν</w> <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.8">τῆς</w> <w xml:id="w.9">νύμφης</w> <w xml:id="w.10">στοργῇ</w> <w xml:id="w.11">ἣν</w> <supplied>
                                <w xml:id="w.12">ἀγαπᾷ</w> <w xml:id="w.13">καϑαρᾷ</w>
                            </supplied>
                            <pc xml:id="pc.1">,</pc>
                        </l>
                            <l>
                            <w xml:id="w.14">οὕτως</w> <w xml:id="w.15">καὶ</w> <w xml:id="w.16">ὁ</w> <w xml:id="w.17">λόγος</w>
                            <supplied>
                                <pc xml:id="pc.2">,</pc>
                            </supplied> <w xml:id="w.18">τέκνον</w> <w xml:id="w.19">πατρὸς</w> <w xml:id="w.20">ἀϊδίοιο</w>
                            <pc xml:id="pc.3">,</pc>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.21">τῆς</w> <w xml:id="w.22">βροτέης</w> <w xml:id="w.23">φύσεως</w> <w xml:id="w.24">ἣν</w> <w xml:id="w.25">ἐνεδύσατ'</w>
                            <supplied>
                                <pc xml:id="pc.4">,</pc> <w xml:id="w.26">ἐρᾷ</w>
                            </supplied>
                            <pc xml:id="pc.5">.</pc>
                        </l>
                            <l>
                            <w xml:id="w.27">Ἧς</w> <supplied>
                                <w xml:id="w.28">ἕνεκ</w>
                            </supplied> <w xml:id="w.29">ἀνθρώπους</w> <w xml:id="w.30">μέλη</w> <w xml:id="w.31">ὥσπερ</w> <w xml:id="w.32">σύμφυτα</w> <w xml:id="w.33">ἄλλους</w>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.34">βαστάζει</w> <w xml:id="w.35">αὐτοῖς</w> <w xml:id="w.36">καὶ</w> <w xml:id="w.37">ἐπίηρα</w> <w xml:id="w.38">φέρει</w>
                            <pc xml:id="pc.6">.</pc>
                        </l>
                            <l>
                            <w xml:id="w.39">᾿Αλλὰ</w> <w xml:id="w.40">ϑέλει</w> <w xml:id="w.41">ἀγαπὴν</w> <w xml:id="w.42">τῇ</w> <w xml:id="w.43">αὑτοῦ</w> <w xml:id="w.44">Χριστὸς</w> <supplied>
                                <w xml:id="w.45">ὁμοίαν</w>
                            </supplied>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.46">ἐν</w> <w xml:id="w.47">κραδίαις</w> <w xml:id="w.48">ἁγνὴν</w> <w xml:id="w.49">ἔμμεναι</w> <w xml:id="w.50">ἡμετέραις</w>
                            <pc xml:id="pc.7">.</pc>
                        </l>
                            <l>
                            <w xml:id="w.51">Ἤπιος</w> <w xml:id="w.52">οὖν</w> <w xml:id="w.53">εὖ</w> <w xml:id="w.54">ποιήσει</w> <supplied>
                                <w xml:id="w.55">σὲ</w>
                            </supplied> <w xml:id="w.56">τεὴν</w> <w xml:id="w.57">ἀγαπῶντα</w>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.58">ἁρμοδίαν</w> <supplied>
                                <w xml:id="w.59">νύμφην</w>
                                <pc xml:id="pc.8">,</pc>
                            </supplied> <w xml:id="w.60">ὡς</w> <w xml:id="w.61">διέταξε</w> <w xml:id="w.62">νόμος</w>
                            <pc xml:id="pc.9">.</pc>
                        </l>
                        </lg>
                </exist:result>""";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        // the code of getXMLDocumentFragment removes elements when called with trimmed=true. It only removes the elements and their
        // content, but leaves the whitespace untouched. Some IDEs remove unescaped whitespaces when there is only whitespace in a line.
        // Therefore, the spaces are escaped in this String with "\s".
        String expected = """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:compilation-time="0" exist:count="1" exist:execution-time="0" exist:hits="1" exist:start="1">
                    <lg xmlns="http://www.tei-c.org/ns/1.0">
                            <l>
                                 <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.8">τῆς</w>   \s
                \s\s\s\s\s\s\s\s\s\s\s\s
                        </l>
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                \s\s\s\s\s\s\s\s\s\s\s\s
                        </lg>
                </exist:result>""";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath targeting only complete elements to get the "
                + (trimmed ? "trimmed" : "untrimmed") + " and " + (indented ? "indented" : "unindented")
                + " fragment of the xml-document.");
    }

    @Disabled("Test failing on windows, needs fixing")
    @Test
    public void testGetXMLDocumentFragment6a() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.6\") | id(\"w.7\") | id(\"w.8\")";
        boolean trimmed = false;
        boolean indented = true;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2F%28%28id%28%22w.6%22%29%2Fancestor%3A%3A*+intersect+id%28%22w.8%22%29%2Fancestor%3A%3A*%29%5Blast%28%29-1%5D%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = """
                <exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:hits="1" exist:start="1" exist:count="1" exist:compilation-time="0" exist:execution-time="0">
                    <lg xmlns="http://www.tei-c.org/ns/1.0">
                            <l>
                            <w xml:id="w.1">Νυμφίου</w> <w xml:id="w.2">ὡς</w> <w xml:id="w.3">κραδίη</w> <w xml:id="w.4">φλέγετ'</w> <w xml:id="w.5">ἐν</w> <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.8">τῆς</w> <w xml:id="w.9">νύμφης</w> <w xml:id="w.10">στοργῇ</w> <w xml:id="w.11">ἣν</w> <supplied>
                                <w xml:id="w.12">ἀγαπᾷ</w> <w xml:id="w.13">καϑαρᾷ</w>
                            </supplied>
                            <pc xml:id="pc.1">,</pc>
                        </l>
                            <l>
                            <w xml:id="w.14">οὕτως</w> <w xml:id="w.15">καὶ</w> <w xml:id="w.16">ὁ</w> <w xml:id="w.17">λόγος</w>
                            <supplied>
                                <pc xml:id="pc.2">,</pc>
                            </supplied> <w xml:id="w.18">τέκνον</w> <w xml:id="w.19">πατρὸς</w> <w xml:id="w.20">ἀϊδίοιο</w>
                            <pc xml:id="pc.3">,</pc>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.21">τῆς</w> <w xml:id="w.22">βροτέης</w> <w xml:id="w.23">φύσεως</w> <w xml:id="w.24">ἣν</w> <w xml:id="w.25">ἐνεδύσατ'</w>
                            <supplied>
                                <pc xml:id="pc.4">,</pc> <w xml:id="w.26">ἐρᾷ</w>
                            </supplied>
                            <pc xml:id="pc.5">.</pc>
                        </l>
                            <l>
                            <w xml:id="w.27">Ἧς</w> <supplied>
                                <w xml:id="w.28">ἕνεκ</w>
                            </supplied> <w xml:id="w.29">ἀνθρώπους</w> <w xml:id="w.30">μέλη</w> <w xml:id="w.31">ὥσπερ</w> <w xml:id="w.32">σύμφυτα</w> <w xml:id="w.33">ἄλλους</w>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.34">βαστάζει</w> <w xml:id="w.35">αὐτοῖς</w> <w xml:id="w.36">καὶ</w> <w xml:id="w.37">ἐπίηρα</w> <w xml:id="w.38">φέρει</w>
                            <pc xml:id="pc.6">.</pc>
                        </l>
                            <l>
                            <w xml:id="w.39">᾿Αλλὰ</w> <w xml:id="w.40">ϑέλει</w> <w xml:id="w.41">ἀγαπὴν</w> <w xml:id="w.42">τῇ</w> <w xml:id="w.43">αὑτοῦ</w> <w xml:id="w.44">Χριστὸς</w> <supplied>
                                <w xml:id="w.45">ὁμοίαν</w>
                            </supplied>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.46">ἐν</w> <w xml:id="w.47">κραδίαις</w> <w xml:id="w.48">ἁγνὴν</w> <w xml:id="w.49">ἔμμεναι</w> <w xml:id="w.50">ἡμετέραις</w>
                            <pc xml:id="pc.7">.</pc>
                        </l>
                            <l>
                            <w xml:id="w.51">Ἤπιος</w> <w xml:id="w.52">οὖν</w> <w xml:id="w.53">εὖ</w> <w xml:id="w.54">ποιήσει</w> <supplied>
                                <w xml:id="w.55">σὲ</w>
                            </supplied> <w xml:id="w.56">τεὴν</w> <w xml:id="w.57">ἀγαπῶντα</w>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.58">ἁρμοδίαν</w> <supplied>
                                <w xml:id="w.59">νύμφην</w>
                                <pc xml:id="pc.8">,</pc>
                            </supplied> <w xml:id="w.60">ὡς</w> <w xml:id="w.61">διέταξε</w> <w xml:id="w.62">νόμος</w>
                            <pc xml:id="pc.9">.</pc>
                        </l>
                        </lg>
                </exist:result>""";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        String expected = """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:compilation-time="0" exist:count="1" exist:execution-time="0" exist:hits="1" exist:start="1">
                    <lg xmlns="http://www.tei-c.org/ns/1.0">
                            <l>
                            <w xml:id="w.1">Νυμφίου</w> <w xml:id="w.2">ὡς</w> <w xml:id="w.3">κραδίη</w> <w xml:id="w.4">φλέγετ'</w> <w xml:id="w.5">ἐν</w> <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.8">τῆς</w> <w xml:id="w.9">νύμφης</w> <w xml:id="w.10">στοργῇ</w> <w xml:id="w.11">ἣν</w> <supplied>
                                <w xml:id="w.12">ἀγαπᾷ</w> <w xml:id="w.13">καϑαρᾷ</w>
                            </supplied>
                            <pc xml:id="pc.1">,</pc>
                        </l>
                            <l>
                            <w xml:id="w.14">οὕτως</w> <w xml:id="w.15">καὶ</w> <w xml:id="w.16">ὁ</w> <w xml:id="w.17">λόγος</w>
                            <supplied>
                                <pc xml:id="pc.2">,</pc>
                            </supplied> <w xml:id="w.18">τέκνον</w> <w xml:id="w.19">πατρὸς</w> <w xml:id="w.20">ἀϊδίοιο</w>
                            <pc xml:id="pc.3">,</pc>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.21">τῆς</w> <w xml:id="w.22">βροτέης</w> <w xml:id="w.23">φύσεως</w> <w xml:id="w.24">ἣν</w> <w xml:id="w.25">ἐνεδύσατ'</w>
                            <supplied>
                                <pc xml:id="pc.4">,</pc> <w xml:id="w.26">ἐρᾷ</w>
                            </supplied>
                            <pc xml:id="pc.5">.</pc>
                        </l>
                            <l>
                            <w xml:id="w.27">Ἧς</w> <supplied>
                                <w xml:id="w.28">ἕνεκ</w>
                            </supplied> <w xml:id="w.29">ἀνθρώπους</w> <w xml:id="w.30">μέλη</w> <w xml:id="w.31">ὥσπερ</w> <w xml:id="w.32">σύμφυτα</w> <w xml:id="w.33">ἄλλους</w>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.34">βαστάζει</w> <w xml:id="w.35">αὐτοῖς</w> <w xml:id="w.36">καὶ</w> <w xml:id="w.37">ἐπίηρα</w> <w xml:id="w.38">φέρει</w>
                            <pc xml:id="pc.6">.</pc>
                        </l>
                            <l>
                            <w xml:id="w.39">᾿Αλλὰ</w> <w xml:id="w.40">ϑέλει</w> <w xml:id="w.41">ἀγαπὴν</w> <w xml:id="w.42">τῇ</w> <w xml:id="w.43">αὑτοῦ</w> <w xml:id="w.44">Χριστὸς</w> <supplied>
                                <w xml:id="w.45">ὁμοίαν</w>
                            </supplied>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.46">ἐν</w> <w xml:id="w.47">κραδίαις</w> <w xml:id="w.48">ἁγνὴν</w> <w xml:id="w.49">ἔμμεναι</w> <w xml:id="w.50">ἡμετέραις</w>
                            <pc xml:id="pc.7">.</pc>
                        </l>
                            <l>
                            <w xml:id="w.51">Ἤπιος</w> <w xml:id="w.52">οὖν</w> <w xml:id="w.53">εὖ</w> <w xml:id="w.54">ποιήσει</w> <supplied>
                                <w xml:id="w.55">σὲ</w>
                            </supplied> <w xml:id="w.56">τεὴν</w> <w xml:id="w.57">ἀγαπῶντα</w>
                        </l>
                            <l rend="indent">
                            <w xml:id="w.58">ἁρμοδίαν</w> <supplied>
                                <w xml:id="w.59">νύμφην</w>
                                <pc xml:id="pc.8">,</pc>
                            </supplied> <w xml:id="w.60">ὡς</w> <w xml:id="w.61">διέταξε</w> <w xml:id="w.62">νόμος</w>
                            <pc xml:id="pc.9">.</pc>
                        </l>
                        </lg>
                </exist:result>""";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath targeting only complete elements to get the "
                + (trimmed ? "trimmed" : "untrimmed") + " and " + (indented ? "indented" : "unindented")
                + " fragment of the xml-document.");
    }

    @Disabled("Test failing on windows, needs fixing")
    @Test
    public void testGetXMLDocumentFragment7() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "concat(id(\"w.6\") | substring(id(\"w.7\"), 1, 1))";
        boolean trimmed = true;
        boolean indented = true;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2F%28%28id%28%22w.6%22%29%2Fancestor%3A%3A*+intersect+id%28%22w.7%22%29%2Fancestor%3A%3A*%29%5Blast%28%29-1%5D%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = """
                <exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:hits="1" exist:start="1" exist:count="1" exist:compilation-time="3" exist:execution-time="3">
                    <l xmlns="http://www.tei-c.org/ns/1.0">
                        <w xml:id="w.1">Νυμφίου</w> <w xml:id="w.2">ὡς</w> <w xml:id="w.3">κραδίη</w> <w xml:id="w.4">φλέγετ'</w> <w xml:id="w.5">ἐν</w> <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w>
                    </l>
                </exist:result>""";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        String expected = """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:compilation-time="3" exist:count="1" exist:execution-time="3" exist:hits="1" exist:start="1">
                    <l xmlns="http://www.tei-c.org/ns/1.0">
                             <w xml:id="w.6">στήθεσσιν</w> <w xml:id="w.7">ἔρωτι</w>
                    </l>
                </exist:result>""";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath targeting one complete element and one element, which was only partly selected"
                +  "(the xPath uses the substring()-function), to get the "
                + (trimmed ? "trimmed" : "untrimmed") + " and " + (indented ? "indented" : "unindented")
                + " fragment of the xml-document.");
    }

    @Test
    public void testGetXMLDocumentFragment8() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.1\")";
        boolean trimmed = false;
        boolean indented = false;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2Fid%28%22w.1%22%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = "<exist:result xmlns:exist=\"http://exist.sourceforge.net/NS/exist\" exist:hits=\"1\" exist:start=\"1\" exist:count=\"1\" exist:compilation-time=\"1\" exist:execution-time=\"1\"><w xmlns=\"http://www.tei-c.org/ns/1.0\" xml:id=\"w.1\">Νυμφίου</w></exist:result>";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        String expected = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><exist:result xmlns:exist=\"http://exist.sourceforge.net/NS/exist\" exist:compilation-time=\"1\" exist:count=\"1\" exist:execution-time=\"1\" exist:hits=\"1\" exist:start=\"1\"><w xmlns=\"http://www.tei-c.org/ns/1.0\" xml:id=\"w.1\">Νυμφίου</w></exist:result>";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath targeting a single complete element to get the "
                + (trimmed ? "trimmed" : "untrimmed") + " and " + (indented ? "indented" : "unindented")
                + " fragment of the xml-document.");
    }

    @Test
    public void testGetXMLDocumentFragment9() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.1\")";
        boolean trimmed = true;
        boolean indented = false;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2Fid%28%22w.1%22%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = "<exist:result xmlns:exist=\"http://exist.sourceforge.net/NS/exist\" exist:hits=\"1\" exist:start=\"1\" exist:count=\"1\" exist:compilation-time=\"0\" exist:execution-time=\"0\"><w xmlns=\"http://www.tei-c.org/ns/1.0\" xml:id=\"w.1\">Νυμφίου</w></exist:result>";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        String expected = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><exist:result xmlns:exist=\"http://exist.sourceforge.net/NS/exist\" exist:compilation-time=\"0\" exist:count=\"1\" exist:execution-time=\"0\" exist:hits=\"1\" exist:start=\"1\"><w xmlns=\"http://www.tei-c.org/ns/1.0\" xml:id=\"w.1\">Νυμφίου</w></exist:result>";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath targeting a single complete element to get the "
                + (trimmed ? "trimmed" : "untrimmed") + " and " + (indented ? "indented" : "unindented")
                + " fragment of the xml-document.");
    }

    @Disabled("Test failing on windows, needs fixing")
    @Test
    public void testGetXMLDocumentFragment10() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.1\")";
        boolean trimmed = true;
        boolean indented = true;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2Fid%28%22w.1%22%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = """
                <exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:hits="1" exist:start="1" exist:count="1" exist:compilation-time="0" exist:execution-time="0">
                    <w xmlns="http://www.tei-c.org/ns/1.0" xml:id="w.1">Νυμφίου</w>
                </exist:result>""";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        String expected = """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:compilation-time="0" exist:count="1" exist:execution-time="0" exist:hits="1" exist:start="1">
                    <w xmlns="http://www.tei-c.org/ns/1.0" xml:id="w.1">Νυμφίου</w>
                </exist:result>""";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath targeting a single complete element to get the "
                + (trimmed ? "trimmed" : "untrimmed") + " and " + (indented ? "indented" : "unindented")
                + " fragment of the xml-document.");
    }

    // document is not available/can not be found
    @Test
    public void testGetXMLDocumentFragment11() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.1\")";
        boolean trimmed = false;
        boolean indented = false;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2Fid%28%22w.1%22%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = "<exist:result xmlns:exist=\"http://exist.sourceforge.net/NS/exist\" exist:hits=\"0\" exist:start=\"1\" exist:count=\"0\" exist:compilation-time=\"0\" exist:execution-time=\"0\"/>";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(200);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        String expected = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><exist:result xmlns:exist=\"http://exist.sourceforge.net/NS/exist\" exist:compilation-time=\"0\" exist:count=\"0\" exist:execution-time=\"0\" exist:hits=\"0\" exist:start=\"1\"/>";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath, but the document is not available or the ids are not present in the document, hence no result is empty.");
    }

    // call to the exist-db failed
    @Test
    public void testGetXMLDocumentFragment12() throws IOException, InterruptedException, XPathExpressionException, ParserConfigurationException, TransformerException, SAXException {
        String documentId = "1";
        String xPath = "id(\"w.1\")";
        boolean trimmed = false;
        boolean indented = false;
        String URLqueryParameter = "%2F%2Fid%28%27" + idPrefix + documentId + "%27%29%2F%2Fid%28%22w.1%22%29";
        // mocked result from the exist-db, which resolved the query
        String mockedResponseBody = "Whatever error message is sent.";
        Mockito.when(mockedResponse.body()).thenReturn(mockedResponseBody);
        Mockito.when(mockedResponse.statusCode()).thenReturn(404);
        Mockito.when(mockedRequestHelper.get(baseUrl + restEndpoint + SEARCH_URL + URLqueryParameter + (indented ? "" : NO_INDENT_FLAG)))
                .thenReturn(mockedResponse);

        String expected = "Whatever error message is sent.";
        String actual = existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented);
        assertEquals(expected, actual, "Resolving xPath, but the response from the exist-db isn't  OK (200).");
    }
}
