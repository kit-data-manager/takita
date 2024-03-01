import { initializeNavigation, getTargetAnnotationId } from './navigation';
import { loadText } from './textloader';
import { initializeSidebar, updateSidebar } from './sidebar';

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

// window.textEditor = {
//   function initilizeEditor() {
//     console.log("H");
//   }
// }
