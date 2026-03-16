// external modules
import $ from 'jquery';
import './metadataeditor';
//internal modules
import { deleteAnnotationData } from '../data';
import { encodeAnnoId } from './url';
import { selectAnnotation } from '../annotationCard/annotationCard';
import { toggleVisibility } from './display';
import { hooks as hooksText } from '../../texteditor-ng/projectspecific';
import { hooks as hooksImage } from '../../imageeditor-ng/projectspecific';

/**
 * TODO: what does this do @Danah
 *
 * @param {[Object]} annoJson all annotations of a page
 */
export function fillMetaDataEditorTable(annoJson) {
  if (document.getElementById('editor-buttons')) {
    document.getElementById('editor-buttons').remove();
  }

  // decision to only show page annotations in the table
  // can be removed to simply show all annotations of the page
  let filteredAnnoJson = annoJson.filter((anno) => anno.type !== 'Rectangle' && anno.type !== 'Polygon');

  // to include the shape type of the annotation add:
  // "Type": {"type": "string", "title": "Type"}
  let dataModel = {
    type: 'object',
    properties: {
      ID: {
        type: 'string',
        title: 'ID',
      },
    },
  };
  // storing the annotationCard element as its used multiple times in the following code
  const $annotationCard = document.getElementById('annotationCard');
  let items = [
    {
      title: 'Identifier',
      field: 'id',
      headerSort: false,
      cellClick: async function (e, cell) {
        if (window.EDITORTYPE == 'IMAGE') {
          window.SELECTED_ANNOTATION = await selectAnnotation(null, encodeAnnoId(cell.getValue()), hooksImage);
        }
        if (window.EDITORTYPE == 'TEXT') {
          window.SELECTED_ANNOTATION = await selectAnnotation(null, encodeAnnoId(cell.getValue()), hooksText);
        }

        if ($annotationCard.classList.contains('invisible')) {
          toggleVisibility($annotationCard);
        }
        // function to select shape on the canvas
        // not needed as long only page annotations are shown
        //
        //paper.forEach(function(element) {
        // select the shape corresponding to the row
        //    if (element.annoId === cell.getValue()) {
        //        toggleShapeSelect(element);
        //    };
        // deselect former selections
        //    if (element.selected && element.annoId !== cell.getValue()) {
        //        toggleShapeSelect(element);
        //    }
        //});
      },
    },
    //{title: "", field: "icon", formatter:"html", width:60, hozAlign: "center"},
  ];

  let inputs = {
    dataModel: dataModel,
    uiForm: '*',
    resource: filteredAnnoJson,
    items: items,
    // toggling shape visibility on the canvas
    // not needed as long only page annotations are shown
    //
    //readOperation: function (rowColumnvalue){
    //    paper.forEach(function(element) {
    //        if (element.annoId === rowColumnvalue.id) {
    //            toggleShapeVisibility(element);
    //        };
    //    });
    //},
    updateOperation: async function (rowColumnvalue) {
      if (window.EDITORTYPE == 'IMAGE') {
        window.SELECTED_ANNOTATION = await selectAnnotation(null, encodeAnnoId(rowColumnvalue.id), hooksImage);
      }
      if (window.EDITORTYPE == 'TEXT') {
        window.SELECTED_ANNOTATION = await selectAnnotation(null, encodeAnnoId(rowColumnvalue.id), hooksText);
      }

      if ($annotationCard.classList.contains('invisible')) {
        toggleVisibility($annotationCard);
      }
      // toggling shape selection on the canvas
      // not needed as long only page annotations are shown
      //
      //paper.forEach(function(element) {
      //    if (element.annoId === rowColumnvalue.id) {
      //        toggleShapeSelect(element);
      //    };
      //});
    },
    deleteOperation: async function (rowColumnvalue) {
      await deleteAnnotationData(rowColumnvalue.id);
    },
    //creation of page annotations is moved to the sidebar
    //
    //createOperation: { callback: function (){
    //    const modal = document.getElementById("createAnnotation");
    //    modal.classList.toggle("show-modal");
    //    pickTemplate("", "", "createAnnotationForm", "pickAnnotationTemplateForm", "annotationTemplate");
    //}, buttonTitle: "Create New Annotation"},

    // list operation not needed in our use case right now
    //
    //listOperation: function(rowColumnvalue){
    //project-specific implementation.
    //}
  };

  $('#table').metadataeditorTable(inputs);
}

/**
 * test to see if $ and metadataeditor are imported correctly
 *
 * @param {Element} node to be wrapped in a jQuery selection
 * @returns the jQuery selection
 */
export function useJQueryPlugin(node) {
  return $(node);
}
