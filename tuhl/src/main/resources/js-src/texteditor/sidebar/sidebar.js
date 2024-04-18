import { toggleOverview } from '../../common/utils';

/**
 * initializing the sidebar by adding eventListeners and tooltips
 *
 * @returns a boolean storing if the sidebar initialized (used for testing)
 */
export function initializeSidebar() {
  let initializedSidebar = false;

  // expand/hide sidebar
  document.getElementById('logo-name__icon').addEventListener('click', toggleAnnoSideBar);

  // font manipulation buttons
  document.getElementById('fontIncreaseButton').addEventListener('click', function () {
    hideExpandedSidebar();
    increaseFontSize();
  });
  document.getElementById('fontIncreaseSpan').addEventListener('click', function () {
    hideExpandedSidebar();
    increaseFontSize();
  });

  document.getElementById('fontDecreaseButton').addEventListener('click', function () {
    hideExpandedSidebar();
    decreaseFontSize();
  });
  document.getElementById('fontDecreaseSpan').addEventListener('click', function () {
    hideExpandedSidebar();
    decreaseFontSize();
  });

  document.getElementById('resetFontButton').addEventListener('click', function () {
    hideExpandedSidebar();
    resetFontSize();
  });
  document.getElementById('resetFontSpan').addEventListener('click', function () {
    hideExpandedSidebar();
    resetFontSize();
  });

  // show parts navigation
  document.getElementById('pagesButton').addEventListener('click', function () {
    hideExpandedSidebar();
    toggleOverview('pages');
  });
  document.getElementById('pagesSpan').addEventListener('click', function () {
    hideExpandedSidebar();
    toggleOverview('pages');
  });

  // enable the tooltips for the sidebar
  initializedSidebar = enableTooltips();

  return initializedSidebar;
}

/**
 * updates the sidebar for a given language (called by editor_text.html after
 * the text is loaded).
 * This function can be expanded to accomodate more texts/languages.
 *
 * @param {String} language of a text
 * @returns a boolean storing if the sidebar was update (used for testing)
 */
export function updateSidebar(language) {
  // storing if the sidebar was update
  let sidebarUpdated = false;
  // add language specific buttons
  sidebarUpdated = initializeSpecificButtons(language);
  return sidebarUpdated;
}

export function hideExpandedSidebar() {
  let sideBar = document.querySelector('.anno-side-bar');
  if (!sideBar.classList.contains('annocollapse')) {
    toggleAnnoSideBar();
  }
}

// toggling the side bar
// all text elements should not be hoverable when side bar is collapsed
export function toggleAnnoSideBar() {
  let sideBar = document.querySelector('.anno-side-bar');
  let arrowCollapse = document.querySelector('#logo-name__icon');
  let textElements = document.querySelectorAll('.features-item-text');
  sideBar.classList.toggle('annocollapse');
  arrowCollapse.classList.toggle('annocollapse');
  if (arrowCollapse.classList.contains('annocollapse')) {
    arrowCollapse.classList = 'bx bx-arrow-from-left logo-name__icon annocollapse';
    for (let element in textElements) {
      if (textElements[element].classList) {
        textElements[element].classList.add('annocollapse');
      }
    }
  } else {
    arrowCollapse.classList = 'bx bx-arrow-from-right logo-name__icon';
    for (let element in textElements) {
      if (textElements[element].classList) {
        textElements[element].classList.remove('annocollapse');
      }
    }
  }
}

// font size manipulation functions called by sidebar buttons
function changeFontSize(id, changeFactor) {
  const $txt = document.getElementById(id);
  const style = window.getComputedStyle($txt, null).getPropertyValue('font-size');
  const currentSize = parseFloat(style);
  $txt.style.fontSize = currentSize + changeFactor + 'px';
}

export function increaseFontSize() {
  changeFontSize('TEI', 1);
}

export function decreaseFontSize() {
  changeFontSize('TEI', -1);
}

export function resetFontSize() {
  document.getElementById('TEI').style.fontSize = 'initial';
}

// adds one box-icon and removes the other one from an element
export function toggleBoxIcon(element, iconA, iconB) {
  element.classList.toggle(iconA);
  element.classList.toggle(iconB);
}

// hebrew specific display
export function toggleHebrewView() {
  // adds the "zeroOpacity" class to a list of elements, to make the affected elements
  // invisible (/hide them) without moving anything aroung
  document.querySelectorAll('tei-reg').forEach((element) => {
    element.classList.toggle('zeroOpacity');
  });
  // slide the toggle button to the other side
  toggleBoxIcon(document.getElementById('toggleViewsButton'), 'bx-toggle-left', 'bx-toggle-right');
}

// sanskrit specific display
export function toggleSanskritView() {
  // hides elements/text by adding the "is-hidden" class (from chota), but moves the text around a bit
  document.querySelectorAll('tei-orig').forEach((element) => {
    element.classList.toggle('is-hidden');
  });
  // slide the toggle button to the other side
  toggleBoxIcon(document.getElementById('toggleViewsButton'), 'bx-toggle-left', 'bx-toggle-right');
}

/**
 *
 * @param {String} language of a text
 * @returns a boolean storing if the buttons are intialized (used for testing)
 */
function initializeSpecificButtons(language) {
  // storing if the buttons are intialized (used for testing)
  let initializedButtons = false;
  // B04 specific adding of a syllable marker between the unsandhied words
  // and activating the toggleViews button, which removes/adds
  // the sandhied version of the text to the display
  if (document.querySelector('tei-choice') != undefined) {
    if (language === 'sa-Latn' || document.querySelector('tei-choice').n === 'sandhi') {
      document.getElementById('toggleViews').classList.remove('is-hidden');
      document.getElementById('toggleViewsButton').addEventListener('click', function () {
        hideExpandedSidebar();
        toggleSanskritView();
      });
      document.getElementById('toggleViewsSpan').addEventListener('click', function () {
        hideExpandedSidebar();
        toggleSanskritView();
      });
      initializedButtons = true;
    }
  }

  // this is specific for files in hebrew
  // it enables the toggleViews button, which removes/adds
  // the unvocalized version of the text to the display
  if (language === 'hbo' && document.querySelector('tei-choice') != undefined) {
    document.getElementById('toggleViews').classList.remove('is-hidden');
    document.getElementById('toggleViewsButton').addEventListener('click', function () {
      hideExpandedSidebar();
      toggleHebrewView();
    });
    document.getElementById('toggleViewsSpan').addEventListener('click', function () {
      hideExpandedSidebar();
      toggleHebrewView();
    });
    // trigger the button to hide the unvocalized version on page load
    document.getElementById('toggleViewsButton').click();
    initializedButtons = true;
  }

  return initializedButtons;
}

/**
 * enables tooltips for the sidebar by creating a new div-element, which
 * is placed based on the item hovered by the user.
 * see: https://stackoverflow.com/questions/66382585/tooltip-inside-a-scrollable-component
 *
 * @returns a boolean storing if the tooltips got enabled (used for testing)
 */
export function enableTooltips() {
  let tooltipsEnabled = false;
  const hoverAreas = document.querySelectorAll('.features-item');
  const hoverTooltip = document.createElement('div');

  hoverTooltip.className = 'hoverTooltip';
  document.body.appendChild(hoverTooltip);

  hoverAreas.forEach((hoverArea) => {
    // Show the tooltip
    hoverArea.addEventListener('mouseenter', () => {
      hoverTooltip.innerHTML = hoverArea.querySelector('.tooltip').innerHTML;
      //tooltips.style.left = `${item.offsetLeft - cardContainer.scrollLeft}px`;
      hoverTooltip.style.top = `${hoverArea.getBoundingClientRect().top + 25}px`;
      hoverTooltip.style.display = 'block';
    });
    // Hide the tooltip
    hoverArea.addEventListener('mouseleave', () => {
      hoverTooltip.style.display = 'none';
    });

    tooltipsEnabled = true;
  });
  return tooltipsEnabled;
}
