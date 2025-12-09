import * as templates from '../../texteditor-ng/projectspecific/annotationCreation/templates';
import * as display from '../../texteditor-ng/display/display';
import * as annotationCard from '../annotationCard/annotationCard';
import * as metadataEditorWrapper from '../utils/metadataEditorWrapper';
import { resetFormAndUpdateDisplay } from './annotationCreation';
//pickTemplate(
// svgCode, encodedId,      createFormId,            pickFormId,                    template
// targetXPath, '',         'createAnnotationForm', 'pickAnnotationTemplateForm',   'annotationTemplate'
// '', encodeAnnoId(annoId),'createForm',      '     pickBodyTemplateForm',         'bodyTemplate');

const innerHTML = `
    <div class="modal" tabindex="-1" role="dialog" id="createBody" data-bs-backdrop="static">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Create New Body</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="pickBodyTemplateForm"></form>
                    <form id="createForm"></form>   
                </div>
            </div>
        </div>
    </div>
    
    <div class="modal" tabindex="-1" role="dialog" id="createAnnotation" data-bs-backdrop="static">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Create New Annotation</h5>
                    <button type="button" id="dismissAnnotation" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="pickAnnotationTemplateForm"></form>
                    <form id="createAnnotationForm"></form>    
                </div>
            </div>
        </div>
    </div>`;

// function to manipulate the return of getFormObjectCreateAnnotation(). It replaces the
// projectspecifc annotation creation templates with dummy ones
function getFormObjectCreateAnnotationMock() {
  const object = templates.getFormObjectCreateAnnotation();
  return object;
}
// function to manipulate the return of getFormObjectCreateBody(). It replaces the
// projectspecifc body creation templates with dummy ones
function getFormObjectCreateBodyMock() {
  const object = templates.getFormObjectCreateBody();
  return object;
}

describe('creating various forms based on chosen template', () => {
  it('creates a form used for the creation of an annotation', () => {
    document.body.innerHTML = innerHTML;
    // mocking the projectspecific getFormObjectCreateAnnotation() so the test works independetly
    // from project setups
    jest.spyOn(templates, 'getFormObjectCreateAnnotation').mockReturnValue(getFormObjectCreateAnnotationMock());
    jest.replaceProperty(templates, 'annotationTemplate', {
      EXAMPLE: 'example',
      NOTEMPLATE: 'notemplate',
    });

    templates.pickTemplate(
      [{ type: 'XPathSelector', value: 'targetXPath' }],
      '',
      'createAnnotationForm',
      'pickAnnotationTemplateForm',
      'annotationTemplate',
    );

    const $form = document.getElementById('createAnnotationForm');
    const $pickForm = document.getElementById('pickAnnotationTemplateForm');

    expect($form.children.length).toBe(0);
    expect($pickForm.querySelectorAll('option').length).toBe(3);
    expect($pickForm.querySelectorAll('option')[1].value).toStrictEqual('EXAMPLE');
  });
  it('creates a form used for the creation of another body', () => {
    document.body.innerHTML = innerHTML;
    // mocking the projectspecific getFormObjectCreateAnnotation() so the test works independetly
    // from project setups
    jest.spyOn(templates, 'getFormObjectCreateBody').mockReturnValue(getFormObjectCreateBodyMock());
    jest.replaceProperty(templates, 'bodyTemplate', {
      TAG: 'tag',
      TEXTBODY: 'textbody',
    });

    templates.pickTemplate('', 'encodedId', 'createForm', 'pickBodyTemplateForm', 'bodyTemplate');

    const $form = document.getElementById('createForm');
    const $pickForm = document.getElementById('pickBodyTemplateForm');

    expect($form.children.length).toBe(0);
    expect($pickForm.querySelectorAll('option').length).toBe(3);
    expect($pickForm.querySelectorAll('option')[1].value).toStrictEqual('TAG');
  });
});

// TODO: these have to be skipped as resetFormAndUpdateDisplay() is using bootstrap.Modal
// which is undefined in the test environment
describe.skip('reseting the form and updating the display', () => {
  it('in a textEditor', async () => {
    document.body.innerHTML = innerHTML + `<div id="annotationCard"></div><div id="TEI"></div>`;
    // mocking dom-state and functions
    document.getElementById('annotationCard').classList.add('invisible');
    document.getElementById('createAnnotation').classList.add('show');
    document.getElementById('createAnnotationForm').setAttribute('data-annotation-targetcode', 'removeMe');
    window.EDITORTYPE = 'TEXT';
    jest.spyOn(display, 'updateDisplay').mockReturnValue(true);
    jest.spyOn(annotationCard, 'selectAnnotation').mockReturnValue(true);
    // jest.spyOn(metadataEditorWrapper, 'fillMetaDataEditorTable').mockReturnValue(true);

    await resetFormAndUpdateDisplay({ id: 'annoId' }, {});

    const $modal = document.getElementById('createAnnotation');
    const $annotationCard = document.getElementById('annotationCard');
    const $form = document.getElementById('createAnnotationForm');

    expect($modal.classList.contains('show')).toBe(false);
    expect(window.SELECTED_ANNOTATION).toBe(true);
    expect($annotationCard.classList.contains('invisible')).toBe(false);
    expect($form.getAttribute('data-annotation-targetcode')).toBe('');
  });

  it('in an imageEditor', async () => {
    document.body.innerHTML = innerHTML + `<div id="annotationCard"></div>`;
    // mocking dom-state and functions
    document.getElementById('annotationCard').classList.add('invisible');
    document.getElementById('createAnnotation').classList.add('show');
    document.getElementById('createAnnotationForm').setAttribute('data-annotation-targetcode', 'removeMe');
    jest.spyOn(annotationCard, 'selectAnnotation').mockReturnValue(true);
    // jest.spyOn(metadataEditorWrapper, 'fillMetaDataEditorTable').mockReturnValue(true);

    await resetFormAndUpdateDisplay({ id: 'annoId' }, {});

    const $modal = document.getElementById('createAnnotation');
    const $annotationCard = document.getElementById('annotationCard');
    const $form = document.getElementById('createAnnotationForm');

    expect($modal.classList.contains('show')).toBe(false);
    expect($annotationCard.classList.contains('invisible')).toBe(false);
    expect($form.getAttribute('data-annotation-targetcode')).toBe('');
  });
});
