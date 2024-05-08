import { fillMetaDataEditorTable } from '../../common/utils';
import { getAllAnnotationsData } from '../data/annotations';
// TODO: customize the function name of the following import. Leave the "as getProjectSpecificClasses" untouched
import { getSfb1475specificClasses as getProjectSpecificClasses } from '../utils';
import { checkIsTargetCompatible, makeTargetsCompatible, crc1475Highlighting } from '../utils';

/**
 * TODO: CUSTOMIZE to be the correct function for your project case
 * - defaultHighlighting is the standard function to highlight all targets of an annotation. Each
 *   a target, will get the 'defaultHighlight' class assigned, which just adds a background color
 * - crc1475Highlighting is the function used by CRC1475 to highlight all targets of an annotation.
 *   It assigns classes responsible for background colors and underlinings for the different
 *   annotation types.
 */
const highlightAnnotationFunction = defaultHighlighting;

// add the "defaulthighlighting" class to the project specific classes. The project specific classes
// get "fetched" by calling the getProjectSpecificClasses function, that can be customized
// (see the import statements).
const possibleClasses = ['defaulthighlight'].concat(getProjectSpecificClasses());

/**
 * remove all styles/css-classes from an element and its descendants
 *
 * @param {Element} $element which will have the classes removed from itself and its children
 * @param {[String]} possibleClasses list of all the possible css classes, that have been assigned
 * by the highlightAnnotationFunction().
 */
export function removeStyles($element, possibleClasses) {
  possibleClasses.forEach((cssClass) => {
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
function defaultHighlighting(annotation) {
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
    removeStyles(document.getElementById('TEI'), possibleClasses, hooks);
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
