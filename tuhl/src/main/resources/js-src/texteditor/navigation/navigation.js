// internal modules
import { selectAnnotation } from '../../common/annotationDisplay';
import { encodeAnnoId, toggleOverview } from '../../common/utils';

const POSSIBLE_TEXT_PART_TYPES = ['chapter', 'section'];

/**
 * Initialize a navigation bar with a given DOM element.
 *
 * Inspect the document to find the used text part type and create
 * callbacks for the existing UI elements which switch between
 * the different document parts.
 */
export function initializeNavigation($navBar) {
  //console.log('initializing nav bar');
  // Text properties
  const textPartType = getDivisionType();
  const textParts = document.querySelectorAll('tei-div[type="' + textPartType + '"]');
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

    // Keep track of the label of the currently displayed text part. Use the either a pre-selected
    // text part, or if none is selected use the first part as default and display it.
    const preselectedAnno = getTargetElement();
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
    console.log('make navbar visible');
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

// TODO: merge this into the initializeNavbar function
export function navigateToAnnotation(targetAnnotationId) {
  if (targetAnnotationId) {
    selectAnnotation(null, encodeAnnoId(targetAnnotationId));
    if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
      toggleOverview('annotationCard');
    }
  }
}

/**
 * If an annotation is pre-selected via URL param, retrieve its Element in the text.
 * @returns {Element}
 */
function getTargetElement() {
  const searchParams = new URL(window.location).searchParams;
  if (searchParams.size > 0 && searchParams.get('fragment')) {
    return document.getElementById(searchParams.get('fragment'));
  }
  return undefined;
}

/**
 * If an annotation is pre-selected, retrieve the division where it is located.
 */
function getTargetDivision(targetElement, divisionType) {
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
 * Get the ID of a pre-selected annotation (if any).
 */
export function getTargetAnnotationId() {
  const searchParams = new URL(window.location).searchParams;
  if (searchParams.size > 0 && searchParams.get('annotationId')) {
    return searchParams.get('annotationId');
  } else {
    return undefined;
  }
}

/**
 * Create <option> Element with a specific label and value.
 * @param {String} label what is used both as label and value of the option
 * @returns {HTMLElement} a <option> element
 */
function createOption(label) {
  const option = document.createElement('option');
  option.value = label;
  const text = document.createTextNode(label);
  option.appendChild(text);
  return option;
}

/**
 * Hides all text parts which don't have the currently selected label.
 * @param {String} selectedLabel label of text part which should be displayed
 * @param {Array} allTextParts DOM nodes representing all displayable text parts
 */
function selectTextPart(selectedLabel, allTextParts) {
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
function updateButtons(selectedLabel, allTextPartLabels, $prev, $next, $chapterSelect) {
  $prev.disabled = allTextPartLabels.indexOf(selectedLabel) === 0;
  $next.disabled = allTextPartLabels.indexOf(selectedLabel) === allTextPartLabels.length - 1;
  $chapterSelect.value = selectedLabel;
}

/**
 * Extract label for a text part DOM node.
 * @param {HTMLElement} textPart
 * @returns {String}
 */
function getLabel(textPart) {
  return textPart.attributes.n.nodeValue;
}

/**
 * Check which types of text parts are present in the document.
 * Must be one of `POSSIBLE_TEXT_PART_TYPES` or "default".
 * @returns {String}
 */
function getDivisionType() {
  let divisionType = 'default';

  // setting divisionType based on the divisions used in the text
  POSSIBLE_TEXT_PART_TYPES.forEach((possibility) => {
    if (document.querySelector('tei-div[type="' + possibility + '"]') != null) {
      divisionType = possibility;
    }
  });

  return divisionType;
}
