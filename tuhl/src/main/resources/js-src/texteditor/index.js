import { initializeNavigation, getTargetAnnotationId } from './navigation';
import { loadText } from './textloader';
import { initializeSidebar, updateSidebar } from './sidebar';
import { init } from './annotationEditor';

window.navigation = {
  initializeNavigation,
  getTargetAnnotationId,
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
};
