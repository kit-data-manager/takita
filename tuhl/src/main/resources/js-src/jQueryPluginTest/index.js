import $ from 'jquery';
import 'jsonform';
window.fun = { jqpTest };

function jqpTest(node) {
  console.log($(node));
  $(node).jsonForm({ schema: {} });
}

/**
 * test to see if $ and metadataeditor are imported correctly
 *
 * @param {Element} node to be wrapped in a jQuery selection
 * @returns the jQuery selection
 */
export function useJQueryPlugin(node) {
  return $(node);
}
