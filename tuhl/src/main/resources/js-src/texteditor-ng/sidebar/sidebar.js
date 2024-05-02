import { enableTooltips, toggleVisibility } from '../../common/utils';

import { getTextLanguage } from '../textloader/textloader';
import { decreaseFontSize, increaseFontSize, resetFontSize } from '../utils/fontsize';
import { determineVariant, toggleHebrewView, toggleSanskritView, Variant } from '../utils/projectSpecific';

/**
 * Set Takita's sidebar up to make it suitable for the texteditor.
 * @module sidebar
 */

/**
 * @param {Element} $sidebar HTML element which contains the sidebar
 * @param {Element} $text HTML element which contains the text. Needed for language and project specific variants
 * @param {Element} $pagesDialog HTML element which contains the dialog for page switching
 */
export function initializeSidebar($sidebar, $text, $pagesDialog) {
  const $pagesButton = $sidebar.querySelector('#pagesButton');
  const language = getTextLanguage($text);
  const variant = determineVariant($text, language);

  /**
   * Set up all the buttons and callbacks.
   */
  // expand/hide sidebar
  $sidebar.querySelector('#logo-name__icon').addEventListener('click', function () {
    toggleSidebar($sidebar);
  });
  // font manipulation buttons
  $sidebar.querySelector('#fontIncreaseButton').addEventListener('click', function () {
    toggleSidebar($sidebar);
    increaseFontSize($text);
  });
  $sidebar.querySelector('#fontIncreaseSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    increaseFontSize($text);
  });
  $sidebar.querySelector('#fontDecreaseButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    decreaseFontSize($text);
  });
  $sidebar.querySelector('#fontDecreaseSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    decreaseFontSize($text);
  });
  $sidebar.querySelector('#resetFontButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    resetFontSize($text);
  });
  $sidebar.querySelector('#resetFontSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    resetFontSize($text);
  });
  // show parts navigation
  $sidebar.querySelector('#pagesButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    toggleVisibility($pagesDialog, $pagesButton);
  });
  $sidebar.querySelector('#pagesSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    toggleVisibility($pagesDialog, $pagesButton);
  });

  /**
   * Set up project/language specific buttons and their callbacks.
   */
  if (variant === Variant.B04) {
    /* Sanskrit / B04 specific */
    sanskritSpecificButton($sidebar);
  } else if (variant === Variant.Hebrew) {
    /* Hebrew specific */
    hebrewSpecificButton($sidebar);
  }

  /**
   * Create tooltips for sidebar items.
   */
  const $featuresItems = $sidebar.querySelectorAll('.features-item');
  enableTooltips($featuresItems, undefined);
}

/**
 * Collapse sidebar
 * @param {Element} $sidebar the sidebar element
 */
function collapseSidebar($sidebar) {
  if (!$sidebar.classList.contains('annocollapse')) {
    toggleSidebar($sidebar);
  }
}

/**
 * Toggle sidebar, adjust toggle button and item texts.
 * @param {Element} $sidebar the sidebar element
 */
export function toggleSidebar($sidebar) {
  const $toggleButton = $sidebar.querySelector('#logo-name__icon');
  const $textElements = $sidebar.querySelectorAll('.features-item-text');
  const wasCollapsedBefore = $sidebar.classList.contains('annocollapse');

  // Toggle sidebar itself
  $sidebar.classList.toggle('annocollapse');

  // Adjust toggle button
  $toggleButton.classList = wasCollapsedBefore
    ? 'bx bx-arrow-from-right logo-name__icon'
    : 'bx bx-arrow-from-left logo-name__icon annocollapse';

  // Adjust item texts so that they are not hoverable
  $textElements.forEach((elem) => elem.classList.toggle('annocollapse', !wasCollapsedBefore));
}

/**
 * Enable sanskrit-specific button
 *
 * Enables the toggleViews button, which shows/hides the sandhied version
 * of the text.
 * @param {Element} $sidebar
 */
export function sanskritSpecificButton($sidebar) {
  // TODO: why do the variants use different HTML elements for their
  // identical click callbacks? Can't the elements be nested?
  const $toggleViews = $sidebar.querySelector('#toggleViews');
  const $button = $toggleViews.querySelector('#toggleViewsButton');
  const $span = $toggleViews.querySelector('#toggleViewsSpan');

  $toggleViews.classList.remove('is-hidden');
  $button.addEventListener('click', (_ev) => {
    collapseSidebar($sidebar);
    toggleSanskritView();
  });
  $span.addEventListener('click', (_ev) => {
    collapseSidebar($sidebar);
    toggleSanskritView();
  });
}

/**
 * Enable hebrew-specific button
 *
 * Enables the toggleViews button, which shows/hides the unvocalized version
 * of the text.
 * @param {Element} $sidebar
 */
export function hebrewSpecificButton($sidebar) {
  const $toggleViews = $sidebar.querySelector('#toggleViews');
  const $button = $toggleViews.querySelector('#toggleViewsButton');
  const $span = $toggleViews.querySelector('#toggleViewsSpan');

  $toggleViews.classList.remove('is-hidden');
  $button.addEventListener('click', (_ev) => {
    collapseSidebar($sidebar);
    toggleHebrewView();
  });
  $span.addEventListener('click', (_ev) => {
    collapseSidebar($sidebar);
    toggleHebrewView();
  });
  // Trigger the button to hide the unvocalized version initially.
  $button.click();
}
