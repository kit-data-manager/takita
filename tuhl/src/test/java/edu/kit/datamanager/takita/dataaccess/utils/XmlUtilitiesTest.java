package edu.kit.datamanager.takita.dataaccess.utils;

import edu.kit.datamanager.takita.model.Manuscript;
import edu.kit.datamanager.takita.model.TeiTitle;
import org.junit.jupiter.api.Test;

import javax.xml.namespace.NamespaceContext;
import java.time.Instant;
import java.util.List;

import static edu.kit.datamanager.takita.dataaccess.utils.XmlUtilities.addTeiMetadata;
import static edu.kit.datamanager.takita.dataaccess.utils.XmlUtilities.getNamespaceContext;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;


public class XmlUtilitiesTest {

    @Test
    public void testAddTeiMetadata() {
        String xmlString = """
                <?xml version="1.0" encoding="UTF-8"?>
                <?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
                <?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml"?>
                <TEI xmlns="http://www.tei-c.org/ns/1.0">
                    <teiHeader xml:lang="en" xmlns="http://www.tei-c.org/ns/1.0">
                        <fileDesc>
                            <titleStmt>
                                <title level="s" xml:lang="de">Serien Titel</title>
                                <title level="s">series title</title>
                                <title level="s" type="main">main series title</title>
                                <title level="s" type="sub">subordinate series title</title>
                                <title level="s" type="alt">alternative series title</title>
                                <title level="s" type="short">short series title</title>
                                <title level="s" type="desc">descriptive series title</title>
                                <title level="m">monographic title</title>
                                <title level="a">analytic title</title>
                                <title level="j">journal title</title>
                                <title level="u">unpublished title</title>
                                <title>title</title>
                                <author>
                                    <persName>Fore name Last name</persName>
                                    <persName>Vorname Nachname</persName>
                                </author>
                                <author>
                                    <persName>Fore name Middle name Last name</persName>
                                </author>
                            </titleStmt>
                            <publicationStmt>
                                <ab/>
                            </publicationStmt>
                            <sourceDesc>
                                <ab/>
                            </sourceDesc>
                        </fileDesc>
                        <profileDesc>
                            <creation>
                                <date type="file" when="2022-07-07">7. July 2022</date>
                                <date type="distribution" when="2022-07-07">7. July 2022</date>
                                <date type="manuscript" from="-0650" to="-0450">650-450 BCE</date>
                                <date type="preaching" from="1555-12" to="1609">December 1539–1609</date>
                                <date type="publication" notBefore="1539" notAfter="1609">ca. 1539–1609</date>
                            </creation>
                        </profileDesc>
                    </teiHeader>
                    <text>
                        <body>
                            <ab/>
                        </body>
                    </text>
                </TEI>
                """;
        Manuscript manuscript = new Manuscript("1", Instant.parse("2019-07-04T07:03:03Z"), "myManuscript", "Name", 2000);

        addTeiMetadata(manuscript, xmlString);

        // all assertion check, whether the information was retrieved from the matching elements
        List<String> teiAuthors = manuscript.getTeiAuthor();
        assertEquals(2, teiAuthors.size());
        assertEquals("Fore name Last name (Vorname Nachname)", teiAuthors.get(0));
        assertEquals("Fore name Middle name Last name", teiAuthors.get(1));

        List<TeiTitle> teiSeriesTitles = manuscript.getTeiTitleSeries();
        assertEquals(7, teiSeriesTitles.size());
        assertEquals("s", teiSeriesTitles.get(0).getLevel());
        assertEquals("s", teiSeriesTitles.get(1).getLevel());
        assertEquals("s", teiSeriesTitles.get(2).getLevel());
        assertEquals("de", teiSeriesTitles.get(0).getLanguage());
        assertEquals("Serien Titel", teiSeriesTitles.get(0).getContent());
        assertEquals("series title", teiSeriesTitles.get(1).getContent());
        assertEquals("main", teiSeriesTitles.get(2).getType());
        assertEquals("sub", teiSeriesTitles.get(3).getType());
        assertEquals("alt", teiSeriesTitles.get(4).getType());
        assertEquals("short", teiSeriesTitles.get(5).getType());
        assertEquals("desc", teiSeriesTitles.get(6).getType());

        List<TeiTitle> teiAnalyticTitles = manuscript.getTeiTitleAnalytic();
        assertEquals(1, teiAnalyticTitles.size());
        assertEquals("a", teiAnalyticTitles.get(0).getLevel());
        assertEquals("analytic title", teiAnalyticTitles.get(0).getContent());

        List<TeiTitle> teiMonographicTitles = manuscript.getTeiTitleMonographic();
        assertEquals(1, teiMonographicTitles.size());
        assertEquals("m", teiMonographicTitles.get(0).getLevel());
        assertEquals("monographic title", teiMonographicTitles.get(0).getContent());

        List<TeiTitle> teiDefaultTitles = manuscript.getTeiTitle();
        assertEquals(3, teiDefaultTitles.size());
        assertEquals("journal title", teiDefaultTitles.get(0).getContent());
        assertEquals("unpublished title", teiDefaultTitles.get(1).getContent());
        assertEquals("title", teiDefaultTitles.get(2).getContent());
    }

// TODO: is this test necessary? When does it throw the exception anyways
//    @Test
//    public void testFailToAddTeiTitle() {
//        String xmlString = """
//                <?xml version="1.0" encoding="UTF-8"?>
//                <?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
//                <?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml"?>
//                <TEI xmlns="http://www.tei-c.org/ns/1.0">
//                    <teiHeader xml:lang="en" xmlns="http://www.tei-c.org/ns/1.0">
//                        <fileDesc>
//                            <titleStmt>
//                                <title></title>
//                                <author>
//                                    <persName>Fore name Middle name Last name</persName>
//                                </author>
//                            </titleStmt>
//                            <publicationStmt>
//                                <ab/>
//                            </publicationStmt>
//                            <sourceDesc>
//                                <ab/>
//                            </sourceDesc>
//                        </fileDesc>
//                        <profileDesc>
//                            <creation>
//                                <date type="file" when="2022-07-07">7. July 2022</date>
//                                <date type="distribution" when="2022-07-07">7. July 2022</date>
//                                <date type="manuscript" from="-0650" to="-0450">650-450 BCE</date>
//                                <date type="preaching" from="1555-12" to="1609">December 1539–1609</date>
//                                <date type="publication" notBefore="1539" notAfter="1609">ca. 1539–1609</date>
//                            </creation>
//                        </profileDesc>
//                    </teiHeader>
//                    <text>
//                        <body>
//                            <ab/>
//                        </body>
//                    </text>
//                </TEI>
//                """;
//        Manuscript manuscript = new Manuscript("1", Instant.parse("2019-07-04T07:03:03Z"), "myManuscript", "Name", 2000);
//
//        addTeiMetadata(manuscript, xmlString);
//    }

    @Test
    public void testFailToAddTeiAuthor() {
        // the author can not be set as the author-element does not contain a persName element
        String xmlString = """
                <?xml version="1.0" encoding="UTF-8"?>
                <?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
                <?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml"?>
                <TEI xmlns="http://www.tei-c.org/ns/1.0">
                    <teiHeader xml:lang="en" xmlns="http://www.tei-c.org/ns/1.0">
                        <fileDesc>
                            <titleStmt>
                                <title>test</title>
                                <author>Unknown</author>
                            </titleStmt>
                            <publicationStmt>
                                <ab/>
                            </publicationStmt>
                            <sourceDesc>
                                <ab/>
                            </sourceDesc>
                        </fileDesc>
                        <profileDesc>
                            <creation>
                                <date type="file" when="2022-07-07">7. July 2022</date>
                                <date type="distribution" when="2022-07-07">7. July 2022</date>
                                <date type="manuscript" from="-0650" to="-0450">650-450 BCE</date>
                                <date type="preaching" from="1555-12" to="1609">December 1539–1609</date>
                                <date type="publication" notBefore="1539" notAfter="1609">ca. 1539–1609</date>
                            </creation>
                        </profileDesc>
                    </teiHeader>
                    <text>
                        <body>
                            <ab/>
                        </body>
                    </text>
                </TEI>
                """;
        Manuscript manuscript = new Manuscript("1", Instant.parse("2019-07-04T07:03:03Z"), "myManuscript", "Name", 2000);

        addTeiMetadata(manuscript, xmlString);

        List<String> teiAuthors = manuscript.getTeiAuthor();
        assertNull(teiAuthors);
    }

    @Test
    public void testGetNameSpaceContext() {
        NamespaceContext namespaceContext = getNamespaceContext();

        assertEquals("http://www.tei-c.org/ns/1.0", namespaceContext.getNamespaceURI("tei"));
        assertEquals("http://www.w3.org/2001/XInclude", namespaceContext.getNamespaceURI("xi"));
        assertEquals("http://www.w3.org/XML/1998/namespace", namespaceContext.getNamespaceURI("xml"));
        assertEquals("http://exist.sourceforge.net/NS/exist", namespaceContext.getNamespaceURI("exist"));
        assertNull(namespaceContext.getNamespaceURI("null"));
        assertNull(namespaceContext.getPrefixes("null"));
        assertNull(namespaceContext.getPrefix("null"));
    }

    @Test
    void testAddDates() {
        String teiString = """
                <TEI xmlns="http://www.tei-c.org/ns/1.0">
                    <teiHeader xml:lang="en">
                            <profileDesc>
                                <creation>
                                    <date when="2015-11-16">16. November 2015</date>
                                    <date notBefore="2015">Likely 2015 or after</date>
                                </creation>
                            </profileDesc>
                    </teiHeader>
                </TEI>
                """;

        Manuscript manuscript = new Manuscript("1234", Instant.now(), "", "", 2025);

        addTeiMetadata(manuscript, teiString);

        assertEquals("2015-11-16", manuscript.getTeiManuscriptCreationDate().getFirst().getWhenDate().toString());
        assertEquals("2015-01-01", manuscript.getTeiManuscriptCreationDate().getLast().getNotBeforeDate().toString());
    }
}
