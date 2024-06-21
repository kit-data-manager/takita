import { fillMetaDataEditorTable } from '../../common/utils';
import { getAllAnnotationsData } from '../data/annotations';
import { checkIsTargetCompatible, makeTargetsCompatible } from '../utils';
import { highlightAnnotationFunction, possibleHighlightClasses } from '../../projectspecific';

/**
 * remove all styles/css-classes from an element and its descendants
 *
 * @param {Element} $element which will have the classes removed from itself and its children
 * @param {[String]} possibleClasses list of all the possible css classes, that have been assigned
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

  fillMetaDataEditorTable(annoJson);
}

/**
 * default function to highlight targets of annotations by assigning css-classes
 *
 * @param {Object} annotation to have its targets highlighted
 */
export function defaultHighlighting(annotation) {
  annotation.svg.forEach((target) => {
    const targetXmlId = target.split('"')[1];
    const targetElement = document.getElementById(targetXmlId);
    targetElement.classList.add('defaulthighlight');
  });
}

/**
 * main entry point, which fetches all annotations of a page, removes old highlighting and applies
 * new highlighting
 *
 * @param {*} hooks
 * @returns {[Object]} the most recent annoJson (all annotations of a page)
 */
export async function updateDisplay(hooks = {}) {
  try {
    // update annoJson to get the current tagging-body-values
    // as they are the basis for the highlighting
    let annoJson = await getAllAnnotationsData();
    // check if the annotations are compatible with the code, i.e. have
    // one xPath for each target and not one long xPath including all targets.
    // Make them compatible, if they are not
    annoJson = annoJson.map((annotation) => {
      if (!checkIsTargetCompatible(annotation)) {
        annotation.svg = makeTargetsCompatible(annotation);
      }
      return annotation;
    });
    // remove all styling/highlighting
    removeStyles(document.getElementById('TEI'), possibleHighlightClasses);
    // highlight all annotated words
    drawAnnos(annoJson);
    console.log('Display and annoJson: ', annoJson, ' updated successfully.');
    // TODO: this window variable could maybe be removed
    window.ANNOJSON = annoJson;
    return annoJson;
  } catch (error) {
    console.error('Display update failed ', error);
  }
}

/**
 * highlight the target (selected words) of the selected annotation
 *
 * @param {Object} selectedAnnotation annotation selected
 */
export function highlightSelectedAnnotationsTarget(selectedAnnotation) {
  // highlight words targetted by the currently selected annotation
  // remove old highlights (TODO: include this in removeStyles(el) in editor_xml.js)
  document.querySelectorAll('.selected').forEach((element) => element.classList.remove('selected'));
  // add a class to all the targets of the selected annotation
  selectedAnnotation.targets.forEach((target) => {
    const targetId = target.selector.xPath.split('"')[1];
    document.getElementById(targetId).classList.add('selected');
  });
}
