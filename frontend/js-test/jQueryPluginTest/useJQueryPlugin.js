import $ from 'jquery';
import 'jsonform';
import '../../js-src/common/utils/metadataeditor';

/**
 * test to see if $ and metadataeditor are imported correctly
 *
 * @param {Element} node to be wrapped in a jQuery selection
 * @returns the jQuery selection
 */
export const useJQueryPlugin = (node) => {
  return $(node);
};
