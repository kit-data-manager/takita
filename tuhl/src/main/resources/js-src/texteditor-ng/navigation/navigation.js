// external imports
import { escapeSelector } from 'jquery';
// internal imports
// Common utils
import { createOption, setDisplay, toggleVisibility } from '../../common/utils';
import { selectAnnotation } from '../../common/annotationCard';
import { encodeAnnoId } from '../../common/utils';
// projectspecifics
import { POSSIBLE_DIVISION_TYPES } from '../../projectspecific';

// global state, modified by the various button callbacks.
// It's needed to track the visible divisions to show only
// the previously visible divisions after using the $showAllButton.
let currentDivisionLabelTop;
let currentDivisionLabelLow;

/**
 * Initialize navigation bars with a given DOM element.
 *
 * Inspect the document to find the used text part type and create
 * callbacks for the existing UI elements which switch between
 * the different document parts.
 * @param {Element} $navBarTop the top-level navigation bar to be initialized
 * @param {Element} $navBarLow the low-level navigation bar to be initialized
 * @param {Element} $text in which the text is stored
 * @param {String} fragmentId the id of the first word of the annotation target, which should be displayed
 * @param {String} annotationId the id of the annotation, that should be preselected
 * @param {[Object]} [hooks] to be passed to navigateToAnnotation() and then to selectAnnotation(),
 * where they influence the rendering of the annotationCard
 */
export async function initializeNavigation($navBarTop, $navBarLow, $text, fragmentId, annotationId, hooks = {}) {
  // Local state, closed over and modified by the various button callbacks
  let showAllDivisions = false;

  // Text properties
  const [divisionTypeTop, divisionTypeLow] = getDivisionTypes(
    $text,
    POSSIBLE_DIVISION_TYPES.top,
    POSSIBLE_DIVISION_TYPES.low,
  );
  const hasMultiLevelDivision = divisionTypeLow != 'default' ? true : false;
  const $divisions = $text.querySelectorAll('tei-div[type="' + divisionTypeTop + '"]');
  const divisionLabels = [...$divisions].map(getDivisionLabel);

  // Keep track of the label of the currently displayed text part. If an annotation has been
  // pre-selected as part of the URL, find the text part it belongs to and use this as default.
  // If none is selected use the first part as default and display it.
  const preselectedAnnoTarget = getTargetElement(fragmentId, $text);
  const initialDivision = getTargetDivision(preselectedAnnoTarget, divisionTypeTop);
  currentDivisionLabelTop = initialDivision ? getDivisionLabel(initialDivision) : divisionLabels[0];

  // No need for a navbar if there is only a single textPart
  if ($divisions.length > 1) {
    // UI elements
    const $prevButton = $navBarTop.querySelector('#prevChaptButton');
    const $nextButton = $navBarTop.querySelector('#nextChaptButton');
    const $gotoButton = $navBarTop.querySelector('#goToChaptButton');
    const $chapterSelect = $navBarTop.querySelector('#chapterSelect');
    const $showAllButton = $navBarTop.querySelector('#toggleShowAllButton');

    // Initialize Buttons
    $prevButton.innerHTML = 'Previous ' + divisionTypeTop;
    $gotoButton.innerHTML = 'Go to ' + divisionTypeTop;
    $nextButton.innerHTML = 'Next ' + divisionTypeTop;
    $showAllButton.innerHTML = 'Show all ' + divisionLabels + 's'; // yay for English pluralization rules

    // Hide all chapters initially
    setDisplay($divisions, false);

    // Fill select element with options
    divisionLabels.map(createOption).forEach((option) => $chapterSelect.appendChild(option));

    selectDivision(currentDivisionLabelTop, $divisions);
    updateButtons(
      divisionTypeTop,
      currentDivisionLabelTop,
      showAllDivisions,
      divisionLabels,
      $prevButton,
      $nextButton,
      $chapterSelect,
      $showAllButton,
    );

    // Define button callbacks
    const onClickGoTo = (_ev) => {
      currentDivisionLabelTop = $chapterSelect.value;
      showAllDivisions = false;
      selectDivision(currentDivisionLabelTop, $divisions);
      updateButtons(
        divisionTypeTop,
        currentDivisionLabelTop,
        showAllDivisions,
        divisionLabels,
        $prevButton,
        $nextButton,
        $chapterSelect,
        $showAllButton,
      );
      if (hasMultiLevelDivision) {
        const $currentDivision = [...$divisions].filter((tp) => getDivisionLabel(tp) === currentDivisionLabelTop).pop();
        initializeNavigationLow($navBarLow, $currentDivision, divisionTypeLow, undefined, undefined);
      }
    };
    const onClickPrev = (_ev) => {
      const currentIdx = divisionLabels.indexOf(currentDivisionLabelTop);
      showAllDivisions = false;
      if (currentIdx > 0) {
        currentDivisionLabelTop = divisionLabels[currentIdx - 1];
        selectDivision(currentDivisionLabelTop, $divisions);
        updateButtons(
          divisionTypeTop,
          currentDivisionLabelTop,
          showAllDivisions,
          divisionLabels,
          $prevButton,
          $nextButton,
          $chapterSelect,
          $showAllButton,
        );
      }
      if (hasMultiLevelDivision) {
        const $currentDivision = [...$divisions].filter((tp) => getDivisionLabel(tp) === currentDivisionLabelTop).pop();
        initializeNavigationLow($navBarLow, $currentDivision, divisionTypeLow, undefined, undefined);
      }
    };
    const onClickNext = (_ev) => {
      const currentIdx = divisionLabels.indexOf(currentDivisionLabelTop);
      showAllDivisions = false;
      if (currentIdx < divisionLabels.length - 1) {
        currentDivisionLabelTop = divisionLabels[currentIdx + 1];
        selectDivision(currentDivisionLabelTop, $divisions);
        updateButtons(
          divisionTypeTop,
          currentDivisionLabelTop,
          showAllDivisions,
          divisionLabels,
          $prevButton,
          $nextButton,
          $chapterSelect,
          $showAllButton,
        );
      }
      if (hasMultiLevelDivision) {
        const $currentDivision = [...$divisions].filter((tp) => getDivisionLabel(tp) === currentDivisionLabelTop).pop();
        initializeNavigationLow($navBarLow, $currentDivision, divisionTypeLow, undefined, undefined);
      }
    };
    const onClickShowAll = (_ev) => {
      showAllDivisions = !showAllDivisions;
      if (showAllDivisions) {
        setDisplay($divisions, true);
        // showing all low-level divisions and hiding the low-level navbar
        if (hasMultiLevelDivision) {
          const $divisionsLow = $text.querySelectorAll('tei-div[type="' + divisionTypeLow + '"]');
          console.log($divisionsLow.length, $divisionsLow);
          setDisplay($divisionsLow, true);
          setDisplay($navBarLow, false);
        }
      } else {
        selectDivision(currentDivisionLabelTop, $divisions);
        // initialize the low-level navbar with its former state (regarding the previously shown
        // low-level division), if necessary
        if (hasMultiLevelDivision) {
          const $currentDivision = [...$divisions]
            .filter((tp) => getDivisionLabel(tp) === currentDivisionLabelTop)
            .pop();
          initializeNavigationLow($navBarLow, $currentDivision, divisionTypeLow, currentDivisionLabelLow, undefined);
        }
      }
      updateButtons(
        divisionTypeTop,
        currentDivisionLabelTop,
        showAllDivisions,
        divisionLabels,
        $prevButton,
        $nextButton,
        $chapterSelect,
        $showAllButton,
      );
    };

    // Set up callbacks for all interactive UI elements
    $gotoButton.addEventListener('click', onClickGoTo);
    $prevButton.addEventListener('click', onClickPrev);
    $nextButton.addEventListener('click', onClickNext);
    $showAllButton.addEventListener('click', onClickShowAll);

    // After everything is set up, make navbar visible
    //console.log('make navbar visible');
    setDisplay($navBarTop, true);
  }

  if (hasMultiLevelDivision) {
    const $currentDivision = [...$divisions].filter((tp) => getDivisionLabel(tp) === currentDivisionLabelTop).pop();
    // Note: as this is the first initialization of the lower navigation bar, the target of a pre-selected
    // annotation should be displayed, hence the fragmentId is passed
    initializeNavigationLow($navBarLow, $currentDivision, divisionTypeLow, undefined, fragmentId);
  }

  // scroll to the first element targeted by an annotaiton, if an annotation should
  // be displayed. The element should be visible as both navigation bars are initialized and
  // during their initializitation the navBars show the necessary chapter.
  if (preselectedAnnoTarget !== null) {
    setTimeout(async () => {
      preselectedAnnoTarget.scrollIntoView(true, {
        behavior: 'smooth',
      });
      await navigateToAnnotation(annotationId, hooks);
    }, 100);
  }
}

/**
 * initialize the low-level (second-level) navigation bar.
 *
 * create callbacks for the existing UI elements which switch between
 * the different document parts (divisions).
 *
 * @param {Element} $navBar the low-level navigation bar to be initialized
 * @param {Element} $text in which the text is stored
 * @param {String} divisionTypeLow the low-level division type used in the $text
 * @param {String} previouslyShownDivisionLabel the number/label of the previously shown low-level division;
 * necessary for the $showAllButton of the top-level navigation bar to work properly (i.e. that the
 * right low-level division is shown as well after returning from fully displayed text)
 * @param {String} fragmentId the id of the first word of the annotation target, which should be displayed
 */
export async function initializeNavigationLow(
  $navBar,
  $text,
  divisionTypeLow,
  previouslyShownDivisionLabel,
  fragmentId,
) {
  // hiding the navBar initially as there might not be more than one division
  setDisplay($navBar, false);
  // Local state, closed over and modified by the various button callbacks
  let showAllDivisions = false;

  // Text properties
  if ($text.querySelector('tei-div[type="' + divisionTypeLow + '"]')) {
    const $divisions = $text.querySelectorAll('tei-div[type="' + divisionTypeLow + '"]');
    const divisionLabels = [...$divisions].map(getDivisionLabel);

    // No need for a navbar if there is only a single textPart
    if ($divisions.length > 1) {
      // UI elements
      const $prevButton = $navBar.querySelector('#prevChaptButtonLow');
      const $nextButton = $navBar.querySelector('#nextChaptButtonLow');
      const $gotoButton = $navBar.querySelector('#goToChaptButtonLow');
      const $chapterSelect = $navBar.querySelector('#chapterSelectLow');
      const $showAllButton = $navBar.querySelector('#toggleShowAllButtonLow');

      // Initialize Buttons
      $prevButton.innerHTML = 'Previous ' + divisionTypeLow;
      $gotoButton.innerHTML = 'Go to ' + divisionTypeLow;
      $nextButton.innerHTML = 'Next ' + divisionTypeLow;
      $showAllButton.innerHTML = 'Show all ' + divisionLabels + 's'; // yay for English pluralization rules

      // Hide all chapters initially
      setDisplay($divisions, false);

      // Fill select element with options
      // removing old values first
      while ($chapterSelect.lastElementChild) {
        $chapterSelect.removeChild($chapterSelect.lastElementChild);
      }
      divisionLabels.map(createOption).forEach((option) => $chapterSelect.appendChild(option));

      // Keep track of the label of the currently displayed text part.
      // If the initializeNavigationLow() is called to show only one division after
      // everything was shown, show the previously shown individual lower division, tracked in the
      // global state. It will be undefined on page load.
      // If an annotation has been pre-selected as part of the URL, find the text part it belongs
      // to and use this as default. If none is selected use the first part as default and display it. This
      // only happens on page load.
      // Therefor, on page load the division targetted by an annotation will be displayed, if given;
      // on interactions with the showAllButton the previously shown lower division, will
      // be displayed.
      // on page load: show low level division targetted by annotation, if given or the first low level division
      // on press on next top level button: show the first low level division
      // on press on showAllButton to only show one low level division: show the previously shown lower division
      const preselectedAnnoTarget = getTargetElement(fragmentId, $text);
      const initialDivision = getTargetDivision(preselectedAnnoTarget, divisionTypeLow);
      currentDivisionLabelLow = previouslyShownDivisionLabel
        ? previouslyShownDivisionLabel
        : initialDivision
          ? getDivisionLabel(initialDivision)
          : divisionLabels[0];

      selectDivision(currentDivisionLabelLow, $divisions);
      updateButtons(
        divisionTypeLow,
        currentDivisionLabelLow,
        showAllDivisions,
        divisionLabels,
        $prevButton,
        $nextButton,
        $chapterSelect,
        $showAllButton,
      );

      // Define button callbacks
      const onClickGoTo = (_ev) => {
        currentDivisionLabelLow = $chapterSelect.value;
        showAllDivisions = false;
        selectDivision(currentDivisionLabelLow, $divisions);
        updateButtons(
          divisionTypeLow,
          currentDivisionLabelLow,
          showAllDivisions,
          divisionLabels,
          $prevButton,
          $nextButton,
          $chapterSelect,
          $showAllButton,
        );
      };
      const onClickPrev = (_ev) => {
        const currentIdx = divisionLabels.indexOf(currentDivisionLabelLow);
        showAllDivisions = false;
        if (currentIdx > 0) {
          currentDivisionLabelLow = divisionLabels[currentIdx - 1];
          selectDivision(currentDivisionLabelLow, $divisions);
          updateButtons(
            divisionTypeLow,
            currentDivisionLabelLow,
            showAllDivisions,
            divisionLabels,
            $prevButton,
            $nextButton,
            $chapterSelect,
            $showAllButton,
          );
        }
      };
      const onClickNext = (_ev) => {
        const currentIdx = divisionLabels.indexOf(currentDivisionLabelLow);
        showAllDivisions = false;
        if (currentIdx < divisionLabels.length - 1) {
          currentDivisionLabelLow = divisionLabels[currentIdx + 1];
          selectDivision(currentDivisionLabelLow, $divisions);
          updateButtons(
            divisionTypeLow,
            currentDivisionLabelLow,
            showAllDivisions,
            divisionLabels,
            $prevButton,
            $nextButton,
            $chapterSelect,
            $showAllButton,
          );
        }
      };
      const onClickShowAll = (_ev) => {
        showAllDivisions = !showAllDivisions;
        if (showAllDivisions) {
          setDisplay($divisions, true);
        } else {
          selectDivision(currentDivisionLabelLow, $divisions);
        }
        updateButtons(
          divisionTypeLow,
          currentDivisionLabelLow,
          showAllDivisions,
          divisionLabels,
          $prevButton,
          $nextButton,
          $chapterSelect,
          $showAllButton,
        );
      };

      // Set up callbacks for all interactive UI elements
      $gotoButton.onclick = onClickGoTo;
      $prevButton.onclick = onClickPrev;
      $nextButton.onclick = onClickNext;
      $showAllButton.onclick = onClickShowAll;

      // After everything is set up, make navbar visible
      //console.log('make navbar visible');
      setDisplay($navBar, true);
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
export async function navigateToAnnotation(targetAnnotationId, hooks = {}) {
  if (targetAnnotationId) {
    window.SELECTED_ANNOTATION = await selectAnnotation(null, encodeAnnoId(targetAnnotationId), hooks);
    const annoCard = document.getElementById('annotationCard');
    if (annoCard.classList.contains('invisible')) {
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
  return $text.querySelector('#' + escapeSelector(fragmentId));
}

/**
 * If an annotation is pre-selected, retrieve the division where it is located.
 * @param {Element} $targetElement the element which is the target of a selected annotation
 * @param {String} divisionType what is the desired granularity of our result
 * @returns {Element} the element of the text part in which targetElement is located
 */
export function getTargetDivision($targetElement, divisionType) {
  if ($targetElement) {
    // get the parent of a node. It should be a tei-div-element with a "@type" attribute,
    // which value is equal to the divisionType function parameter.
    // The function calls itself recursively until it either gets the correct tei-div or the
    // container element of the tei document in the DOM (the container is a div with
    // the ID "TEI")
    const closestDivision = (node) => {
      if (node.id != 'TEI') {
        if (node?.attributes?.type?.value === divisionType) {
          return node;
        }
        return closestDivision(node.parentNode);
      } else {
        return undefined;
      }
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
  setDisplay($allDivisions, false);
  // Display selected text parts.
  [...$allDivisions]
    .filter((tp) => getDivisionLabel(tp) === selectedLabel)
    .forEach((selected) => setDisplay(selected, true));
}

/**
 * Enable or disable buttons depending on currently selected text part label.
 * @param {String} divisionType which is present in the text,
 * @param {String} selectedLabel label of the currently selected text part
 * @param {Boolean} showAllDivisions wether to ignore selection temporarily and show all divs instead
 * @param {Array} allTextPartLabels ordered list of all text part labels
 * @param {HTMLElement} $prev button which selects previous text part
 * @param {HTMLElement} $next button which selects next text part
 * @param {HTMLElement} $chapterSelect button which selects a specific part
 * @param {HTMLElement} $showAllButton button which hides all parts/shows the current part
 */
export function updateButtons(
  divisionType,
  selectedLabel,
  showAllDivisions,
  allTextPartLabels,
  $prev,
  $next,
  $chapterSelect,
  $showAllButton,
) {
  if (showAllDivisions) {
    // Prev and next buttons are confusing when _everything_ is shown anyway.
    $prev.disabled = true;
    $next.disabled = true;
    $showAllButton.innerHTML = 'Show only ' + divisionType + ' ' + selectedLabel;
  } else {
    $prev.disabled = allTextPartLabels.indexOf(selectedLabel) === 0;
    $next.disabled = allTextPartLabels.indexOf(selectedLabel) === allTextPartLabels.length - 1;
    $chapterSelect.value = selectedLabel;
    $showAllButton.innerHTML = 'Show all ' + divisionType + 's';
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
 * determines which of the found division types is the superordinate one
 * by checking if elements having one division type contain elements having
 * another division type.
 *
 * @param {Element} $text containing the tei-xml text
 * @param {[String]} foundTypes division types present in the text
 * @returns {String} the superordinate/top-level division type
 */
function getTopLevelDivisionType($text, foundTypes) {
  let topLevelDivisionType;
  // comparing each type to every other type to find the superordinate one.
  // The elements of the superordinate one will contain elements with the other one.
  foundTypes.forEach((typeA) => {
    foundTypes.forEach((typeB) => {
      if ($text.querySelector('tei-div[type="' + typeA + '"]') != null) {
        let divisions = $text.querySelectorAll('tei-div[type="' + typeA + '"]');
        if (divisions) {
          let divisionsArray = Array.from(divisions);
          if (divisionsArray.some(($division) => $division.querySelector('tei-div[type="' + typeB + '"]') != null)) {
            topLevelDivisionType = typeA;
          }
        }
      }
    });
  });

  return topLevelDivisionType;
}

/**
 * This can be tricky as sometimes the possibleDivisionTypesTop and possibleDivisionTypesLow overlap.
 * Eg. text 1 is divided into:
 *   - "book"
 *     - "chapter"
 * and text 2 into
 *   - "chapter"
 *     - "section"
 * and text 3 into
 *   - "section"
 *     - "subsection"
 * Therefor "chapter" and "section" can both be top- and low-level division types.
 *
 * @param {Element} $text containing the tei-xml text
 * @param {[String]} possibleDivisionTypesTop all possible top-level division types
 * @param {[String]} possibleDivisionTypesLow all possible low-level division types
 * @returns {[String]} the divisionTypes which are present in the text, or 'default'
 * for the ones not found. It holds the top-level division type as a first and the low-level
 * divsion type as the second entry.
 */
export function getDivisionTypes($text, possibleDivisionTypesTop, possibleDivisionTypesLow) {
  const foundTypesTop = possibleDivisionTypesTop.filter(
    (possibility) => $text.querySelector('tei-div[type="' + possibility + '"]') != null,
  );
  const foundTypesLow = possibleDivisionTypesLow.filter(
    (possibility) => $text.querySelector('tei-div[type="' + possibility + '"]') != null,
  );

  // setting default values in case the function returns early
  let typeTop = 'default';
  let typeLow = 'default';

  // logic to identify the top-level division type:
  // - use the found top-level types
  // - unless none were found, in that case use the low-level types instead
  if (foundTypesTop.length == 1) {
    typeTop = foundTypesTop.pop();
  } else if (foundTypesTop.length > 1) {
    // as a division type can be present in the top- and low-level list of possible
    // division types.
    // Not setting the typeLow here as it is set later by only using the possibleDivisionTypesLow.
    typeTop = getTopLevelDivisionType($text, foundTypesTop);
  } else if (foundTypesTop.length == 0 && foundTypesLow.length == 1) {
    // if only a low level division type could be found, return it as a top level one
    // as there only needs to be a single division navigation anyways.
    // Return early to prevent the low-level type to be set again later
    // as it is set to be the top-level type already.
    typeTop = foundTypesLow.pop();
    return [typeTop, typeLow];
  } else if (foundTypesTop.length == 0 && foundTypesLow.length > 1) {
    // if only a low level division types could be found, return it as a top level one
    // as there only needs to be a single division navigation anyways.
    // Return early to prevent the low-level type to be set again later
    // as it is set already.
    typeTop = getTopLevelDivisionType($text, foundTypesLow);
    // distinguish the found low-level types, by finding out, which one is the superordinate one and
    // choosing the other one
    typeLow = foundTypesLow.find((types) => types != typeTop);
    return [typeTop, typeLow];
  }

  // logic to identify the low-level division type
  // this part of code might be skipped, if the low-level type was identified
  // as a top-level type by the code above
  if (foundTypesLow.length == 1) {
    typeLow = foundTypesLow.pop();
  } else if (foundTypesLow.length > 1) {
    // distinguish the found low-level types, by finding out, which one is the superordinate one and
    // choosing the other one
    typeLow = foundTypesLow.find((types) => types != getTopLevelDivisionType($text, foundTypesLow));
  }

  return [typeTop, typeLow];
}
