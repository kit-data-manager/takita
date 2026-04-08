import * as bootstrap from 'bootstrap';
import { Mode } from '../../common/mode';
import { toggleDisplay } from '../../common/utils';
import { collapseSidebar, toggleSidebar } from '../../common/sidebar';
import { toggleShapeVisibility } from '../utils';
import { confirmDiscardChanges, modifyShape, saveShape, undo } from '../targetBuilding';
import { pickTemplate } from '../projectspecific/annotationCreation/templates';

export function initializeSidebar($sidebar, $pagesDialog, $tableContainer, hooks = {}) {
  const $pagesButton = $sidebar.querySelector('#pagesButton');
  const $annotationTableButton = $sidebar.querySelector('#annotationTableBottomButton');
  // expand/hide sidebar
  $sidebar.querySelector('#logo-name__icon').addEventListener('click', function () {
    toggleSidebar($sidebar);
  });

  $sidebar.querySelector('#zoomInButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    imageZoomIn();
  });
  $sidebar.querySelector('#zoomInSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    imageZoomIn();
  });

  $sidebar.querySelector('#zoomOutButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    imageZoomOut();
  });
  $sidebar.querySelector('#zoomOutSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    imageZoomOut();
  });

  $sidebar.querySelector('#moveImageButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    window.movingImage = true;
    window.MODE = Mode.Move;
  });
  $sidebar.querySelector('#moveImageSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    window.movingImage = true;
    window.MODE = Mode.Move;
  });

  $sidebar.querySelector('#hideShapeButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    hideShape();
  });
  $sidebar.querySelector('#hideShapeSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    hideShape();
  });

  $sidebar.querySelector('#resetViewButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    resetView();
  });
  $sidebar.querySelector('#resetViewSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    resetView();
  });

  $sidebar.querySelector('#createRectangleButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    addRectangle();
    confirmDiscardChanges();
    window.MODE = Mode.Create;
  });
  $sidebar.querySelector('#createRectangleSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    addRectangle();
    confirmDiscardChanges();
    window.MODE = Mode.Create;
  });

  $sidebar.querySelector('#createPolygonButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    addPolygon();
    confirmDiscardChanges();
    window.MODE = Mode.Create;
  });
  $sidebar.querySelector('#createPolygonSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    addPolygon();
    confirmDiscardChanges();
    window.MODE = Mode.Create;
  });

  $sidebar.querySelector('#createPageAnnoButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    createPageAnnotation();
    confirmDiscardChanges();
    window.MODE = Mode.Create;
  });
  $sidebar.querySelector('#createPageAnnoSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    createPageAnnotation();
    confirmDiscardChanges();
    window.MODE = Mode.Create;
  });

  $sidebar.querySelector('#modifyButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    modifyShape();
  });
  $sidebar.querySelector('#modifySpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    modifyShape();
  });

  $sidebar.querySelector('#undoButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    undo();
  });
  $sidebar.querySelector('#undoSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    undo();
  });

  $sidebar.querySelector('#saveButton').addEventListener('click', function () {
    collapseSidebar($sidebar);
    saveShape();
  });
  $sidebar.querySelector('#saveSpan').addEventListener('click', function () {
    collapseSidebar($sidebar);
    saveShape();
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
    hooks.postSidebarCreation.forEach((hook) => hook($sidebar));
  }
}

export function imageZoomIn() {
  window.paper.currentWidth = window.paper.currentWidth - window.paper.originalWidth / 10;
  window.paper.currentHeight = window.paper.currentHeight - window.paper.originalHeight / 10;

  if (window.paper.currentWidth > 0 && window.paper.currentHeight > 0) {
    let image = document.getElementById('pageImage');
    image.style.width =
      (document.getElementById('imageWorkspace').clientWidth * window.paper.originalWidth) / window.paper.currentWidth +
      'px';
    image.style.left = Math.round((-window.paper.currentX * image.clientWidth) / window.paper.originalWidth) + 'px';
    image.style.top = Math.round((-window.paper.currentY * image.clientHeight) / window.paper.originalHeight) + 'px';

    window.paper.setSize(image.clientWidth, image.clientHeight);
    let canvas = document.getElementById('canvas');
    canvas.style.left = Math.round((-window.paper.currentX * image.clientWidth) / window.paper.originalWidth) + 'px';
    canvas.style.top = Math.round((-window.paper.currentY * image.clientHeight) / window.paper.originalHeight) + 'px';
  } else {
    alert("Can't zoom in further!");
  }
}

export function imageZoomOut() {
  window.paper.currentWidth = window.paper.currentWidth + window.paper.originalWidth / 10;
  window.paper.currentHeight = window.paper.currentHeight + window.paper.originalHeight / 10;

  let image = document.getElementById('pageImage');

  image.style.width =
    (document.getElementById('imageWorkspace').clientWidth * window.paper.originalWidth) / window.paper.currentWidth +
    'px';
  image.style.left = Math.round((-window.paper.currentX * image.clientWidth) / window.paper.originalWidth) + 'px';
  image.style.top = Math.round((-window.paper.currentY * image.clientHeight) / window.paper.originalHeight) + 'px';

  window.paper.setSize(image.clientWidth, image.clientHeight);
  let canvas = document.getElementById('canvas');
  canvas.style.left = Math.round((-window.paper.currentX * image.clientWidth) / window.paper.originalWidth) + 'px';
  canvas.style.top = Math.round((-window.paper.currentY * image.clientHeight) / window.paper.originalHeight) + 'px';
}

export function resetView() {
  window.paper.currentWidth = window.paper.originalWidth;
  window.paper.currentHeight = window.paper.originalHeight;
  window.paper.currentX = 0;
  window.paper.currentY = 0;

  window.paper.forEach(function (element) {
    if (!element.isVisible() && element.type !== 'circle') {
      toggleShapeVisibility(element);
    }
  });
  let image = document.getElementById('pageImage');
  image.style.width = document.getElementById('imageWorkspace').clientWidth + 'px';
  image.style.left = 0 + 'px';
  image.style.top = 0 + 'px';
  window.paper.setSize(image.clientWidth, image.clientHeight);
  let canvas = document.getElementById('canvas');
  canvas.style.left = 0 + 'px';
  canvas.style.top = 0 + 'px';
}

function hideShape() {
  window.paper.forEach(function (element) {
    if (element.selected) {
      toggleShapeVisibility(element);
    }
  });
}

function addRectangle() {
  if (window.addingRectangle) {
    window.addingRectangle = false;
    document.getElementById('createRectangleButton').parentElement.classList.remove('active');
  } else {
    window.addingRectangle = true;
    if (window.addingPolygon) {
      window.addingPolygon = false;
      document.getElementById('createPolygonButton').parentElement.classList.remove('active');
    }
  }
}

function addPolygon() {
  if (window.addingPolygon) {
    window.addingPolygon = false;
    document.getElementById('createPolygonButton').parentElement.classList.remove('active');
  } else {
    window.addingPolygon = true;
    if (window.addingRectangle) {
      window.addingRectangle = false;
      document.getElementById('createRectangleButton').parentElement.classList.remove('active');
    }
  }
}

// toggling the side bar
// all text elements should not be hoverable when side bar is collapsed
function toggleAnnoSideBar() {
  let sideBar = document.querySelector('.anno-side-bar');
  let arrowCollapse = document.querySelector('#logo-name__icon');
  let textElements = document.querySelectorAll('.features-item-text');
  sideBar.classList.toggle('annocollapse');
  arrowCollapse.classList.toggle('annocollapse');
  if (arrowCollapse.classList.contains('annocollapse')) {
    arrowCollapse.classList = 'bx bx-arrow-from-left logo-name__icon annocollapse';
    for (let element in textElements) {
      if (textElements[element].classList) {
        textElements[element].classList.add('annocollapse');
      }
    }
  } else {
    arrowCollapse.classList = 'bx bx-arrow-from-right logo-name__icon';
    for (let element in textElements) {
      if (textElements[element].classList) {
        textElements[element].classList.remove('annocollapse');
      }
    }
  }
}

function createPageAnnotation() {
  let createAnnotation = document.getElementById('createAnnotation');
  let createAnnotationModal = bootstrap.Modal.getOrCreateInstance(createAnnotation);
  createAnnotationModal.toggle();
  pickTemplate('', '', 'createAnnotationForm', 'pickAnnotationTemplateForm', 'annotationTemplate');
}
