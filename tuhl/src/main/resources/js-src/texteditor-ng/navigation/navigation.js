//import { selectAnnotation } from '../../common/annotationDisplay';
//import { encodeAnnoId, toggleVisibility } from '../../common/utils';
import { createOption } from '../../common/utils';
import { getTargetAnnotationId, getTargetFragment } from '../utils/url';

const POSSIBLE_TEXT_PART_TYPES = ['chapter', 'section'];

/**
 * Initialize a navigation bar with a given DOM element.
 *
 * Inspect the document to find the used text part type and create
 * callbacks for the existing UI elements which switch between
 * the different document parts.
 */
export function initializeNavigation($navBar, $text) {
  //console.log('initializing nav bar');
  // Text properties
  const textPartType = getDivisionType($text);
  const textParts = $text.querySelectorAll('tei-div[type="' + textPartType + '"]');
  const textPartLabels = [...textParts].map(getLabel);

  // No need for a navbar if there is only a single textPart
  if (textParts.length > 1) {
    // UI elements
    const $prevButton = $navBar.querySelector('#prevChaptButton');
    const $nextButton = $navBar.querySelector('#nextChaptButton');
    const $gotoButton = $navBar.querySelector('#goToChaptButton');
    const $chapterSelect = $navBar.querySelector('#chapterSelect');

    // Initialize Buttons
    $prevButton.innerHTML = 'Previous ' + textPartType;
    $gotoButton.innerHTML = 'Go to ' + textPartType;
    $nextButton.innerHTML = 'Next ' + textPartType;

    // Hide all chapters initially
    textParts.forEach((tp) => tp.classList.add('is-hidden'));

    // Fill select element with options
    textPartLabels.map(createOption).forEach((option) => $chapterSelect.appendChild(option));

    // Keep track of the label of the currently displayed text part. If an annotation has been
    // pre-selected as part of the URL, find the text part it belongs to and use this as default.
    // If none is selected use the first part as default and display it.
    const fragmentId = getTargetFragment();
    const preselectedAnno = getTargetElement(fragmentId, textParts);
    const defaultTextPart = getTargetDivision(preselectedAnno, textPartType);
    let currentTextPartLabel = defaultTextPart ? getLabel(defaultTextPart) : textPartLabels[0];
    selectTextPart(currentTextPartLabel, textParts);
    updateButtons(currentTextPartLabel, textPartLabels, $prevButton, $nextButton, $chapterSelect);

    // Define button callbacks
    const onClickGoTo = (_ev) => {
      currentTextPartLabel = $chapterSelect.value;
      selectTextPart(currentTextPartLabel, textParts);
      updateButtons(currentTextPartLabel, textPartLabels, $prevButton, $nextButton, $chapterSelect);
    };
    const onClickPrev = (_ev) => {
      const currentIdx = textPartLabels.indexOf(currentTextPartLabel);
      if (currentIdx > 0) {
        currentTextPartLabel = textPartLabels[currentIdx - 1];
        selectTextPart(currentTextPartLabel, textParts);
        updateButtons(currentTextPartLabel, textPartLabels, $prevButton, $nextButton, $chapterSelect);
      }
    };
    const onClickNext = (_ev) => {
      const currentIdx = textPartLabels.indexOf(currentTextPartLabel);
      if (currentIdx < textPartLabels.length - 1) {
        currentTextPartLabel = textPartLabels[currentIdx + 1];
        selectTextPart(currentTextPartLabel, textParts);
        updateButtons(currentTextPartLabel, textPartLabels, $prevButton, $nextButton, $chapterSelect);
      }
    };

    // Set up callbacks for all interactive UI elements
    $gotoButton.addEventListener('click', onClickGoTo);
    $prevButton.addEventListener('click', onClickPrev);
    $nextButton.addEventListener('click', onClickNext);

    // After everything is set up, make navbar visible
    //console.log('make navbar visible');
    $navBar.classList.remove('is-hidden');

    if (preselectedAnno !== undefined) {
      setTimeout(() => {
        preselectedAnno.scrollIntoView(true, {
          behavior: 'smooth',
        });
      }, 100);
    }
  }
}

/** TODO: I actually don't believe that this should live in this module.
 *  While it is thematically about "navigating", this module is about the
 *  navigation bar, while this function essentially scrolls the text and displays
 *  a textcard.
 *  Maybe there should be a submodule, `navigation`, which is about showing/hiding
 *  certain segments of the document, and which might be a suitable place for a
 *  function like this.
 *  Then we could have a submodule `navbar` which renders the corresponding
 *  UI element and makes use of the `navigation` module for switching display.
 *  But the more I think about this all, the more I feel like there should be
 *  a very general `textdisplay` module, which provides all the essential
 *  text rendering related functionality to other UI modules. As it is, all the
 *  UI components mess with the text display all of the time, without clear
 *  responsibilities.
 */
// // TODO: merge this into the initializeNavbar function
// export function navigateToAnnotation(targetAnnotationId) {
//   if (targetAnnotationId) {
//     selectAnnotation(null, encodeAnnoId(targetAnnotationId));
//     const annoCard = document.getElementById('annotationCard');
//     if (annoCard.classList.contains('is-hidden')) {
//       toggleVisibility(annoCard);
//     }
//   }
// }

/**
 * If an annotation is pre-selected via URL param, retrieve its Element in the text.
 * @param {String} fragmentId the id of the fragment which has been selected
 * @param {Element} $text the document in which the target element can be found
 * @returns {Element}
 */
export function getTargetElement(fragmentId, $text) {
  return $text.querySelector(`#${fragmentId}`);
}

/**
 * If an annotation is pre-selected, retrieve the division where it is located.
 * @param {Element} targetElement the element which is the target of a selected annotation
 * @param {String} divisionType what is the desired granularity of our result
 * @returns {Element} the element of the text part in which targetElement is located
 */
export function getTargetDivision(targetElement, divisionType) {
  if (targetElement) {
    const closestDivision = (node) => {
      if (node?.attributes?.type?.value === divisionType) {
        return node;
      }
      return closestDivision(node.parentNode);
    };

    const targetDivision = closestDivision(targetElement);
    return targetDivision;
  }
  return undefined;
}

/**
 * Hides all text parts which don't have the currently selected label.
 * @param {String} selectedLabel label of text part which should be displayed
 * @param {Array} allTextParts DOM nodes representing all displayable text parts
 */
export function selectTextPart(selectedLabel, allTextParts) {
  allTextParts.forEach((tp) => tp.classList.add('is-hidden'));
  [...allTextParts]
    .filter((tp) => getLabel(tp) === selectedLabel)
    .forEach((selected) => selected.classList.remove('is-hidden'));
}

/**
 * Enable or disable buttons depending on currently selected text part label.
 * @param {String} selectedLabel label of the currently selected text part
 * @param {Array} allTextPartLabels ordered list of all text part labels
 * @param {HTMLElement} $prev button which selects previous text part
 * @param {HTMLElement} $next button which selects next text part
 */
export function updateButtons(selectedLabel, allTextPartLabels, $prev, $next, $chapterSelect) {
  $prev.disabled = allTextPartLabels.indexOf(selectedLabel) === 0;
  $next.disabled = allTextPartLabels.indexOf(selectedLabel) === allTextPartLabels.length - 1;
  $chapterSelect.value = selectedLabel;
}

/**
 * Extract label for a text part DOM node.
 * @param {HTMLElement} $textPart
 * @returns {String}
 */
export function getLabel($textPart) {
  return $textPart.attributes.n.nodeValue;
}

/**
 * Check which types of text parts are present in the document.
 * Must be one of `POSSIBLE_TEXT_PART_TYPES` or "default".
 * @param {Element} $text the HTML element containing the document
 * @returns {String} the divisionType which is present in the text, or 'default' if none is found
 */
export function getDivisionType($text) {
  // setting divisionType based on the divisions used in the text
  const foundTypes = POSSIBLE_TEXT_PART_TYPES.filter(
    (possibility) => $text.querySelector('tei-div[type="' + possibility + '"]') != null,
  );
  return foundTypes.pop() || 'default';
}
