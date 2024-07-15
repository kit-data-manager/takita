import { createAnnotationDiv, createBodyCard } from './elements';

describe('appending child elements to a given element (the annotationCard) according to given data', () => {
  // regex to match "jsonform-NUMBER" as the jsonForm library enumerates the forms dynamically
  // making testing hard. So the enumeration has to be removed
  const regex = /(jsonform-[0-9]{1,3})/g;
  let $child;
  let annoData;
  beforeEach(() => {
    // emptying the dom
    document.body.innerHTML = '';
    // addding the container div for the annotationCard
    $child = document.createElement('div');
    $child.id = 'annotationCard';
    $child.classList.add('card');
    $child.classList.add('card-body');
    $child.classList.add('is-full-width');

    document.body.appendChild($child);

    //resetting the annotation data (the timestamps of the created/modified fields of the body get modified during the test)
    annoData = {
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
  });

  describe('in an image editor, it ', () => {
    it('creates an annotationCard', async () => {
      const $annotationCard = await createAnnotationDiv(annoData, $child);
      // eslint-disable-next-line @stylistic/js/max-len, prettier/prettier
      const filledCard = `<div id="annotationCard" class="card card-body is-full-width"><div id="iconRowTop" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="is-right is-full-width"><i id="addBody" class="bx bx-plus"></i><i id="deleteAnnotation" class="bx bx-trash"></i></div><div class="card"><div class="row is-full-width"><div id="2741aaf0-0fac-4690-81b4-8d0301f40a97" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="is-left col formBodyDiv"><div id="iconRow0"><i id="expandexpand0" class="bx bx-chevron-right"></i><i id="delete0" class="bx bx-trash"></i></div><form id="formHorizontal2741aaf0-0fac-4690-81b4-8d0301f40a97" class="col horizontalFormForm"></form></div></div><div class="row is-full-width is-hidden"><form id="form2741aaf0-0fac-4690-81b4-8d0301f40a97" class="col"></form></div></div><div class="card"><div class="row is-full-width"><div id="a1e9750a-e0ce-4e38-8372-406e5c8d0d94" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="is-left col formBodyDiv"><div id="iconRow1"><i id="expandexpand1" class="bx bx-chevron-right"></i><i id="delete1" class="bx bx-trash"></i></div><form id="formHorizontala1e9750a-e0ce-4e38-8372-406e5c8d0d94" class="col horizontalFormForm"></form></div></div><div class="row is-full-width is-hidden"><form id="forma1e9750a-e0ce-4e38-8372-406e5c8d0d94" class="col"></form></div></div></div>`;

      expect($annotationCard.outerHTML.replaceAll(regex, '')).toEqual(filledCard.replaceAll(regex, ''));
    });
  });
  describe('in a text editor, it ', () => {
    beforeEach(() => {
      // mocking a text editor
      window.EDITORTYPE = 'TEXT';
      const $TEI = document.createElement('div');
      $TEI.id = 'TEI';
      const $updateTargetButton = document.createElement('div');
      $updateTargetButton.id = 'updateTargetButton';
      const $closeButtonUpdate = document.createElement('div');
      $closeButtonUpdate.id = 'closeButtonUpdate';

      document.body.appendChild($TEI);
      document.body.appendChild($updateTargetButton);
      document.body.appendChild($closeButtonUpdate);
    });
    it('creates a default annotationCard for the text editor (including the buttons to modify a selection)', async () => {
      document.body.appendChild($child);
      const $annotationCard = await createAnnotationDiv(annoData, $child);
      // eslint-disable-next-line @stylistic/js/max-len, prettier/prettier
      const filledCard = `<div id="annotationCard" class="card card-body is-full-width"><div id="iconRowTop" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="is-right is-full-width"><i id="addBody" class="bx bx-plus"></i><i id="deleteAnnotation" class="bx bx-trash"></i></div><div class="card"><div class="row is-full-width"><div id="2741aaf0-0fac-4690-81b4-8d0301f40a97" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="is-left col formBodyDiv"><div id="iconRow0"><i id="expandexpand0" class="bx bx-chevron-right"></i><i id="delete0" class="bx bx-trash"></i></div><form id="formHorizontal2741aaf0-0fac-4690-81b4-8d0301f40a97" class="col horizontalFormForm"></form></div></div><div class="row is-full-width is-hidden"><form id="form2741aaf0-0fac-4690-81b4-8d0301f40a97" class="col"></form></div></div><div class="card"><div class="row is-full-width"><div id="a1e9750a-e0ce-4e38-8372-406e5c8d0d94" title="http://localhost/wap/sfb1475/philipp/takita/43fad442-ee74-4eac-adae-db4e2fef4b6d" class="is-left col formBodyDiv"><div id="iconRow1"><i id="expandexpand1" class="bx bx-chevron-right"></i><i id="delete1" class="bx bx-trash"></i></div><form id="formHorizontala1e9750a-e0ce-4e38-8372-406e5c8d0d94" class="col horizontalFormForm"></form></div></div><div class="row is-full-width is-hidden"><form id="forma1e9750a-e0ce-4e38-8372-406e5c8d0d94" class="col"></form></div></div><button id="buttonModifySelection">Modify Selection</button><button type="submit" id="buttonSaveModification" disabled="" class="is-hidden">Save Modification</button><button type="submit" id="buttonCancelModification" style="background-color: rgb(200, 37, 37);" disabled="" class="is-hidden">Cancel Modifcation</button></div>`;

      expect($annotationCard.outerHTML.replaceAll(regex, '')).toEqual(filledCard.replaceAll(regex, ''));
      expect(document.getElementById('buttonModifySelection')).toBeTruthy();
    });
  });
});

describe('creating a div for the information of a body (bodyCard)', () => {
  it('', () => {
    const mockBody = { id: 'bodyId', annotationId: 'annotationId' };
    const $bodyCard = createBodyCard('anno', mockBody, 1, null);
    const $filledBodyCard = `<div class="card"><div class="row is-full-width"><div id="bodyId" title="annotationId" class="is-left col formBodyDiv"><div id="iconRow1"><i id="expandexpand1" class="bx bx-chevron-right"></i><i id="delete1" class="bx bx-trash"></i></div><form id="formHorizontalbodyId" class="col horizontalFormForm"></form></div></div><div class="row is-full-width is-hidden"><form id="formbodyId" class="col"></form></div></div>`;
    expect($bodyCard.outerHTML).toStrictEqual($filledBodyCard);
  });
});
