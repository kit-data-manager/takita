// Common utils
import { createOption, setVisibility, toggleVisibility } from '../../common/utils';
import { selectAnnotation } from '../../common/annotationCard';
import { encodeAnnoId } from '../../common/utils';
// Texteditor specific utils
import { getTargetAnnotationId, getTargetFragment } from '../utils';
// projectspecifics
import { POSSIBLE_DIVISION_TYPES } from '../../projectspecific';

/**
 * Initialize a navigation bar with a given DOM element.
 *
 * Inspect the document to find the used text part type and create
 * callbacks for the existing UI elements which switch between
 * the different document parts.
 */
export function initializeNavigation($navBar, $text) {
  // Local state, closed over and modified by the various button callbacks
  let showAllDivisions = false;
  let currentDivisionLabel;

  // Text properties
  const divisionType = getDivisionType($text);
  const $divisions = $text.querySelectorAll('tei-div[type="' + divisionType + '"]');
  const divisionLabels = [...$divisions].map(getDivisionLabel);

  // No need for a navbar if there is only a single textPart
  if ($divisions.length > 1) {
    // UI elements
    const $prevButton = $navBar.querySelector('#prevChaptButton');
    const $nextButton = $navBar.querySelector('#nextChaptButton');
    const $gotoButton = $navBar.querySelector('#goToChaptButton');
    const $chapterSelect = $navBar.querySelector('#chapterSelect');
    const $showAllButton = $navBar.querySelector('#toggleShowAllButton');

    // Initialize Buttons
    $prevButton.innerHTML = 'Previous ' + divisionType;
    $gotoButton.innerHTML = 'Go to ' + divisionType;
    $nextButton.innerHTML = 'Next ' + divisionType;
    $showAllButton.innerHTML = 'Show all ' + divisionLabels + 's'; // yay for English pluralization rules

    // Hide all chapters initially
    setVisibility($divisions, false);

    // Fill select element with options
    divisionLabels.map(createOption).forEach((option) => $chapterSelect.appendChild(option));

    // Keep track of the label of the currently displayed text part. If an annotation has been
    // pre-selected as part of the URL, find the text part it belongs to and use this as default.
    // If none is selected use the first part as default and display it.
    const fragmentId = getTargetFragment();
    const preselectedAnnoTarget = getTargetElement(fragmentId, $text);
    const initialDivision = getTargetDivision(preselectedAnnoTarget, divisionType);
    currentDivisionLabel = initialDivision ? getDivisionLabel(initialDivision) : divisionLabels[0];
    selectDivision(currentDivisionLabel, $divisions);
    updateButtons(
      currentDivisionLabel,
      showAllDivisions,
      divisionLabels,
      $prevButton,
      $nextButton,
      $chapterSelect,
      $showAllButton,
    );

    // Define button callbacks
    const onClickGoTo = (_ev) => {
      currentDivisionLabel = $chapterSelect.value;
      selectDivision(currentDivisionLabel, $divisions);
      updateButtons(currentDivisionLabel, showAllDivisions, divisionLabels, $prevButton, $nextButton, $chapterSelect);
    };
    const onClickPrev = (_ev) => {
      const currentIdx = divisionLabels.indexOf(currentDivisionLabel);
      if (currentIdx > 0) {
        currentDivisionLabel = divisionLabels[currentIdx - 1];
        selectDivision(currentDivisionLabel, $divisions);
        updateButtons(currentDivisionLabel, showAllDivisions, divisionLabels, $prevButton, $nextButton, $chapterSelect);
      }
    };
    const onClickNext = (_ev) => {
      const currentIdx = divisionLabels.indexOf(currentDivisionLabel);
      if (currentIdx < divisionLabels.length - 1) {
        currentDivisionLabel = divisionLabels[currentIdx + 1];
        selectDivision(currentDivisionLabel, $divisions);
        updateButtons(currentDivisionLabel, showAllDivisions, divisionLabels, $prevButton, $nextButton, $chapterSelect);
      }
    };
    const onClickShowAll = (_ev) => {
      showAllDivisions = !showAllDivisions;
      if (showAllDivisions) {
        setVisibility($divisions, true);
        $showAllButton.innerHTML = 'Show only ' + divisionType + ' ' + currentDivisionLabel;
      } else {
        selectDivision(currentDivisionLabel);
        $showAllButton.innerHTML = 'Show all ' + divisionType + 's';
      }
      updateButtons(currentDivisionLabel, showAllDivisions, divisionLabels, $prevButton, $nextButton, $chapterSelect);
    };

    // Set up callbacks for all interactive UI elements
    $gotoButton.addEventListener('click', onClickGoTo);
    $prevButton.addEventListener('click', onClickPrev);
    $nextButton.addEventListener('click', onClickNext);
    $showAllButton.addEventListener('click', onClickShowAll);

    // After everything is set up, make navbar visible
    //console.log('make navbar visible');
    $navBar.classList.remove('is-hidden');

    if (preselectedAnnoTarget !== null) {
      const preselectedAnnotationId = getTargetAnnotationId();
      setTimeout(() => {
        preselectedAnnoTarget.scrollIntoView(true, {
          behavior: 'smooth',
        });
        navigateToAnnotation(preselectedAnnotationId);
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
export function navigateToAnnotation(targetAnnotationId) {
  if (targetAnnotationId) {
    selectAnnotation(null, encodeAnnoId(targetAnnotationId));
    const annoCard = document.getElementById('annotationCard');
    if (annoCard.classList.contains('is-hidden')) {
      toggleVisibility(annoCard);
    }
  }
}

/**
 * If an annotation is pre-selected via URL param, retrieve its Element in the text.
 * @param {String} fragmentId the id of the fragment which has been selected
 * @param {Element} $text the document in which the target element can be found
 * @returns {Element}
 */
export function getTargetElement(fragmentId, $text) {
  return $text.querySelector('#' + fragmentId);
}

/**
 * If an annotation is pre-selected, retrieve the division where it is located.
 * @param {Element} $targetElement the element which is the target of a selected annotation
 * @param {String} divisionType what is the desired granularity of our result
 * @returns {Element} the element of the text part in which targetElement is located
 */
export function getTargetDivision($targetElement, divisionType) {
  if ($targetElement) {
    const closestDivision = (node) => {
      if (node?.attributes?.type?.value === divisionType) {
        return node;
      }
      return closestDivision(node.parentNode);
    };

    const targetDivision = closestDivision($targetElement);
    return targetDivision;
  }
  return undefined;
}

/**
 * Hides all text parts which don't have the currently selected label.
 * @param {String} selectedLabel label of text part which should be displayed
 * @param {NodeList} $allDivisions DOM nodes representing all displayable text divisions
 */
export function selectDivision(selectedLabel, $allDivisions) {
  // Hide all text parts initially.
  setVisibility($allDivisions, false);
  // Display selected text parts.
  [...$allDivisions]
    .filter((tp) => getDivisionLabel(tp) === selectedLabel)
    .forEach((selected) => setVisibility(selected, true));
}

/**
 * Enable or disable buttons depending on currently selected text part label.
 * @param {String} selectedLabel label of the currently selected text part
 * @param {Boolean} showAllDivisions wether to ignore selection temporarily and show all divs instead
 * @param {Array} allTextPartLabels ordered list of all text part labels
 * @param {HTMLElement} $prev button which selects previous text part
 * @param {HTMLElement} $next button which selects next text part
 */
export function updateButtons(selectedLabel, showAllDivisions, allTextPartLabels, $prev, $next, $chapterSelect) {
  if (showAllDivisions) {
    // Prev and next buttons are confusing when _everything_ is shown anyway.
    $prev.disabled = true;
    $next.disabled = true;
  } else {
    $prev.disabled = allTextPartLabels.indexOf(selectedLabel) === 0;
    $next.disabled = allTextPartLabels.indexOf(selectedLabel) === allTextPartLabels.length - 1;
    $chapterSelect.value = selectedLabel;
  }
}

/**
 * Extract label for a text part DOM node.
 * @param {HTMLElement} $textPart
 * @returns {String}
 */
export function getDivisionLabel($textPart) {
  return $textPart.attributes.n.nodeValue;
}

/**
 * Check which types of text parts are present in the document.
 * Must be one of `POSSIBLE_DIVISION_TYPES` or "default".
 * @param {Element} $text the HTML element containing the document
 * @returns {String} the divisionType which is present in the text, or 'default' if none is found
 */
export function getDivisionType($text) {
  // setting divisionType based on the divisions used in the text
  const foundTypes = POSSIBLE_DIVISION_TYPES.filter(
    (possibility) => $text.querySelector('tei-div[type="' + possibility + '"]') != null,
  );
  return foundTypes.pop() || 'default';
}
