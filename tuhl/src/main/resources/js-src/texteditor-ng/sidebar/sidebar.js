import { toggleDisplay } from '../../common/utils';
import { toggleSidebar, collapseSidebar } from '../../common/sidebar';
import { getTextLanguage } from '../textloader/textloader';
import { decreaseFontSize, increaseFontSize, resetFontSize } from '../utils/fontsize';
import { determineVariant } from '../projectspecific';
/**
 * Set Takita's sidebar up to make it suitable for the texteditor.
 * @module sidebar
 */

/**
 * @param {Element} $sidebar HTML element which contains the sidebar
 * @param {Element} $text HTML element which contains the text. Needed for language and project specific variants
 * @param {Element} $pagesDialog HTML element which contains the dialog for page switching
 */
export function initializeSidebar($sidebar, $text, $pagesDialog, $tableContainer, hooks = {}) {
  const $pagesButton = $sidebar.querySelector('#pagesButton');
  const $annotationTableButton = $sidebar.querySelector('#annotationTableBottomButton');
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
    collapseSidebar($sidebar);
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
    toggleDisplay($pagesDialog, $pagesButton);
  });
  $sidebar.querySelector('#pagesSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    toggleDisplay($pagesDialog, $pagesButton);
  });

  // shows the annotation table
  $sidebar.querySelector('#annotationTableBottomButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    toggleDisplay($tableContainer, $annotationTableButton);
  });
  $sidebar.querySelector('#annotationTableBottomSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    toggleDisplay($tableContainer, $annotationTableButton);
  });

  if (hooks.postSidebarCreation) {
    hooks.postSidebarCreation.forEach((hook) => hook($sidebar, variant));
  }
}
