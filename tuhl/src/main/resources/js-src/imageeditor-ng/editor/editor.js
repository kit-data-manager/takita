import * as bootstrap from 'bootstrap';
import { pickTemplate } from '../../common/annotationCreation';

export function createPageAnnotation() {
  let createAnnotation = document.getElementById('createAnnotation');
  let createAnnotationModal = bootstrap.Modal.getOrCreateInstance(createAnnotation);
  createAnnotationModal.toggle();
  pickTemplate('', '', 'createAnnotationForm', 'pickAnnotationTemplateForm', 'annotationTemplate');
}
