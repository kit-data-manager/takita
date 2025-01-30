import * as templates from '../../projectspecific/annotationCreation/templates';
import * as display from '../../texteditor-ng/display/display';
import * as annotationCard from '../annotationCard/annotationCard';
import * as metadataEditorWrapper from '../utils/metadataEditorWrapper';
import { pickTemplate, resetFormAndUpdateDisplay } from './annotationCreation';
//pickTemplate(
// svgCode, encodedId,      createFormId,            pickFormId,                    template
// targetXPath, '',         'createAnnotationForm', 'pickAnnotationTemplateForm',   'annotationTemplate'
// '', encodeAnnoId(annoId),'createForm',      '     pickBodyTemplateForm',         'bodyTemplate');

const innerHTML = `
        <div class="modal" id="createBody">
        <div class="modal-content">
            <span class="close-button" id="closeButton">&times;</span>
            <form id="pickBodyTemplateForm"><div></div></form>
            <form id="createForm"><div></div></form>
        </div>
    </div>

    <div class="modal" id="createAnnotation">
        <div class="modal-content">
            <span class="close-button" id="closeButtonAnno">&times;</span>
            <form id="pickAnnotationTemplateForm"><div></div></form>
            <form id="createAnnotationForm"><div></div></form>
        </div>
    </div>`;

describe('creating various forms based on chosen template', () => {
  it('creates a form used for the creation of an annotation', () => {
    document.body.innerHTML = innerHTML;
    // mocking the projectspecific formObjectCreateAnnotation so the test works independetly
    // from project setups
    jest.replaceProperty(templates.formObjectCreateAnnotation.schema.template, 'enum', ['', 'One', 'Two']);

    pickTemplate('svgCode/xPath', '', 'createAnnotationForm', 'pickAnnotationTemplateForm', 'annotationTemplate');

    const $form = document.getElementById('createAnnotationForm');
    const $pickForm = document.getElementById('pickAnnotationTemplateForm');

    expect($form.children.length).toBe(0);
    expect($form.title).toStrictEqual('svgCode/xPath');
    expect($pickForm.querySelectorAll('option').length).toBe(3);
    expect($pickForm.querySelectorAll('option')[1].value).toStrictEqual('One');
  });
  it('creates a form used for the creation of another body', () => {
    document.body.innerHTML = innerHTML;
    // mocking the projectspecific formObjectCreateAnnotation so the test works independetly
    // from project setups
    jest.replaceProperty(templates.formObjectCreateBody.schema.template, 'enum', ['', 'One', 'Two']);

    pickTemplate('', 'encodedId', 'createForm', 'pickBodyTemplateForm', 'bodyTemplate');

    const $form = document.getElementById('createForm');
    const $pickForm = document.getElementById('pickBodyTemplateForm');

    expect($form.children.length).toBe(0);
    expect($form.title).toStrictEqual('encodedId');
    expect($pickForm.querySelectorAll('option').length).toBe(3);
    expect($pickForm.querySelectorAll('option')[1].value).toStrictEqual('One');
  });
});

describe('reseting the form and updating the display', () => {
  it('in a textEditor', async () => {
    document.body.innerHTML = innerHTML + `<div id="annotationCard"></div><div id="TEI"></div>`;
    // mocking dom-state and functions
    document.getElementById('annotationCard').classList.add('is-hidden');
    document.getElementById('createAnnotation').classList.add('show-modal');
    document.getElementById('createAnnotationForm').title = 'removeMe';
    window.EDITORTYPE = 'TEXT';
    jest.spyOn(display, 'updateDisplay').mockReturnValue(true);
    jest.spyOn(annotationCard, 'selectAnnotation').mockReturnValue(true);
    // jest.spyOn(metadataEditorWrapper, 'fillMetaDataEditorTable').mockReturnValue(true);

    await resetFormAndUpdateDisplay({ id: 'annoId' }, {});

    const $modal = document.getElementById('createAnnotation');
    const $annotationCard = document.getElementById('annotationCard');
    const $form = document.getElementById('createAnnotationForm');

    expect($modal.classList.contains('show-modal')).toBe(false);
    expect(window.SELECTED_ANNOTATION).toBe(true);
    expect($annotationCard.classList.contains('is-hidden')).toBe(false);
    expect($form.title).toBe('');
  });

  it('in an imageEditor', async () => {
    document.body.innerHTML = innerHTML + `<div id="annotationCard"></div>`;
    // mocking dom-state and functions
    document.getElementById('annotationCard').classList.add('is-hidden');
    document.getElementById('createAnnotation').classList.add('show-modal');
    document.getElementById('createAnnotationForm').title = 'removeMe';
    jest.spyOn(annotationCard, 'selectAnnotation').mockReturnValue(true);
    // jest.spyOn(metadataEditorWrapper, 'fillMetaDataEditorTable').mockReturnValue(true);

    await resetFormAndUpdateDisplay({ id: 'annoId' }, {});

    const $modal = document.getElementById('createAnnotation');
    const $annotationCard = document.getElementById('annotationCard');
    const $form = document.getElementById('createAnnotationForm');

    expect($modal.classList.contains('show-modal')).toBe(false);
    expect($annotationCard.classList.contains('is-hidden')).toBe(false);
    expect($form.title).toBe('');
  });
});
