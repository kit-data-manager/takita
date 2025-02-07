// external modules
import * as bootstrap from 'bootstrap';
// internal modules
import * as annotationCard from '../../common/annotationCard/annotationCard';
import * as display from '../display/display';
import { Mode } from '../../common/mode';
import { modifySelection, saveModification, cancelModification, updateTarget } from './targetModification';

const innerHtml =
  `
<div class="modal" tabindex="-1" role="dialog" id="updateSelection" data-bs-backdrop="static">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Update Seleted Text</h5>
                    <button type="button" id="dismissTargetUpdate" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="oldSelectedText"></div>
                    <div id="newSelectedText"></div>
                    <input class="btn btn-primary" type="submit" value="Update + Save" id="updateTargetButton">
                </div>
            </div>
        </div>
    </div>
` +
  '<div class="col-7"><div id="notOnWorkspace"></div>' +
  '  <div id="textWorkspace">' +
  '       <div id="TEI">' +
  '            <tei-text xml:lang="en" lang="en">' +
  '               <tei-body n="Psalms" xml:id="b.426591" id="b.426591">' +
  '                    <tei-div type="chapter" n="1" xml:id="c.426630" id="c.426630">' +
  '<tei-lg><tei-l id="test"><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">standeth</tei-w> <tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">the</tei-w> <tei-w xml:id="w.137" id="w.137">  </tei-w> <tei-w xml:id="w.138" id="w.138">       </tei-w> <tei-w xml:id="w.139" id="w.139">sinners,</tei-w> <tei-w xml:id="w.140" id="w.140">nor</tei-w> <tei-w xml:id="w.141" id="w.141">sitteth</tei-w> <tei-w xml:id="w.142" id="w.142">in</tei-w> <tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> <tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> <tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></tei-div></tei-body></tei-text></div></div></div>' +
  '</div>';

window.MODE_CLASS = Mode;

const fullAnnotation = {
  pageId: '9e92b0dd-dd60-48f3-9ded-ba7a8d3f0d2f',
  textCards: [
    {
      annotationId: 'http://localhost/wap/sfb1475/philipp/takita/c4316923-7f25-4d36-adb6-7831255c6d6b',
      id: '728f27ec-d4b0-4094-8623-b104b6276b34',
      creators: ['sdfsf'],
      created: '2024-04-16T08:54:54.000Z',
      modified: '2024-04-16T08:54:54.000Z',
      value: 'nor st',
      purpose: 'describing',
      fullJson:
        '{"creator":{"type":"Person","name":"sdfsf"},"created":"2024-04-16T08:54:54Z","modified":"2024-04-16T08:54:54Z","purpose":"describing","value":"nor st","type":"TextualBody"}',
    },
  ],
  id: 'http://localhost/wap/sfb1475/philipp/takita/c4316923-7f25-4d36-adb6-7831255c6d6b',
  modified: '2024-04-16T08:54:54.000Z',
  creators: ['sdfsf'],
  created: '2024-04-16T08:54:54.000Z',
  color: 'MRW_DIRECT',
  targets: [
    {
      type: 'TEXT',
      linkToResource:
        'http://localhost:8090/api/v1/dataresources/9e92b0dd-dd60-48f3-9ded-ba7a8d3f0d2f/data/Book_of_Psalms.xml',
      selector: {
        xPath: 'concat(id("w.133"), "\n                    ", substring(id("w.134"), 1, 2))',
      },
    },
  ],
  etag: '"xtgitxsdbialejklodai"',
};

const annotationWithoutDescBody = {
  pageId: '9e92b0dd-dd60-48f3-9ded-ba7a8d3f0d2f',
  textCards: [],
  id: 'http://localhost/wap/sfb1475/philipp/takita/c4316923-7f25-4d36-adb6-7831255c6d6b',
  modified: '2024-04-16T08:54:54.000Z',
  creators: ['sdfsf'],
  created: '2024-04-16T08:54:54.000Z',
  color: 'MRW_DIRECT',
  targets: [
    {
      type: 'TEXT',
      linkToResource:
        'http://localhost:8090/api/v1/dataresources/9e92b0dd-dd60-48f3-9ded-ba7a8d3f0d2f/data/Book_of_Psalms.xml',
      selector: {
        xPath: 'concat(id("w.133"), "\n                    ", substring(id("w.134"), 1, 2))',
      },
    },
  ],
  etag: '"xtgitxsdbialejklodai"',
};
describe('starting the target modification process', () => {
  beforeEach(() => {
    // setup the document they way it looks during the modification process
    // creating and appending the necessary buttons
    document.body.innerHTML = '<div id="annotationCard"></div>';
    const annotationDiv = document.getElementById('annotationCard');
    var buttonModifySelection = document.createElement('button');
    buttonModifySelection.innerHTML = 'Modify Selection';
    buttonModifySelection.id = 'buttonModifySelection';

    var buttonSaveModification = document.createElement('button');
    buttonSaveModification.type = 'submit';
    buttonSaveModification.innerHTML = 'Save Modification';
    buttonSaveModification.id = 'buttonSaveModification';
    buttonSaveModification.disabled = true;
    buttonSaveModification.classList.add('d-none');

    var buttonCancelModification = document.createElement('button');
    buttonCancelModification.type = 'submit';
    buttonCancelModification.innerHTML = 'Cancel Modifcation';
    buttonCancelModification.id = 'buttonCancelModification';
    buttonCancelModification.style.backgroundColor = '#c82525';
    buttonCancelModification.disabled = true;
    buttonCancelModification.classList.add('d-none');

    annotationDiv.append(buttonModifySelection);
    annotationDiv.append(buttonSaveModification);
    annotationDiv.append(buttonCancelModification);

    window.MODE = window.MODE_CLASS.View;
  });
  it('starts the process of target modification', () => {
    const annotation = fullAnnotation;
    // call the function
    modifySelection(null, annotation);
    const $buttonModifySelection = document.getElementById('buttonModifySelection');
    const $buttonSaveModification = document.getElementById('buttonSaveModification');
    const $buttonCancelModification = document.getElementById('buttonCancelModification');

    expect(window.MODE).toBe(window.MODE_CLASS.Modify);
    expect(window.SELECTING_TEXT).toBe(true);
    expect($buttonModifySelection.disabled).toBe(true);
    expect($buttonModifySelection.classList.contains('d-none')).toBe(true);
    expect($buttonSaveModification.disabled).toBe(false);
    expect($buttonSaveModification.classList.contains('d-none')).toBe(false);
    expect($buttonCancelModification.disabled).toBe(false);
    expect($buttonCancelModification.classList.contains('d-none')).toBe(false);
  });

  it('starts the process of target modification and stops it as no annotation is selected', () => {
    // call the function
    const functionCompleted = modifySelection(null, undefined);
    const $buttonModifySelection = document.getElementById('buttonModifySelection');
    const $buttonSaveModification = document.getElementById('buttonSaveModification');
    const $buttonCancelModification = document.getElementById('buttonCancelModification');

    expect(functionCompleted).toBe(false);
    expect(window.MODE).toBe(window.MODE_CLASS.View);
    expect(window.SELECTING_TEXT).toBe(false);
    expect($buttonModifySelection.disabled).toBe(false);
    expect($buttonModifySelection.classList.contains('d-none')).toBe(false);
    expect($buttonSaveModification.disabled).toBe(true);
    expect($buttonSaveModification.classList.contains('d-none')).toBe(true);
    expect($buttonCancelModification.disabled).toBe(true);
    expect($buttonCancelModification.classList.contains('d-none')).toBe(true);
  });
});

describe('saving modification process', () => {
  it('saves the modification process for the normal case', () => {
    // setup the document they way it looks during the modification process
    document.body.innerHTML = innerHtml;

    const selection = window.getSelection();
    const range = new Range();
    range.setStart(document.getElementById('w.133'), 0);
    range.setEnd(document.getElementById('w.134').childNodes[0], 4);
    selection.addRange(range);
    const annotation = fullAnnotation;

    const stoppedFunction = saveModification(null, selection, annotation);
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateSelection'));
    const oldSelectedText = document.getElementById('oldSelectedText').firstElementChild.innerHTML;
    const newSelectedText = document.getElementById('newSelectedText').firstElementChild.innerHTML;
    const targetXPath = $modal._element.dataset.newTargetXmlId;

    expect(stoppedFunction).toBe(undefined);
    expect(oldSelectedText).toBe('nor st');
    expect(newSelectedText).toBe('nor stan');
    // the test result should be 'concat(id("w.133"), " ", substring(id("w.134"), 1, 4))',
    // as the functions called by saveModificaiton() are tested and working properly.
    // But for in a test-environment the targetbuilding behaves differently as
    // the nodes don't have the proper 'innerText' propertiy
    expect(targetXPath).toBe('id("w.133") | id("w.134")');
  });

  it('stops the modification process for an annotation when no text (only whitespace) is selected', () => {
    // setup the document they way it looks during the modification process
    document.body.innerHTML = innerHtml;
    const selection = window.getSelection();
    const range = new Range();
    range.setStart(document.getElementById('w.137'), 0);
    range.setEnd(document.getElementById('w.138').childNodes[0], 4);
    selection.addRange(range);
    const annotation = fullAnnotation;

    const functionCompleted = saveModification(null, selection, annotation);
    expect(functionCompleted).toBe(false);
  });
});

describe('canceling the target modification process', () => {
  it('cancels the process of target modification', () => {
    // setup the document they way it looks during the modification process
    // creating and appending the necessary buttons
    document.body.innerHTML = '<div id="annotationCard"></div>';
    const annotationDiv = document.getElementById('annotationCard');
    var buttonModifySelection = document.createElement('button');
    buttonModifySelection.innerHTML = 'Modify Selection';
    buttonModifySelection.id = 'buttonModifySelection';
    buttonModifySelection.disabled = true;
    buttonModifySelection.classList.add('d-none');

    var buttonSaveModification = document.createElement('button');
    buttonSaveModification.type = 'submit';
    buttonSaveModification.innerHTML = 'Save Modification';
    buttonSaveModification.id = 'buttonSaveModification';

    var buttonCancelModification = document.createElement('button');
    buttonCancelModification.type = 'submit';
    buttonCancelModification.innerHTML = 'Cancel Modifcation';
    buttonCancelModification.id = 'buttonCancelModification';
    buttonCancelModification.style.backgroundColor = '#c82525';

    annotationDiv.append(buttonModifySelection);
    annotationDiv.append(buttonSaveModification);
    annotationDiv.append(buttonCancelModification);

    // call the function
    cancelModification();
    const $buttonModifySelection = document.getElementById('buttonModifySelection');
    const $buttonSaveModification = document.getElementById('buttonSaveModification');
    const $buttonCancelModification = document.getElementById('buttonCancelModification');

    expect(window.MODE).toBe(window.MODE_CLASS.View);
    expect(window.SELECTING_TEXT).toBe(false);
    expect($buttonModifySelection.disabled).toBe(false);
    expect($buttonModifySelection.classList.contains('d-none')).toBe(false);
    expect($buttonSaveModification.disabled).toBe(true);
    expect($buttonSaveModification.classList.contains('d-none')).toBe(true);
    expect($buttonCancelModification.disabled).toBe(true);
    expect($buttonCancelModification.classList.contains('d-none')).toBe(true);
  });
});

describe('updating target callback for eventListener', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('updates the target', async () => {
    // mocking functions and dom-state
    document.body.innerHTML = innerHtml;
    jest.spyOn(annotationCard, 'selectAnnotation').mockResolvedValue(true);
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateSelection'));
    $modal.toggle();
    window.MODE = window.MODE_CLASS.Modify;
    window.SELECTING_TEXT = true;
    const callback = jest.fn();

    const result = await updateTarget(null, callback, {}, 'xpath', 'text', {});
    expect(result).toBe(true);
    expect(window.MODE).toBe(window.MODE_CLASS.View);
    expect(window.SELECTING_TEXT).toBe(false);
    expect($modal._element.classList.contains('show')).toBe(false);
  });

  it('updates the target in a textEditor and updates the display', async () => {
    // mocking functions and dom-state
    document.body.innerHTML = innerHtml;
    jest.spyOn(annotationCard, 'selectAnnotation').mockResolvedValue(true);
    const updateDisplayMock = jest.spyOn(display, 'updateDisplay');
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateSelection'));
    $modal.toggle();
    window.MODE = window.MODE_CLASS.Modify;
    window.SELECTING_TEXT = true;
    window.EDITORTYPE = 'TEXT';
    const callback = jest.fn();

    const result = await updateTarget(null, callback, {}, 'xpath', 'text', {});
    expect(result).toBe(true);
    expect(window.MODE).toBe(window.MODE_CLASS.View);
    expect(window.SELECTING_TEXT).toBe(false);
    expect($modal._element.classList.contains('show')).toBe(false);
    expect(updateDisplayMock).toHaveBeenCalled();
  });

  it('fails to update the target', async () => {
    // mocking functions and dom-state
    document.body.innerHTML = innerHtml;
    jest.spyOn(annotationCard, 'selectAnnotation').mockRejectedValue(new Error('Async error message'));
    jest.spyOn(display, 'updateDisplay');
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateSelection'));
    $modal._element.classList.toggle('show');
    const callback = jest.fn(() => {
      throw new Error();
    });

    const result = await updateTarget(null, callback, {}, 'xpath', 'text', {});
    expect(result).toBe(false);
    expect(window.MODE).toBe(window.MODE_CLASS.View);
    expect(window.SELECTING_TEXT).toBe(false);
    expect($modal._element.classList.contains('show')).toBe(true);
  });

  it('fails to retrieve the annotation after successfully updating the target', async () => {
    // mocking functions and dom-state
    document.body.innerHTML = innerHtml;
    const selectAnnotationMock = jest.spyOn(annotationCard, 'selectAnnotation').mockRejectedValue(new Error('Error'));
    jest.spyOn(display, 'updateDisplay');
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateSelection'));
    $modal.toggle();
    const callback = jest.fn();

    const result = await updateTarget(null, callback, {}, 'xpath', 'text', {});
    expect(result).toBe(true);
    expect(window.MODE).toBe(window.MODE_CLASS.View);
    expect(window.SELECTING_TEXT).toBe(false);
    expect($modal._element.classList.contains('show')).toBe(false);
    expect(selectAnnotationMock).toHaveBeenCalled();
  });
});
