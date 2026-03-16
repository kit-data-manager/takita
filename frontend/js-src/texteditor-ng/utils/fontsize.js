/**
 * Various utility functions to change font-sizes of a given HTMLElement.
 * @module fontsize
 */

/**
 * Change font-size of element by a given amount.
 * @param {Element} $container element to have its font size changed
 * @param {Number} difference size difference in pixel
 */
export function changeFontSize($container, difference) {
  const property = window.getComputedStyle($container).getPropertyValue('font-size');
  const currentSize = parseFloat(property);
  $container.style.fontSize = currentSize + difference + 'px';
}

/**
 * Decrease the font-size of element by a given amount.
 * @param {Element} $container element to have its font size decreased
 */
export function decreaseFontSize($container) {
  return changeFontSize($container, -1);
}

/**
 * Increase the font-size of element by a given amount.
 * @param {Element} $container element to have its font size increased
 */
export function increaseFontSize($container) {
  return changeFontSize($container, 1);
}

/**
 * Resets the font-size of element by a given amount.
 * @param {Element} $container element to have its font size reset
 */
export function resetFontSize($container) {
  $container.style.fontSize = 'initial';
}
