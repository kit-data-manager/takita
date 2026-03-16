package edu.kit.datamanager.takita.model.page;

import edu.kit.datamanager.takita.model.Annotation;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class PageTest {

    @Test
    void addAnnoToImagePageTest() {
        ImagePage imgPage = new ImagePage("1234", ResourceType.IMAGE, "42", Instant.now(), "http://example.com", "http://example.com/thumb");

        Annotation testAnno = new Annotation();
        Instant annoCreationDate = Instant.now();
        testAnno.setCreated(annoCreationDate);

        imgPage.addAnnotation(testAnno);

        assertEquals(annoCreationDate, imgPage.getAnnotations().get(0).getCreated());
    }

    @Test
    void addAnnoToTextPageTest() {
        TextPage txtPage = new TextPage("1234", ResourceType.TEXT, "42", Instant.now(), "http://example.com");

        Annotation testAnno = new Annotation();
        Instant annoCreationDate = Instant.now();
        testAnno.setCreated(annoCreationDate);

        txtPage.addAnnotation(testAnno);

        assertEquals(annoCreationDate, txtPage.getAnnotations().get(0).getCreated());
    }
}
