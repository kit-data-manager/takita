import { toggleBoxIcon, toggleOpacity, toggleVisibility } from '../common/utils';
import { collapseSidebar } from '../texteditor-ng/sidebar/sidebar';

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
