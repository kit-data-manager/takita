import { toggleOverview } from '../../common/utils';

export function initializeSidebar() {
  // go home button
  document.getElementById('goHomeButton').addEventListener('click', goHome);

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

  // sho parts navigatoion
  document.getElementById('pagesButton').addEventListener('click', function () {
    hideExpandedSidebar();
    toggleOverview('pages');
  });
  document.getElementById('pagesSpan').addEventListener('click', function () {
    hideExpandedSidebar();
    toggleOverview('pages');
  });

  // enable the tooltips for the sidebar
  enableTooltips();
}

export function updateSidebar(language) {
  // add language specific buttons
  initializeSpecificButtons(language);
}

// returning to table view of repository data
function goHome() {
  location.href = window.CONTEXTPATH;
}

export function hideExpandedSidebar() {
  let sideBar = document.querySelector('.anno-side-bar');
  if (!sideBar.classList.contains('annocollapse')) {
    toggleAnnoSideBar();
  }
}

// toggling the side bar
// all text elements should not be hoverable when side bar is collapsed
function toggleAnnoSideBar() {
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

function increaseFontSize() {
  changeFontSize('TEI', 1);
}

function decreaseFontSize() {
  changeFontSize('TEI', -1);
}

function resetFontSize() {
  document.getElementById('TEI').style.fontSize = 'initial';
}

// adds one box-icon and removes the other one from an element
function toggleBoxIcon(element, iconA, iconB) {
  element.classList.toggle(iconA);
  element.classList.toggle(iconB);
}

// hebrew specific display
function toggleHebrewView() {
  // adds the "zeroOpacity" class to a list of elements, to make the affected elements
  // invisible (/hide them)
  document.querySelectorAll('tei-reg').forEach((element) => {
    element.classList.toggle('zeroOpacity');
  });
  // slide the toggle button to the other side
  toggleBoxIcon(document.getElementById('toggleViewsButton'), 'bx-toggle-left', 'bx-toggle-right');
}

// sanskrit specific display
function toggleSanskritView() {
  // hides elements/text by adding the "is-hidden" class (form chota), but moves the text around a bit
  document.querySelectorAll('tei-orig').forEach((element) => {
    element.classList.toggle('is-hidden');
  });
  // slide the toggle button to the other side
  toggleBoxIcon(document.getElementById('toggleViewsButton'), 'bx-toggle-left', 'bx-toggle-right');
}

function initializeSpecificButtons(language) {
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
  }
}

// enables tooltips for the sidebar by creating a new div-element, which
// is placed based on the item hovered by the user.
// https://stackoverflow.com/questions/66382585/tooltip-inside-a-scrollable-component
function enableTooltips() {
  const hoverAreas = document.querySelectorAll('.features-item');
  const hoverTooltip = document.createElement('div');

  hoverTooltip.className = 'hoverTooltip';
  document.body.appendChild(hoverTooltip);

  hoverAreas.forEach((hoverArea) => {
    console.log(hoverArea);
    // Show the tooltip
    hoverArea.addEventListener('mouseenter', () => {
      hoverTooltip.innerHTML = hoverArea.querySelector('.tooltip').innerHTML;
      //tooltips.style.left = `${item.offsetLeft - cardContainer.scrollLeft}px`;
      hoverTooltip.style.top = `${hoverArea.getBoundingClientRect().top + 25}px`;
      hoverTooltip.style.display = 'block';
    });
    // Hide to tooltip
    hoverArea.addEventListener('mouseleave', () => {
      hoverTooltip.style.display = 'none';
    });
  });
}
