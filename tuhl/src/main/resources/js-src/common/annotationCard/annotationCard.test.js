import { selectAnnotation } from './annotationCard';
import * as utils from './utils';
import * as projectspecificAnnotationCard from '../../projectspecific/annotationCard';

const annoData = {
  pageId: '3bb48acd-5296-4343-949c-0eca80aa578f',
  textCards: [
    {
      annotationId: 'http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d',
      id: '2741aaf0-0fac-4690-81b4-8d0301f40a97',
      creators: ['Tester'],
      created: '2024-07-09T07:03:37.000Z',
      modified: '2024-07-09T07:03:37.000Z',
      value: 'judgment',
      purpose: 'describing',
      fullJson:
        '{"creator":{"type":"Person","name":"Tester"},"created":"2024-07-09T07:03:37Z","modified":"2024-07-09T07:03:37Z","purpose":"describing","value":"judgment","type":"TextualBody"}',
    },
    {
      annotationId: 'http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d',
      id: 'a1e9750a-e0ce-4e38-8372-406e5c8d0d94',
      creators: ['Tester'],
      created: '2024-07-09T07:03:38.000Z',
      modified: '2024-07-09T07:03:38.000Z',
      value: 'mrw (direct)',
      purpose: 'classifying',
      fullJson:
        '{"creator":{"type":"Person","name":"Tester"},"created":"2024-07-09T07:03:38.058500Z","modified":"2024-07-09T07:03:38.058501Z","purpose":"classifying","value":"mrw (direct)","type":"TextualBody"}',
    },
  ],
  bodies: [
    {
      annotationId: 'http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d',
      id: '2741aaf0-0fac-4690-81b4-8d0301f40a97',
      creators: ['Tester'],
      created: '2024-07-09T07:03:37.000Z',
      modified: '2024-07-09T07:03:37.000Z',
      value: 'judgment long text text text text text text text text text text',
      purpose: 'describing',
      fullJson:
        '{"creator":{"type":"Person","name":"Tester"},"created":"2024-07-09T07:03:37Z","modified":"2024-07-09T07:03:37Z","purpose":"describing","value":"judgment","type":"TextualBody"}',
    },
    {
      annotationId: 'http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d',
      id: 'a1e9750a-e0ce-4e38-8372-406e5c8d0d94',
      creators: ['Tester'],
      created: '2024-07-09T07:03:38.000Z',
      modified: '2024-07-09T07:03:38.000Z',
      value: 'mrw (direct)',
      purpose: 'classifying',
      fullJson:
        '{"creator":{"type":"Person","name":"Tester"},"created":"2024-07-09T07:03:38.058500Z","modified":"2024-07-09T07:03:38.058501Z","purpose":"classifying","value":"mrw (direct)","type":"TextualBody"}',
    },
  ],
  id: 'http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d',
  modified: '2024-07-09T07:03:37.000Z',
  creators: ['Tester'],
  created: '2024-07-09T07:03:37.000Z',
  color: 'MRW_DIRECT',
  targets: [
    {
      type: 'TEXT',
      linkToResource:
        'http://localhost:8090/api/v1/dataresources/3bb48acd-5296-4343-949c-0eca80aa578f/data/Book_of_Psalms.xml',
      selector: {
        xPath: 'id("w.219")',
      },
    },
  ],
  motivation: 'describing',
  tags: [],
  isAlgorithmAnnotation: false,
  etag: '"tlphuwxqjjbeovceyeul"',
};

describe('selecting an annotation', () => {
  // regex to match "jsonform-NUMBER" as the jsonForm library enumerates the forms dynamically
  // making testing hard. So the enumeration has to be removed
  const regex = /(jsonform-[0-9]{1,3})/g;
  describe('successfully and rendering it', () => {
    beforeAll(() => {
      jest.spyOn(utils, 'getData').mockReturnValue(annoData);
      jest.spyOn(projectspecificAnnotationCard, 'changeLabel').mockImplementation((param) => param + ': ');
    });
    beforeEach(() => {
      window.EDITORTYPE = 'DEFAULT';
    });
    it('returns the annotation and renders it in a div', async () => {
      // emptying the dom
      document.body.innerHTML = '';
      // addding the container div for the annotationCard
      let $container = document.createElement('div');
      $container.id = 'annotationCard';
      $container.classList.add('card');
      $container.classList.add('card-body');
      $container.classList.add('row-gap-2');
      let $child = document.createElement('div');
      $child.id = 'toBeRemoved';

      $container.appendChild($child);
      document.body.appendChild($container);

      const selectedAnnotation = await selectAnnotation('event', 'annoId', {});
      const filledCard = `<div id="annotationCard" class="card card-body row-gap-2"><div id="iconRowTop" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="text-end"><i id="addBody" class="bx bx-plus"></i><i id="deleteAnnotation" class="bx bx-trash"></i></div><div><div class="form-group jsonform-error-creators"><label for="-elt-creators">creators</label><div class="controls"><div id="-elt-creators"><ul class="_jsonform-array-ul" style="list-style-type:none;"><li data-idx="0"><div class="form-group jsonform-error-creators[0]"><label for="-elt-creators[0]">creators</label><div class="controls"><input type="text" class="form-control" name="creators[0]" value="Tester" id="-elt-creators[0]" aria-label="creators"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></li></ul><span class="_jsonform-array-buttons"><a href="#" class="btn btn-default _jsonform-array-addmore"><i class="glyphicon glyphicon-plus-sign" title="Add new"></i></a> <a href="#" class="btn btn-default _jsonform-array-deletelast"><i class="glyphicon glyphicon-minus-sign" title="Delete last"></i></a></span></div><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-modified"><label for="-elt-modified">modified</label><div class="controls"><input type="text" class="form-control" name="modified" value="2024-07-09T07:03:37.000Z" id="-elt-modified" aria-label="modified"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></div><div id="topButtonContainer"></div><div class="card"><div class="row"><div id="2741aaf0-0fac-4690-81b4-8d0301f40a97" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="d-flex align-items-center formBodyDiv"><div id="iconRow0"><i id="expandexpand0" class="bx bx-chevron-right"></i><i id="delete0" class="bx bx-trash"></i></div><form id="formHorizontal2741aaf0-0fac-4690-81b4-8d0301f40a97" class="horizontalFormForm flex-fill" style="margin-left: 0.5rem;"><div><div class="form-group jsonform-error-id d-none"><label for="-elt-id">id</label><div class="controls"><input type="text" class="form-control" name="id" value="2741aaf0-0fac-4690-81b4-8d0301f40a97" id="-elt-id" aria-label="id"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-creators d-none"><label for="-elt-creators">creators</label><div class="controls"><div id="-elt-creators"><ul class="_jsonform-array-ul" style="list-style-type:none;"><li data-idx="0"><div class="form-group jsonform-error-creators[0]"><label for="-elt-creators[0]">creators</label><div class="controls"><input type="text" class="form-control" name="creators[0]" value="Tester" id="-elt-creators[0]" aria-label="creators"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></li></ul><span class="_jsonform-array-buttons"><a href="#" class="btn btn-default _jsonform-array-addmore"><i class="glyphicon glyphicon-plus-sign" title="Add new"></i></a> <a href="#" class="btn btn-default _jsonform-array-deletelast"><i class="glyphicon glyphicon-minus-sign" title="Delete last"></i></a></span></div><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-modified d-none"><label for="-elt-modified">modified</label><div class="controls"><input type="text" class="form-control" name="modified" value="2024-07-09T07:03:37.000Z" id="-elt-modified" aria-label="modified"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-value horizontalFormDiv"><label for="-elt-value">describing: </label><div class="controls"><textarea id="-elt-value" name="value" style="height:150px;width:100%;" aria-label="describing: ">judgment long text text text text text text text text text text</textarea><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-purpose d-none"><label for="-elt-purpose">purpose</label><div class="controls"><input type="text" class="form-control" name="purpose" value="describing" id="-elt-purpose" aria-label="purpose"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></div></form></div></div><div class="row collapse"><form id="form2741aaf0-0fac-4690-81b4-8d0301f40a97" class="col"><div><fieldset class="form-group jsonform-error-  "><div class="form-group jsonform-error-id"><label for="-elt-id">id</label><div class="controls"><input type="text" class="form-control" name="id" value="2741aaf0-0fac-4690-81b4-8d0301f40a97" id="-elt-id" aria-label="id"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-creators"><label for="-elt-creators">creators</label><div class="controls"><div id="-elt-creators"><ul class="_jsonform-array-ul" style="list-style-type:none;"><li data-idx="0"><div class="form-group jsonform-error-creators[0]"><label for="-elt-creators[0]">creators</label><div class="controls"><input type="text" class="form-control" name="creators[0]" value="Tester" id="-elt-creators[0]" aria-label="creators"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></li></ul><span class="_jsonform-array-buttons"><a href="#" class="btn btn-default _jsonform-array-addmore"><i class="glyphicon glyphicon-plus-sign" title="Add new"></i></a> <a href="#" class="btn btn-default _jsonform-array-deletelast"><i class="glyphicon glyphicon-minus-sign" title="Delete last"></i></a></span></div><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-modified"><label for="-elt-modified">modified</label><div class="controls"><input type="text" class="form-control" name="modified" value="2024-07-09T07:03:37.000Z" id="-elt-modified" aria-label="modified"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-purpose"><label for="-elt-purpose">purpose</label><div class="controls"><input type="text" class="form-control" name="purpose" value="describing" id="-elt-purpose" aria-label="purpose"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-value"><label for="-elt-value">describing: </label><div class="controls"><input type="text" class="form-control" name="value" value="judgment long text text text text text text text text text text" id="-elt-value" aria-label="describing: "><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></fieldset><input type="submit" class="btn btn-primary " value="Update + Save"></div></form></div></div><div class="card"><div class="row"><div id="a1e9750a-e0ce-4e38-8372-406e5c8d0d94" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="d-flex align-items-center formBodyDiv"><div id="iconRow1"><i id="expandexpand1" class="bx bx-chevron-right"></i><i id="delete1" class="bx bx-trash"></i></div><form id="formHorizontala1e9750a-e0ce-4e38-8372-406e5c8d0d94" class="horizontalFormForm flex-fill" style="margin-left: 0.5rem;"><div><div class="form-group jsonform-error-id d-none"><label for="-elt-id">id</label><div class="controls"><input type="text" class="form-control" name="id" value="a1e9750a-e0ce-4e38-8372-406e5c8d0d94" id="-elt-id" aria-label="id"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-creators d-none"><label for="-elt-creators">creators</label><div class="controls"><div id="-elt-creators"><ul class="_jsonform-array-ul" style="list-style-type:none;"><li data-idx="0"><div class="form-group jsonform-error-creators[0]"><label for="-elt-creators[0]">creators</label><div class="controls"><input type="text" class="form-control" name="creators[0]" value="Tester" id="-elt-creators[0]" aria-label="creators"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></li></ul><span class="_jsonform-array-buttons"><a href="#" class="btn btn-default _jsonform-array-addmore"><i class="glyphicon glyphicon-plus-sign" title="Add new"></i></a> <a href="#" class="btn btn-default _jsonform-array-deletelast"><i class="glyphicon glyphicon-minus-sign" title="Delete last"></i></a></span></div><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-modified d-none"><label for="-elt-modified">modified</label><div class="controls"><input type="text" class="form-control" name="modified" value="2024-07-09T07:03:38.000Z" id="-elt-modified" aria-label="modified"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-value horizontalFormDiv"><label for="-elt-value">classifying: </label><div class="controls"><input type="text" class="form-control" name="value" value="mrw (direct)" id="-elt-value" aria-label="classifying: "><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-purpose d-none"><label for="-elt-purpose">purpose</label><div class="controls"><input type="text" class="form-control" name="purpose" value="classifying" id="-elt-purpose" aria-label="purpose"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><input type="submit" class="btn horizontalFormInput btn-success" value="Save" disabled=""></div></form></div></div><div class="row collapse"><form id="forma1e9750a-e0ce-4e38-8372-406e5c8d0d94" class="col"><div><fieldset class="form-group jsonform-error-  "><div class="form-group jsonform-error-id"><label for="-elt-id">id</label><div class="controls"><input type="text" class="form-control" name="id" value="a1e9750a-e0ce-4e38-8372-406e5c8d0d94" id="-elt-id" aria-label="id"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-creators"><label for="-elt-creators">creators</label><div class="controls"><div id="-elt-creators"><ul class="_jsonform-array-ul" style="list-style-type:none;"><li data-idx="0"><div class="form-group jsonform-error-creators[0]"><label for="-elt-creators[0]">creators</label><div class="controls"><input type="text" class="form-control" name="creators[0]" value="Tester" id="-elt-creators[0]" aria-label="creators"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></li></ul><span class="_jsonform-array-buttons"><a href="#" class="btn btn-default _jsonform-array-addmore"><i class="glyphicon glyphicon-plus-sign" title="Add new"></i></a> <a href="#" class="btn btn-default _jsonform-array-deletelast"><i class="glyphicon glyphicon-minus-sign" title="Delete last"></i></a></span></div><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-modified"><label for="-elt-modified">modified</label><div class="controls"><input type="text" class="form-control" name="modified" value="2024-07-09T07:03:38.000Z" id="-elt-modified" aria-label="modified"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-purpose"><label for="-elt-purpose">purpose</label><div class="controls"><input type="text" class="form-control" name="purpose" value="classifying" id="-elt-purpose" aria-label="purpose"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-value"><label for="-elt-value">classifying: </label><div class="controls"><input type="text" class="form-control" name="value" value="mrw (direct)" id="-elt-value" aria-label="classifying: "><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></fieldset><input type="submit" class="btn btn-primary " value="Update + Save"></div></form></div></div><div id="bottomButtonContainer"></div></div>`;

      const $annotationCard = document.getElementById('annotationCard');
      expect($annotationCard.outerHTML.replaceAll(regex, '')).toEqual(filledCard.replaceAll(regex, ''));
      expect(document.getElementById('toBeRemoved')).toBe(null);
      expect(selectedAnnotation).toEqual(annoData);
    });

    it('calls all the hooks', async () => {
      // emptying the dom
      document.body.innerHTML = '';
      // addding the container div for the annotationCard
      let $child = document.createElement('div');
      $child.id = 'annotationCard';
      $child.classList.add('card');
      $child.classList.add('card-body');
      $child.classList.add('row-gap-2');

      document.body.appendChild($child);

      const manipulatingData = jest.fn((data) => {
        data.manipulated = true;
        return data;
      });
      const preAppendingBodies = jest.fn((data, div) => div);
      const preHorizontalBodyCardCreation = jest.fn(
        (operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal, annotationId, body) => {
          return [operationHorizontal, formBodyDataModelHorizontal, uiFormHorizontal, body];
        },
      );
      const postAppendingBodies = jest.fn((data, div) => div);
      const postAnnotationCardCreation = jest.fn((data, div) => div);

      let hooks = {
        manipulatingData: [manipulatingData],
        preAppendingBodies: [preAppendingBodies],
        preHorizontalBodyCardCreation: [preHorizontalBodyCardCreation],
        postAppendingBodies: [postAppendingBodies],
        postAnnotationCardCreation: [postAnnotationCardCreation],
      };

      await selectAnnotation('event', 'annoId', hooks);
      expect(manipulatingData).toHaveBeenCalled();
      expect(preAppendingBodies).toHaveBeenCalled();
      expect(preHorizontalBodyCardCreation).toHaveBeenCalled();
      expect(postAppendingBodies).toHaveBeenCalled();
      expect(postAnnotationCardCreation).toHaveBeenCalled();
    });

    it('highlights the target of the annotation in the text (textEditor only)', async () => {
      // emptying the dom
      document.body.innerHTML = '';
      // setting up the textEditor
      window.EDITORTYPE = 'TEXT';
      const $TEI = document.createElement('div');
      $TEI.id = 'TEI';
      const $updateTargetButton = document.createElement('div');
      $updateTargetButton.id = 'updateTargetButton';
      const $dismissUpdateButton = document.createElement('div');
      $dismissUpdateButton.id = 'dismissTargetUpdate';
      const $word219 = document.createElement('div');
      $word219.id = 'w.219';
      const $word220 = document.createElement('div');
      $word220.id = 'w.220';
      $word220.classList.add('selected');
      document.body.appendChild($TEI);
      document.body.appendChild($updateTargetButton);
      document.body.appendChild($dismissUpdateButton);
      $TEI.appendChild($word219);
      $TEI.appendChild($word220);
      // addding the container div for the annotationCard
      let $child = document.createElement('div');
      $child.id = 'annotationCard';
      $child.classList.add('card');
      $child.classList.add('card-body');
      $child.classList.add('row-gap-2');
      document.body.appendChild($child);

      await selectAnnotation('event', 'annoId', {});
      expect($word219.classList.contains('selected')).toBe(true);
      expect($word220.classList.contains('selected')).toBe(false);
    });
  });

  describe('unsuccessfully and aborting', () => {
    it("fails on loading the data/can't find the annotation", async () => {
      jest.spyOn(utils, 'getData').mockReturnValue(null);
      const selectedAnnotation = await selectAnnotation('event', 'annoId', {});
      expect(selectedAnnotation).toEqual({});
    });
  });
});
