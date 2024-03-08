import { initializeTopbar } from '../common/topbar';
// metadataeditor is ajQuery plugin and will be imported here, so all
// modules can be sure, that it is impprted
import './../common/utils/metadataeditor';
import { initializeNavigation, getTargetAnnotationId, navigateToAnnotation } from './navigation';
import { loadText } from './textloader';
import { initializeSidebar, updateSidebar } from './sidebar';
import { init, drawAnnos, checkIsTargetCompatible, makeTargetsCompatible } from './annotationEditor';

window.topbar = {
  initializeTopbar,
};

window.navigation = {
  initializeNavigation,
  getTargetAnnotationId,
  navigateToAnnotation,
};

window.textloader = {
  loadText,
};

window.sidebar = {
  initializeSidebar,
  updateSidebar,
};

window.textEditor = {
  init,
  drawAnnos,
  checkIsTargetCompatible,
  makeTargetsCompatible,
};
