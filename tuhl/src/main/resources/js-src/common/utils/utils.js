// external modules
import jQuery from 'jquery';
// internal modules
import { selectAnnotation, deleteAnnotation } from '../annotationDisplay';

export function encodeAnnoId(annoId) {
  var annoIdEncoded = encodeURIComponent(annoId);
  //console.log(annoIdEncoded);
  var annoIdEncodedDouble = encodeURIComponent(annoIdEncoded);
  //console.log(annoIdEncodedDouble);
  return annoIdEncodedDouble;
}

// toggle for book and annotation overwiew
// can be used for all divs / cards
export function toggleOverview(divId) {
  let classDomTokens = document.getElementById(divId).classList;
  let buttonElement = document.getElementById(divId + 'Button');
  if (classDomTokens.contains('is-hidden')) {
    classDomTokens.remove('is-hidden');
    if (buttonElement) {
      buttonElement.parentElement.classList.add('active');
      document.getElementById(divId).scrollIntoView();
    }
  } else {
    classDomTokens.add('is-hidden');
    if (buttonElement) {
      buttonElement.parentElement.classList.remove('active');
    }
  }
}

// toggling the bodies within the annotation selection
export function toggleExpand(div) {
  var classDomTokens = div.classList;
  var expandIcon = div.previousElementSibling.firstChild.firstChild.firstChild;
  if (classDomTokens.contains('is-hidden')) {
    classDomTokens.remove('is-hidden');
    expandIcon.classList.remove('bx-chevron-right');
    expandIcon.classList.add('bx-chevron-down');
  } else {
    classDomTokens.add('is-hidden');
    expandIcon.classList.remove('bx-chevron-down');
    expandIcon.classList.add('bx-chevron-right');
  }
}

export function completeFormDataModel(responseJson, formDataModel, addition, omitFields) {
  if (Array.isArray(responseJson[addition])) {
    if (responseJson[addition][0] instanceof Object && omitFields.indexOf(addition) === -1) {
      var properties = {};
      var keys = [];
      for (let jsonObject in responseJson[addition]) {
        keys.push(Object.keys(responseJson[addition][jsonObject]));
      }

      var uniqueKeys = [...new Set(keys.flat())];

      for (let key in uniqueKeys) {
        if (omitFields.indexOf(uniqueKeys[key]) === -1) {
          properties[uniqueKeys[key]] = {
            type: 'string',
            title: uniqueKeys[key],
          };
        }
      }

      formDataModel.properties[addition] = {
        type: 'array',
        items: {
          type: 'object',
          title: addition,
          properties: properties,
        },
      };
    } else if (omitFields.indexOf(addition) === -1) {
      formDataModel.properties[addition] = {
        type: 'array',
        items: {
          type: 'string',
          title: addition,
        },
      };
    }
  } else if (responseJson[addition] instanceof Object && omitFields.indexOf(addition) === -1) {
    var objectKeys = Object.keys(responseJson[addition]);

    var objectProperties = {
      type: 'object',
      properties: {},
    };

    for (let key in objectKeys) {
      if (omitFields.indexOf(objectKeys[key]) === -1) {
        objectProperties.properties[objectKeys[key]] = {
          type: 'string',
          title: objectKeys[key],
        };
      }
    }

    formDataModel.properties[addition] = objectProperties;
  } else {
    // changes to work for the "quick-view"
    let title = addition;
    // if the formDataModel entry for the "value" of the body is created
    // relpace the title with the "purpose" of the body
    if (addition === 'value') {
      // title = responseJson.purpose;
      // TODO: CUSTOMISE the text to be displayed on the "quick-view" of the
      // textCard
      switch (responseJson.purpose) {
        case 'tagging':
          title = 'Tag: ';
          break;
        case 'linking':
          title = 'Linked mrw-annotation: ';
          break;
        case 'classifying':
          title = 'Classification: ';
          break;
        case 'describing':
          title = 'Selected text: ';
          break;
        case 'identifying':
          title = 'Label: ';
          break;
        case 'assessing':
          title = 'Analysis: ';
          break;
        case 'commenting':
          title = 'Comment: ';
          break;
        default:
          title = responseJson.purpose + ': ';
      }
    }
    // console.log(title);
    if (omitFields.indexOf(addition) === -1) {
      formDataModel.properties[addition] = {
        type: 'string',
        title: title,
      };
    }
  }
  return formDataModel;
}

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
      Color: {
        type: 'string',
        title: 'Color',
      },
    },
  };

  let items = [
    {
      title: 'Identifier',
      field: 'id',
      headerSort: false,
      cellClick: function (e, cell) {
        selectAnnotation(null, encodeAnnoId(cell.getValue()));
        if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
          toggleOverview('annotationCard');
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
    { title: '', field: 'color', formatter: 'color', width: 60 },
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
    updateOperation: function (rowColumnvalue) {
      selectAnnotation(null, encodeAnnoId(rowColumnvalue.id));
      if (document.getElementById('annotationCard').classList.contains('is-hidden')) {
        toggleOverview('annotationCard');
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
    deleteOperation: function (rowColumnvalue) {
      deleteAnnotation(rowColumnvalue.id);
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

  jQuery('#table').metadataeditorTable(inputs);
}
