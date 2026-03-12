// external modules
import * as bootstrap from 'bootstrap';
/**
 * creates tooltips for given elements using bootstrap
 *
 * @param {NodeList} $tooltipTriggerList  Elements for which a tooltip should get created
 */
export function enableTooltips($tooltipTriggerList) {
  const tooltipList = [...$tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl, { delay: { show: 500, hide: 100 } }),
  );
}

/**
 * Enables tooltips by creating a new div-element, which is placed based on the item hovered by the user.
 * see: https://stackoverflow.com/questions/66382585/tooltip-inside-a-scrollable-component
 *
 * By explicitely passing $hoverAreas and $tooltipContainer, it is possible to have multiple tooltips
 * independently from each other.
 * @param {NodeList} [$hoverAreas] Elements for which a tooltip should get created
 * @param {Element} [$tooltipContainer] Element to which to attach the tooltip, document.body if undefined
 */
export function deprecatedEnableTooltips($hoverAreas, $tooltipContainer) {
  const hoverAreas = $hoverAreas !== undefined ? $hoverAreas : document.querySelectorAll('.features-item');
  const hoverTooltip = prepareHoverTooltip($tooltipContainer);

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
  });
}

/**
 * Ensure that an element for the tooltip is available in the DOM.
 * @param {Element} [$container] Element to which the tooltip gets attached; if undefined, it gets
 *                               attached to the document.body instead.
 * @returns {Element} the tooltip
 */
function prepareHoverTooltip($container) {
  const parent = $container !== undefined ? $container : document.body;
  const tooltip = document.createElement('div');
  tooltip.className = 'hoverTooltip';
  parent.appendChild(tooltip);
  return tooltip;
}
