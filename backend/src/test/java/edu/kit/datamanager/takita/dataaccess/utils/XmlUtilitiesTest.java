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
                        </fileDesc>
                    </teiHeader>
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
        assertEquals("s", teiSeriesTitles.get(0).level());
        assertEquals("s", teiSeriesTitles.get(1).level());
        assertEquals("s", teiSeriesTitles.get(2).level());
        assertEquals("de", teiSeriesTitles.get(0).language());
        assertEquals("Serien Titel", teiSeriesTitles.get(0).content());
        assertEquals("series title", teiSeriesTitles.get(1).content());
        assertEquals("main", teiSeriesTitles.get(2).type());
        assertEquals("sub", teiSeriesTitles.get(3).type());
        assertEquals("alt", teiSeriesTitles.get(4).type());
        assertEquals("short", teiSeriesTitles.get(5).type());
        assertEquals("desc", teiSeriesTitles.get(6).type());

        List<TeiTitle> teiAnalyticTitles = manuscript.getTeiTitleAnalytic();
        assertEquals(1, teiAnalyticTitles.size());
        assertEquals("a", teiAnalyticTitles.get(0).level());
        assertEquals("analytic title", teiAnalyticTitles.get(0).content());

        List<TeiTitle> teiMonographicTitles = manuscript.getTeiTitleMonographic();
        assertEquals(1, teiMonographicTitles.size());
        assertEquals("m", teiMonographicTitles.get(0).level());
        assertEquals("monographic title", teiMonographicTitles.get(0).content());

        List<TeiTitle> teiDefaultTitles = manuscript.getTeiTitle();
        assertEquals(3, teiDefaultTitles.size());
        assertEquals("journal title", teiDefaultTitles.get(0).content());
        assertEquals("unpublished title", teiDefaultTitles.get(1).content());
        assertEquals("title", teiDefaultTitles.get(2).content());
    }

    @Test
    public void testFailToAddTitleAndAddUnknownTeiAuthor() {
        // the title can not be set as the title element is empty
        String xmlString = """
                <?xml version="1.0" encoding="UTF-8"?>
                <?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
                <?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml"?>
                <TEI xmlns="http://www.tei-c.org/ns/1.0">
                    <teiHeader xml:lang="en" xmlns="http://www.tei-c.org/ns/1.0">
                        <fileDesc>
                            <titleStmt>
                                <title/>
                                <author>Unknown</author>
                            </titleStmt>
                            <publicationStmt>
                                <ab/>
                            </publicationStmt>
                            <sourceDesc>
                                <ab/>
                            </sourceDesc>
                        </fileDesc>
                        <profileDesc/>
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
        List<TeiTitle> teiTitle = manuscript.getTeiTitle();
        assertEquals(1, teiAuthors.size());
        assertEquals("Unknown", teiAuthors.get(0));
        assertNull(teiTitle);
    }

    @Test
    public void testFailToAddTeiAuthor() {
        // the author can not be set as the author-element is empty
        String xmlString = """
                <?xml version="1.0" encoding="UTF-8"?>
                <?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
                <?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml"?>
                <TEI xmlns="http://www.tei-c.org/ns/1.0">
                    <teiHeader xml:lang="en" xmlns="http://www.tei-c.org/ns/1.0">
                        <fileDesc>
                            <titleStmt>
                                <title/>
                                <author/>
                            </titleStmt>
                            <publicationStmt>
                                <ab/>
                            </publicationStmt>
                            <sourceDesc>
                                <ab/>
                            </sourceDesc>
                        </fileDesc>
                        <profileDesc/>
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
                                    <date when="-0300">A very long time ago</date>
                                    <date to="2026-01-07T10:30:50Z">A very recent very precise point in time</date>
                                </creation>
                            </profileDesc>
                    </teiHeader>
                </TEI>
                """;

        Manuscript manuscript = new Manuscript("1234", Instant.now(), "", "", 2025);

        addTeiMetadata(manuscript, teiString);

        assertEquals("2015-11-16", manuscript.getTeiManuscriptCreationDate().getFirst().getWhenDate().toString());
        assertEquals("2015-01-01", manuscript.getTeiManuscriptCreationDate().get(1).getNotBeforeDate().toString());
        assertEquals("-0300-01-01", manuscript.getTeiManuscriptCreationDate().get(2).getWhenDate().toString());
        assertEquals("2026-01-07", manuscript.getTeiManuscriptCreationDate().get(3).getToDate().toString());
    }

    @Test
    void testAddUnsuitableDates() {
        String teiString = """
                <TEI xmlns="http://www.tei-c.org/ns/1.0">
                    <teiHeader xml:lang="en">
                            <profileDesc>
                                <creation>
                                    <date when="--09-11">9/11</date>
                                    <date when="--09">September</date>
                                    <date when="---11">Eleventh of the month</date>
                                </creation>
                            </profileDesc>
                    </teiHeader>
                </TEI>
                """;

        Manuscript manuscript = new Manuscript("1234", Instant.now(), "", "", 2025);

        addTeiMetadata(manuscript, teiString);

        assertEquals("9/11", manuscript.getTeiManuscriptCreationDate().getFirst().getContent());
        assertNull(manuscript.getTeiManuscriptCreationDate().getFirst().getWhenDate());

        assertEquals("September", manuscript.getTeiManuscriptCreationDate().get(1).getContent());
        assertNull(manuscript.getTeiManuscriptCreationDate().getFirst().getWhenDate());

        assertEquals("Eleventh of the month", manuscript.getTeiManuscriptCreationDate().get(2).getContent());
        assertNull(manuscript.getTeiManuscriptCreationDate().getFirst().getWhenDate());
    }
}
