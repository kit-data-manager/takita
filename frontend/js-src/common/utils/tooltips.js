// external modules
import * as bootstrap from 'bootstrap';
/**
 * creates tooltips for given elements using bootstrap
 *
 * @param {NodeList} $tooltipTriggerList  Elements for which a tooltip should get created
 */
export function enableTooltips($tooltipTriggerList) {
  [...$tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl, { delay: { show: 500, hide: 100 } }),
  );
}
