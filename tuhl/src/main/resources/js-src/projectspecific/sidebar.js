import { toggleBoxIcon, toggleOpacity, toggleVisibility } from '../common/utils';
import { collapseSidebar } from '../texteditor-ng/sidebar/sidebar';
import { Variant } from './textloader';

/**
 * hides/shows the vocalized version of the text
 */
export function toggleHebrewView($button) {
  const $textElements = document.querySelectorAll('tei-reg');
  toggleOpacity($textElements);
  // slide the toggle button to the other side
  toggleBoxIcon($button, 'bx-toggle-left', 'bx-toggle-right');
}

/**
 * hides/shows the sandhied version of the text
 */
export function toggleSanskritView($button) {
  // querySelectorAll('tei-orig')
  // '#toggleViewsButton'
  const $textElements = document.querySelectorAll('tei-orig');
  toggleVisibility($textElements);
  // slide the toggle button to the other side
  toggleBoxIcon($button, 'bx-toggle-left', 'bx-toggle-right');
}

/**
 * Enables the toggleViews button, which shows/hides the sandhied version
 * of the text.
 *
 * @param {Element} $sidebar the sidebar element
 */
export function enableSanskritSpecificButton($sidebar) {
  // TODO: why do the variants use different HTML elements for their
  // identical click callbacks? Can't the elements be nested?
  const $toggleViews = $sidebar.querySelector('#toggleViews');
  const $button = $toggleViews.querySelector('#toggleViewsButton');
  const $span = $toggleViews.querySelector('#toggleViewsSpan');

  $toggleViews.classList.remove('is-hidden');
  $button.addEventListener('click', (_ev) => {
    collapseSidebar($sidebar);
    toggleSanskritView($button);
  });
  $span.addEventListener('click', (_ev) => {
    collapseSidebar($sidebar);
    toggleSanskritView($button);
  });
}

/**
 * Enables the toggleViews button, which shows/hides the unvocalized version
 * of the text.
 *
 * @param {Element} $sidebar the sidebar element
 */
export function enableHebrewSpecificButton($sidebar) {
  const $toggleViews = $sidebar.querySelector('#toggleViews');
  const $button = $toggleViews.querySelector('#toggleViewsButton');
  const $span = $toggleViews.querySelector('#toggleViewsSpan');

  $toggleViews.classList.remove('is-hidden');
  $button.addEventListener('click', (_ev) => {
    collapseSidebar($sidebar);
    toggleHebrewView($button);
  });
  $span.addEventListener('click', (_ev) => {
    collapseSidebar($sidebar);
    toggleHebrewView($button);
  });
  // Trigger the button to hide the unvocalized version initially.
  $button.click();
}

/**
 * enables the toogleViewButton of the sidebar based on the given variant/requirements
 *
 * @param {Element} $sidebar the sidebar element
 * @param {Variant} variant indictaes the requirements of the current text
 */
export function enableLanguageViewToggleButton($sidebar, variant) {
  /**
   * Set up project/language specific buttons and their callbacks.
   */
  if (variant === Variant.B04) {
    /* Sanskrit / B04 specific */
    enableSanskritSpecificButton($sidebar);
  } else if (variant === Variant.Hebrew) {
    /* Hebrew specific */
    enableHebrewSpecificButton($sidebar);
  }
}
