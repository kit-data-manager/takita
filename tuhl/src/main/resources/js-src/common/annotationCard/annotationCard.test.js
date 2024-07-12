import { selectAnnotation } from './annotationCard';
//import { getData } from './utils';
import * as utils from './utils';

const annoData = {
  pageId: '3bb48acd-5296-4343-949c-0eca80aa578f',
  textCards: [
    {
      annotationId: 'http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d',
      id: '2741aaf0-0fac-4690-81b4-8d0301f40a97',
      creators: ['Tester'],
      created: {
        seconds: 1720508617,
        nanos: 0,
      },
      modified: {
        seconds: 1720508617,
        nanos: 0,
      },
      value: 'judgment',
      purpose: 'describing',
      fullJson:
        '{"creator":{"type":"Person","name":"Tester"},"created":"2024-07-09T07:03:37Z","modified":"2024-07-09T07:03:37Z","purpose":"describing","value":"judgment","type":"TextualBody"}',
    },
    {
      annotationId: 'http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d',
      id: 'a1e9750a-e0ce-4e38-8372-406e5c8d0d94',
      creators: ['Tester'],
      created: {
        seconds: 1720508618,
        nanos: 0,
      },
      modified: {
        seconds: 1720508618,
        nanos: 0,
      },
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
    });

    it('returns the annotation and renders it in a div', async () => {
      // emptying the dom
      document.body.innerHTML = '';
      // addding the container div for the annotationCard
      let $child = document.createElement('div');
      $child.id = 'annotationCard';
      $child.classList.add('card');
      $child.classList.add('card-body');
      $child.classList.add('is-full-width');

      document.body.appendChild($child);

      const selectedAnnotation = await selectAnnotation('event', 'annoId', {});
      const filledCard = `<div id="annotationCard" class="card card-body is-full-width"><div id="iconRowTop" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="is-right is-full-width"><i id="addBody" class="bx bx-plus"></i><i id="deleteAnnotation" class="bx bx-trash"></i></div><div><div class="form-group jsonform-error-creators"><label for="jsonform-1-elt-creators">creators</label><div class="controls"><div id="jsonform-1-elt-creators"><ul class="_jsonform-array-ul" style="list-style-type:none;"><li data-idx="0"><div class="form-group jsonform-error-creators[0]"><label for="jsonform-1-elt-creators[0]">creators</label><div class="controls"><input type="text" class="form-control" name="creators[0]" value="Tester" id="jsonform-1-elt-creators[0]" aria-label="creators"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></li></ul><span class="_jsonform-array-buttons"><a href="#" class="btn btn-default _jsonform-array-addmore"><i class="glyphicon glyphicon-plus-sign" title="Add new"></i></a> <a href="#" class="btn btn-default _jsonform-array-deletelast"><i class="glyphicon glyphicon-minus-sign" title="Delete last"></i></a></span></div><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-modified"><label for="jsonform-1-elt-modified">modified</label><div class="controls"><input type="text" class="form-control" name="modified" value="2024-07-09T07:03:37.000Z" id="jsonform-1-elt-modified" aria-label="modified"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></div><div class="card"><div class="row is-full-width"><div id="2741aaf0-0fac-4690-81b4-8d0301f40a97" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="is-left col formBodyDiv"><div id="iconRow0"><i id="expandexpand0" class="bx bx-chevron-right"></i><i id="delete0" class="bx bx-trash"></i></div><form id="formHorizontal2741aaf0-0fac-4690-81b4-8d0301f40a97" class="col horizontalFormForm"><div><div class="form-group jsonform-error-id is-hidden"><label for="jsonform-3-elt-id">id</label><div class="controls"><input type="text" class="form-control" name="id" value="2741aaf0-0fac-4690-81b4-8d0301f40a97" id="jsonform-3-elt-id" aria-label="id"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-creators is-hidden"><label for="jsonform-3-elt-creators">creators</label><div class="controls"><div id="jsonform-3-elt-creators"><ul class="_jsonform-array-ul" style="list-style-type:none;"><li data-idx="0"><div class="form-group jsonform-error-creators[0]"><label for="jsonform-3-elt-creators[0]">creators</label><div class="controls"><input type="text" class="form-control" name="creators[0]" value="Tester" id="jsonform-3-elt-creators[0]" aria-label="creators"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></li></ul><span class="_jsonform-array-buttons"><a href="#" class="btn btn-default _jsonform-array-addmore"><i class="glyphicon glyphicon-plus-sign" title="Add new"></i></a> <a href="#" class="btn btn-default _jsonform-array-deletelast"><i class="glyphicon glyphicon-minus-sign" title="Delete last"></i></a></span></div><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-modified is-hidden"><label for="jsonform-3-elt-modified">modified</label><div class="controls"><input type="text" class="form-control" name="modified" value="2024-07-09T07:03:37.000Z" id="jsonform-3-elt-modified" aria-label="modified"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-value horizontalFormDiv"><label for="jsonform-3-elt-value">Selected text: </label><div class="controls"><input type="text" class="form-control" name="value" value="judgment" id="jsonform-3-elt-value" aria-label="Selected text: "><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-purpose is-hidden"><label for="jsonform-3-elt-purpose">purpose</label><div class="controls"><input type="text" class="form-control" name="purpose" value="describing" id="jsonform-3-elt-purpose" aria-label="purpose"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></div></form></div></div><div class="row is-full-width is-hidden"><form id="form2741aaf0-0fac-4690-81b4-8d0301f40a97" class="col"><div><fieldset class="form-group jsonform-error-  "><div class="form-group jsonform-error-id"><label for="jsonform-2-elt-id">id</label><div class="controls"><input type="text" class="form-control" name="id" value="2741aaf0-0fac-4690-81b4-8d0301f40a97" id="jsonform-2-elt-id" aria-label="id"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-creators"><label for="jsonform-2-elt-creators">creators</label><div class="controls"><div id="jsonform-2-elt-creators"><ul class="_jsonform-array-ul" style="list-style-type:none;"><li data-idx="0"><div class="form-group jsonform-error-creators[0]"><label for="jsonform-2-elt-creators[0]">creators</label><div class="controls"><input type="text" class="form-control" name="creators[0]" value="Tester" id="jsonform-2-elt-creators[0]" aria-label="creators"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></li></ul><span class="_jsonform-array-buttons"><a href="#" class="btn btn-default _jsonform-array-addmore"><i class="glyphicon glyphicon-plus-sign" title="Add new"></i></a> <a href="#" class="btn btn-default _jsonform-array-deletelast"><i class="glyphicon glyphicon-minus-sign" title="Delete last"></i></a></span></div><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-modified"><label for="jsonform-2-elt-modified">modified</label><div class="controls"><input type="text" class="form-control" name="modified" value="2024-07-09T07:03:37.000Z" id="jsonform-2-elt-modified" aria-label="modified"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-purpose"><label for="jsonform-2-elt-purpose">purpose</label><div class="controls"><input type="text" class="form-control" name="purpose" value="describing" id="jsonform-2-elt-purpose" aria-label="purpose"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-value"><label for="jsonform-2-elt-value">Selected text: </label><div class="controls"><input type="text" class="form-control" name="value" value="judgment" id="jsonform-2-elt-value" aria-label="Selected text: "><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></fieldset><input type="submit" class="btn btn-primary " value="Update + Save"></div></form></div></div><div class="card"><div class="row is-full-width"><div id="a1e9750a-e0ce-4e38-8372-406e5c8d0d94" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="is-left col formBodyDiv"><div id="iconRow1"><i id="expandexpand1" class="bx bx-chevron-right"></i><i id="delete1" class="bx bx-trash"></i></div><form id="formHorizontala1e9750a-e0ce-4e38-8372-406e5c8d0d94" class="col horizontalFormForm"><div><div class="form-group jsonform-error-id is-hidden"><label for="jsonform-5-elt-id">id</label><div class="controls"><input type="text" class="form-control" name="id" value="a1e9750a-e0ce-4e38-8372-406e5c8d0d94" id="jsonform-5-elt-id" aria-label="id"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-creators is-hidden"><label for="jsonform-5-elt-creators">creators</label><div class="controls"><div id="jsonform-5-elt-creators"><ul class="_jsonform-array-ul" style="list-style-type:none;"><li data-idx="0"><div class="form-group jsonform-error-creators[0]"><label for="jsonform-5-elt-creators[0]">creators</label><div class="controls"><input type="text" class="form-control" name="creators[0]" value="Tester" id="jsonform-5-elt-creators[0]" aria-label="creators"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></li></ul><span class="_jsonform-array-buttons"><a href="#" class="btn btn-default _jsonform-array-addmore"><i class="glyphicon glyphicon-plus-sign" title="Add new"></i></a> <a href="#" class="btn btn-default _jsonform-array-deletelast"><i class="glyphicon glyphicon-minus-sign" title="Delete last"></i></a></span></div><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-modified is-hidden"><label for="jsonform-5-elt-modified">modified</label><div class="controls"><input type="text" class="form-control" name="modified" value="2024-07-09T07:03:38.000Z" id="jsonform-5-elt-modified" aria-label="modified"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-value horizontalFormDiv"><label for="jsonform-5-elt-value">Classification: </label><div class="controls"><input type="text" class="form-control" name="value" value="mrw (direct)" id="jsonform-5-elt-value" aria-label="Classification: "><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-purpose is-hidden"><label for="jsonform-5-elt-purpose">purpose</label><div class="controls"><input type="text" class="form-control" name="purpose" value="classifying" id="jsonform-5-elt-purpose" aria-label="purpose"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><input type="submit" class="btn btn-primary horizontalFormInput" value="Save" disabled=""></div></form></div></div><div class="row is-full-width is-hidden"><form id="forma1e9750a-e0ce-4e38-8372-406e5c8d0d94" class="col"><div><fieldset class="form-group jsonform-error-  "><div class="form-group jsonform-error-id"><label for="jsonform-4-elt-id">id</label><div class="controls"><input type="text" class="form-control" name="id" value="a1e9750a-e0ce-4e38-8372-406e5c8d0d94" id="jsonform-4-elt-id" aria-label="id"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-creators"><label for="jsonform-4-elt-creators">creators</label><div class="controls"><div id="jsonform-4-elt-creators"><ul class="_jsonform-array-ul" style="list-style-type:none;"><li data-idx="0"><div class="form-group jsonform-error-creators[0]"><label for="jsonform-4-elt-creators[0]">creators</label><div class="controls"><input type="text" class="form-control" name="creators[0]" value="Tester" id="jsonform-4-elt-creators[0]" aria-label="creators"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></li></ul><span class="_jsonform-array-buttons"><a href="#" class="btn btn-default _jsonform-array-addmore"><i class="glyphicon glyphicon-plus-sign" title="Add new"></i></a> <a href="#" class="btn btn-default _jsonform-array-deletelast"><i class="glyphicon glyphicon-minus-sign" title="Delete last"></i></a></span></div><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-modified"><label for="jsonform-4-elt-modified">modified</label><div class="controls"><input type="text" class="form-control" name="modified" value="2024-07-09T07:03:38.000Z" id="jsonform-4-elt-modified" aria-label="modified"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-purpose"><label for="jsonform-4-elt-purpose">purpose</label><div class="controls"><input type="text" class="form-control" name="purpose" value="classifying" id="jsonform-4-elt-purpose" aria-label="purpose"><span class="help-block jsonform-errortext" style="display:none;"></span></div></div><div class="form-group jsonform-error-value"><label for="jsonform-4-elt-value">Classification: </label><div class="controls"><input type="text" class="form-control" name="value" value="mrw (direct)" id="jsonform-4-elt-value" aria-label="Classification: "><span class="help-block jsonform-errortext" style="display:none;"></span></div></div></fieldset><input type="submit" class="btn btn-primary " value="Update + Save"></div></form></div></div></div>`;

      const $annotationCard = document.getElementById('annotationCard');
      expect($annotationCard.outerHTML.replaceAll(regex, '')).toEqual(filledCard.replaceAll(regex, ''));
      expect(selectedAnnotation).toEqual(annoData);
    });

    it('calls all the hooks', async () => {
      const manipulatingData = jest.fn((data) => {
        data.manipulated = true;
        return data;
      });
      const postAnnotationCardCreation = jest.fn((div) => div);
      const preAppendingBodies = jest.fn((div) => div);
      const postAppendingBodies = jest.fn((data, div) => div);
      const preHorizontalBodyCardCreation = jest.fn((id, body) => body);

      let hooks = {
        manipulatingData: [manipulatingData],
        preAppendingBodies: [preAppendingBodies],
        postAppendingBodies: [postAppendingBodies],
        preHorizontalBodyCardCreation: [preHorizontalBodyCardCreation],
        postAnnotationCardCreation: [postAnnotationCardCreation],
      };
      await selectAnnotation('event', 'annoId', hooks);
      expect(manipulatingData).toHaveBeenCalled();
      expect(postAnnotationCardCreation).toHaveBeenCalled();
      expect(preAppendingBodies).toHaveBeenCalled();
      expect(postAppendingBodies).toHaveBeenCalled();
      expect(preHorizontalBodyCardCreation).toHaveBeenCalled();
    });
  });

  describe('unsuccessfully and aborting', () => {
    it('fails on loading the data/can\t find the annotation', async () => {
      jest.spyOn(utils, 'getData').mockReturnValue(null);
      const selectedAnnotation = await selectAnnotation('event', 'annoId', {});
      expect(selectedAnnotation).toEqual({});
    });
  });
});
