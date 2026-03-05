package edu.kit.datamanager.takita.dataaccess;

import edu.kit.datamanager.takita.assistance.IAssistanceService;
import edu.kit.datamanager.takita.configuration.SecurityConfiguration;
import edu.kit.datamanager.takita.dataaccess.existDb.ExistDbRestController;
import edu.kit.datamanager.takita.dataaccess.existDb.IXMLDbAccessService;
import edu.kit.datamanager.takita.mainpage.search.ISearchIndexService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import java.io.IOException;
import java.util.Base64;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExistDbRestController.class)
@TestPropertySource("classpath:application-test.properties")
@Import(SecurityConfiguration.class)
public class ExistDbRestControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IXMLDbAccessService existDbAccessService;

    //necessary for the test to run, not used though
    @MockBean
    private IAssistanceService mockedAssistanceService;
    //necessary for the test to run, not used though
    @MockBean
    private ISearchIndexService mockedSearchIndexService;

    // all xml documents in this test class are based on the texts from "Stigel, Johann: Ioannis Stigelii Elegia, Qua Celebratur Dignitas Et Fructus Legitimi coniugij.
    // Scripta in nuptijs Doctissimi viri Davidis Chytraei professoris Academiae Rostochiana. Wittenberg 1553." The text was converted into XML by CRC1475
    // and will be available on zenodo by June 2026.
    @Test
    public void testGetXMLDocument() throws Exception {
        String documentId = "1";
        Mockito.when(existDbAccessService.getXMLDocument(documentId + "io")).thenThrow(IOException.class);
        Mockito.when(existDbAccessService.getXMLDocument(documentId + "int")).thenThrow(InterruptedException.class);

        this.mockMvc.perform(get("/exist/" + documentId + "io"))
                .andExpect(status().isInternalServerError())
                .andDo(MockMvcResultHandlers.print());

        this.mockMvc.perform(get("/exist/" + documentId + "int"))
                .andExpect(status().isInternalServerError())
                .andDo(MockMvcResultHandlers.print());

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
        Mockito.when(existDbAccessService.getXMLDocument(documentId)).thenReturn(expected);
        this.mockMvc.perform(get("/exist/" + documentId).accept(MediaType.APPLICATION_XML))
                .andExpect(status().isOk())
                // using "application/xml;charset=UTF-8" here instead of MediaType.APPLICATION_XML to match the
                // contentType properly. MediaType.APPLICATION_XML does not include the encoding.
                .andExpect(content().contentType("application/xml;charset=UTF-8"))
                .andExpect(content().xml(expected))
                .andDo(MockMvcResultHandlers.print());
    }

    @Test
    public void testGetXMLDocumentFragment() throws Exception {
        String documentId = "1";
        String xPath = "id(\"w.1\")";
        String encodedXPath = Base64.getEncoder().encodeToString(xPath.getBytes());
        boolean trimmed = true;
        boolean indented = true;
        String query = String.format("?xPath=%s&trimmed=%s&indented=%s", encodedXPath, trimmed, indented);
        Mockito.when(existDbAccessService.getXMLDocumentFragment(documentId + "io", xPath, trimmed, indented)).thenThrow(IOException.class);
        Mockito.when(existDbAccessService.getXMLDocumentFragment(documentId + "int", xPath, trimmed, indented)).thenThrow(InterruptedException.class);

        this.mockMvc.perform(get("/exist/" + documentId + "io" + query))
                .andExpect(status().isInternalServerError())
                .andDo(MockMvcResultHandlers.print());

        this.mockMvc.perform(get("/exist/" + documentId + "int" + query))
                .andExpect(status().isInternalServerError())
                .andDo(MockMvcResultHandlers.print());

        String expected = """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><exist:result xmlns:exist="http://exist.sourceforge.net/NS/exist" exist:compilation-time="0" exist:count="1" exist:execution-time="0" exist:hits="1" exist:start="1">
                    <w xmlns="http://www.tei-c.org/ns/1.0" xml:id="w.1">Νυμφίου</w>
                </exist:result>""";
        Mockito.when(existDbAccessService.getXMLDocumentFragment(documentId, xPath, trimmed, indented)).thenReturn(expected);

        this.mockMvc.perform(get("/exist/" + documentId + query).accept(MediaType.APPLICATION_XML))
                .andExpect(status().isOk())
                // using "application/xml;charset=UTF-8" here instead of MediaType.APPLICATION_XML to match the
                // contentType properly. MediaType.APPLICATION_XML does not include the encoding.
                .andExpect(content().contentType("application/xml;charset=UTF-8"))
                .andExpect(content().xml(expected))
                .andDo(MockMvcResultHandlers.print());
    }
}
