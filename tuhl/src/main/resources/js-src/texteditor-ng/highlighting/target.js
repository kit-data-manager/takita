import { highlightAnnotationFunction } from '../projectspecific';
import { escapeSelector } from 'jquery';

/**
 * remove all styles/css-classes from the descendant of an element
 *
 * @param {Element} $element which will have the classes removed from its children
 * @param {[String]} possibleHighlightClasses list of all the possible css classes, that have been assigned
 * by the highlightAnnotationFunction().
 */
export function removeStyles($element, possibleHighlightClasses) {
  possibleHighlightClasses.forEach((cssClass) => {
    const affectedElements = $element.querySelectorAll('.' + cssClass);
    affectedElements.forEach(($element) => $element.classList.remove(cssClass));
  });
}

/**
 * draw/highlight all annotation targets by assigning css-classes and fill
 * the metadata editor table for all annotations
 *
 * @param {[Object]} annoJson containing all annotations
 */
export function drawAnnos(annoJson) {
  annoJson.forEach((annotation) => {
    highlightAnnotationFunction(annotation);
  });
}

/**
 * default function to highlight targets of annotations by assigning css-classes
 *
 * @param {Object} annotation to have its targets highlighted, eg.:
 * {
    "id": "5ffb6dce-18ee-4932-b489-d2505865f730",
    "idEncoded": "5ffb6dce-18ee-4932-b489-d2505865f730",
    "svg": [
      "id(\"w.2_1_6_6-99\")",
      "id(\"w.2_1_6_6-100\")",
      "id(\"w.2_1_6_6-101\")",
      "id(\"w.2_1_6_6-102\")"
    ],
    "visible": true,
    "created": "2024-06-07T08:50:42Z",
    "creator": "[]",
    "modified": "2024-06-07T08:50:42Z",
    "motivation": "describing",
    "tags": []
  }
 * 
 */
export function defaultHighlighting(annotation) {
  annotation.svg.forEach((selector) => {
    switch (selector.type) {
      case 'XPathSelector': {
        const values = selector.value instanceof Array ? selector.value : [selector.value];
        values.forEach((value) => {
          const targetXmlId = value.split('"')[1];
          const targetElement = document.getElementById(targetXmlId);
          targetElement.classList.add('defaulthighlight');
          targetElement.classList.add('selected');
        });

        break;
      }
      case 'TextQuoteSelector':
        console.warn('Implement textQuoteSelector highlighting pls');
        break;
    }
  });
}

/**
 * highlight the target (selected words) of the selected annotation
 *
 * @param {Object} selectedAnnotation annotation selected
 * @param {Element} $text the element holding the text, that can be annotated and highlighted
 */
export function highlightSelectedAnnotationsTarget(selectedAnnotation, $text) {
  // remove old highlights
  removeStyles($text, ['selected']);
  // add a class to all the targets of the selected annotation, if an annotation is selected
  if (selectedAnnotation) {
    selectedAnnotation.targets.forEach((target) => {
      if (target.selector?.exact) {
        console.warn('Implement textQuoteSelector highlighting for selectedAnnotaiton pls');
      } else {
        const targetId = target.selector.xPath.split('"')[1];
        $text.querySelector('#' + escapeSelector(targetId)).classList.add('selected');
      }
    });
  }
}
