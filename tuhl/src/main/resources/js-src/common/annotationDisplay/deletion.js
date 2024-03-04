// external modules
import { $ } from 'jquery';
// internal modules
import { toggleOverview, encodeAnnoId, fillMetaDataEditorTable } from '../utils';
import { selectAnnotation } from './selection';
import { updateDisplay } from '../../texteditor/annotationEditor/highlight';

export function deleteBodyFromAnnotation(annoId, bodyId) {
  let confirmation = confirm('Are you sure to delete this body?');

  if (confirmation) {
    //console.log(annoId);
    //console.log(bodyId);

    let annoIdEncoded = encodeAnnoId(annoId);

    $.ajax({
      type: 'DELETE',
      url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId,

      success: function (responseData) {
        //console.log(responseData);
        selectAnnotation(null, annoIdEncoded);
        // updating the display for text annotation
        // checking if TEI-element is null. it is defined for text annotation,
        // but not for image annotation
        if (document.getElementById('TEI') != null) {
          // redrawing all annotations
          updateDisplay();
        }
      },

      error: function (errorData) {
        //console.log(errorData);

        $.ajax({
          type: 'DELETE',
          url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/tags/' + bodyId,

          success: function (responseData) {
            //console.log(responseData);
            selectAnnotation(null, annoIdEncoded);
            // TODO: this is just a bandaid for now as it empties the tags array completly
            // so if there would be multiple tags none would be left, even if only one got
            // deleted. For now in (CRC1475) an annotation only has one tag anyways.

            // updating the display for text annotation
            // checking if TEI-element is null. it is defined for text annotation,
            // but not for image annotation
            if (document.getElementById('TEI') != null) {
              // redrawing all annotations
              updateDisplay();
            }
          },
        });
      },
    });
  }
}

export function deleteAnnotation(annoId) {
  let confirmation = confirm('Are you sure to delete this annotation?');

  if (confirmation) {
    let annoIdEncoded = encodeAnnoId(annoId);

    $.ajax({
      type: 'DELETE',
      url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded,

      success: function (responseData) {
        //console.log(responseData);
        if (!document.getElementById('annotationCard').classList.contains('is-hidden')) {
          toggleOverview('annotationCard');
        }

        // updating the display for image annotation
        // checking if paper is defined. it is defined for image annotation,
        // but not for text annotation
        if (paper != undefined) {
          paper.forEach(function (element) {
            if (element.annoId === annoId) {
              element.remove();
            }
          });
        }

        // this for-loop is unnecessary for the textEditor
        // as the updateDisplay()-function updates the annoJson as well
        // the imageEditor still needs the for-loop
        for (let anno in annoJson) {
          if (annoJson[anno].id === annoId) {
            //console.log(annoId + " this must go!")
            annoJson.splice(anno, 1);
          }
        }

        // updating the display for text annotation
        // checking if TEI-element is null. it is defined for text annotation,
        // but not for image annotation
        if (document.getElementById('TEI') != null) {
          // redrawing all annotations
          updateDisplay();
        }

        // maybe move it within the if clause?
        //console.log(annoJson);
        fillMetaDataEditorTable(annoJson);
      },
    });
  }
}
