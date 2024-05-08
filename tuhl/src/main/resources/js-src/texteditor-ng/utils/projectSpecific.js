import { toggleBoxIcon, toggleOpacity, toggleVisibility } from '../../common/utils';
import { getAnnotationData } from '../data';

/**
 * Utility functions which are specific to a subproject or which provide
 * specialized functionality which is only needed for certain documents.
 *
 * @module projectSpecific
 */

// TEXTLOADER
/**
 * Sum Type which specifies if the current text document has special requirements.
 */
export class Variant {
  static Default = new Variant('Default');
  static B04 = new Variant('B04');
  static Hebrew = new Variant('Hebrew');

  constructor(name) {
    this.name = name;
  }
}

/**
 * Determine whether the current document belongs to a specific subproject
 * and/or language which has special requirements.
 *
 * @param {Element} $text the text document
 * @param {String} language the document language
 * @returns {Variant}
 */
export function determineVariant($text, language) {
  let variant = Variant.Default;

  // The presence of 'tei-choice' elements and their contents is our main
  // indicator for a specific document variant.
  const teiChoice = $text.querySelector('tei-choice');

  if (teiChoice && (language === 'sa-Latn' || teiChoice.n === 'sandhi')) {
    variant = Variant.B04;
  } else if (teiChoice !== undefined && language === 'hbo') {
    variant = Variant.Hebrew;
  }

  return variant;
}

// SIDEBAR
/**
 * hebrew specific display
 */
export function toggleHebrewView() {
  const $textElements = document.querySelectorAll('tei-reg');
  const $button = document.querySelector('#toggleViewsButton');
  toggleOpacity($textElements);
  // slide the toggle button to the other side
  toggleBoxIcon($button, 'bx-toggle-left', 'bx-toggle-right');
}

// sanskrit specific display
export function toggleSanskritView() {
  // querySelectorAll('tei-orig')
  // '#toggleViewsButton'
  const $textElements = document.querySelectorAll('tei-orig');
  const $button = document.querySelector('#toggleViewsButton');
  toggleVisibility($textElements);
  // slide the toggle button to the other side
  toggleBoxIcon($button, 'bx-toggle-left', 'bx-toggle-right');
}

// HIGHLIGHT
/**
 * Called by getPossibleClasses() hook. It returns the classes specific to a project (linked
 * to classes assigned in drawAnnos() function).
 * Note: to have these classes do smth, the css has to written (see editor_text.css). css for
 * 'backgroundOne', 'backgroundTwo', 'underline', 'underlineSecond' and 'defaulthighlight'
 * is available.
 *
 * @returns {[String]} holding all classes that can be assigned/removed
 */
export function getSfb1475specificClasses() {
  // TODO: Customise the following array
  return ['backgroundOne', 'backgroundTwo', 'underline', 'underlineSecond'];
}

/**
 * check if any target of an annotation is already highlighted
 *
 * @param {[String]}} targets holds all targets of an annotation
 * @returns {Boolean} true, if any target/word is already highlighted as another
 * annotation targets the same word
 * false, if none of the targets/words of the annotation is highlighted
 */
function checkIsATargetAlreadyHighlighted(targets) {
  const alreadyHighlighted = targets.some((target) => {
    let targetXmlId = target.split('"')[1];
    if (document.getElementById(targetXmlId).classList.contains('underline')) {
      return true;
    } else {
      return false;
    }
  });
  return alreadyHighlighted;
}

/**
 * assigns css-classes to an element.
 * TODO: Customize the cases to achieve custom highlighting of different annotations,
 * based on the color. See the java code in:
 * - "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
 * - "takita/tuhl/src/main/resources/static/js/creation_templates_text.js"
 * and the js code in 'projectSpecific.js/getProjectSpecificClasses().
 * This is linked to classes to be removed in removeStyles() function.
 *
 * @param {Element} $element to be highlihgted/assigned a css class
 * @param {Object} annotation the annotation
 * @param {Integer} index of the target in the targets(svg) array of the annotation. Used to
 * determine if the targetted $element is the last entry in the array
 * @param {Boolean} alreadyHighlighted true, if any target/word is already highlighted as another
 * annotation targets the same word
 * false, if none of the targets/words of the annotation is highlighted
 */
function assignStyle($element, annotation, index, alreadyHighlighted) {
  // different highlights for different annotation types
  switch (annotation.color) {
    case '#000021':
      // if a word is not highlighted add the "metaphor" class, if it is
      // already highlighted add "metaphorSecond"
      if (!alreadyHighlighted) {
        $element.classList.add('underline');
      } else {
        $element.classList.add('underlineSecond');
      }

      // if a word is followed only by whitespace add the "whitespaceAfter" class
      // unless its the last word of the target.
      // TODO: this doesn't work for overlapping annotations. The "whitespaceAfter" class will
      // be assigned even if the word is the last target for one annotation as the word is part of multiple
      // annotations and it might be the last target of one annotation but not the other one
      // This is needed to create overlapping boxshadows.
      // check if nextSibling is null first
      if ($element.nextSibling !== null) {
        if ($element.nextSibling.textContent.trim() === '' && !(index === annotation.svg.length - 1)) {
          $element.classList.add('whitespaceAfter');
        }
      } else {
        $element.classList.add('whitespaceAfter');
      }
      break;
    case '#000011':
      $element.classList.add('backgroundOne');
      break;
    case '#000012':
      $element.classList.add('backgroundOne');
      break;
    case '#000013':
      $element.classList.add('backgroundOne');
      break;
    case '#000014':
      $element.classList.add('backgroundTwo');
      break;
    default:
      // this is not ideal, but without the if clause, most of words
      // will get the defaulthighlighting class
      if (
        annotation.color === '#000021' ||
        annotation.color === '#000011' ||
        annotation.color === '#000012' ||
        annotation.color === '#000013' ||
        annotation.color === '#000014'
      ) {
        // nothing will happen
      } else {
        $element.classList.add('defaulthighlight');
        //console.log("Tag value not matching the possible cases, 'defaulthighlight'
        // class added for:", annotation);
      }
  }
}

/**
 * crc1475 specific highlighting function. It is used as the highlightAnnotationFunction() in
 * highlight/target.js
 *
 * @param {Object} annotation to have its target highlighted
 */
export function crc1475Highlighting(annotation) {
  // check if any target has the class "underline" and
  // therefore, is already highlighted
  const alreadyHighlighted = checkIsATargetAlreadyHighlighted(annotation.svg);

  // adding classes to highlight annotations
  annotation.svg.forEach((target, index) => {
    const targetXmlId = target.split('"')[1];
    const targetElement = document.getElementById(targetXmlId);

    // if color is available assign css class
    if (annotation.color) {
      assignStyle(targetElement, annotation.color, index, alreadyHighlighted);
    } else {
      // if no color is available, assign default
      targetElement.classList.add('defaulthighlight');
    }
  });
}

// DATA
// gets the describing body of an annotation (mrw-annotation)
// used by src/main/resources/js-src/common/annotationDisplay/selection.js
export async function getMRWAnnoSelectedText(metaphorAnnoId, mrwAnnoId) {
  try {
    const mrwAnnotation = await getAnnotationData(mrwAnnoId);
    const describingBody = mrwAnnotation.textCards.filter((textCard) => textCard.purpose === 'describing')[0];
    return describingBody.value;
  } catch (exception) {
    // if the mrw-annotation linked to the metaphor-annotation got deleted or something else went
    // wrong while fetching the annotation, the code will end up here
    console.log(
      `ERROR: Something is wrong with the linked mrw-annotation; 
      most likely it got deleted, please contact the developers`,
      exception,
    );
  }
}
