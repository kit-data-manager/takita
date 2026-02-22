/**
 * Collapse sidebar
 * @param {Element} $sidebar the sidebar element
 */
export function collapseSidebar($sidebar) {
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
