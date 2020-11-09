package edu.kit.scc.dem.tuhl.editor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
public class AnnotationServiceTest {

   @Autowired
  AnnotationService annotationService;



  @BeforeEach
  void init(){
    MockitoAnnotations.initMocks(this);
    //annotationService = new AnnotationService(accessService);
  }

  @Test
  void createAnnotationFail (){
    //assertThrows (NullPointerException.class, () -> annotationService.createAnnotation(null, null, null, null));
  }

  @Test
  void createAnnotationTest (){
    //annotationService.createAnnotation(Color.DEFAULT, );
  }
}
