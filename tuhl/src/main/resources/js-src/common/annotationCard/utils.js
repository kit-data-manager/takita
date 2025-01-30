import { getAnnotationData, deleteAnnotationData, deleteBodyData, updateBodyData } from '../../texteditor-ng/data';
import { makeTargetsCompatible, checkIsTargetCompatible } from '../../texteditor-ng/utils';
import { removeStyles } from '../../texteditor-ng/highlighting';
import { updateDisplay } from '../../texteditor-ng/display';
import { toggleVisibility } from '../utils';
import { selectAnnotation } from './annotationCard';
// data manipulation
/**
 * Merges all the bodies of an annotation (tags and textcards) into one array
 *
 * @param {Object} data of the annotation
 * @returns {Array} of Objects holding both the bodies (textcards) and tags of the annotation
 */
export function mergeBodies(data) {
  // let bodies;
  // if (data.tags) {
  //   if (data.textCards) {
  //     bodies = data.tags.concat(data.textCards);
  //   }
  // } else if (data.textCards) {
  //   bodies = data.textCards;
  // } else {
  //   console.error('No bodies (tags/textCards) available in: ', data);
  // }
  return data.tags.concat(data.textCards);
}

/**
 * Converts timestamps into ISOStrings for the creation/modifcation date of annotations
 * and bodies.
 *
 * @param {Object} object can be a body or annotation JSONObject
 * @returns {Object} with timestamps converted to ISOString
 */
export function timestampsToISOString(object) {
  if (object.created) {
    object.created = new Date(object.created * 1000).toISOString();
  }
  // bodies can have a modified date without having a created date
  // 'legacy annotations'
  if (object.modified) {
    object.modified = new Date(object.modified * 1000).toISOString();
  }
  return object;
}

// data CRUD helpers
/**
 * gets the data needed and transfroms it accordingly to create the annotationCard
 *
 * @param {String} annoId single encoded Id of the annotation
 * @returns {Object} the annotation as Object
 */
export async function getData(annoId) {
  let data = null;

  try {
    data = await getAnnotationData(annoId);
    // converting timestamps to ISOStrings
    data = timestampsToISOString(data);

    // creating one list for both textCards ands tags
    data.bodies = mergeBodies(data);

    data.bodies.map((body) => timestampsToISOString(body));

    // make targets compatible for the new textEditor, if necessary
    if (document.getElementById('TEI') != null) {
      if (!checkIsTargetCompatible(data)) {
        data.targets = makeTargetsCompatible(data);
      }
    }
  } catch (exception) {
    console.error(exception);
  }
  return data;
}

/**
 * update a body and reselect the annotation to update the annotationCard and update the display.
 * This is the callback for the "Save" buttons of the JSONForms (vertical and horizontal).
 *
 * @param {String} annoId single encoded Id of the annotation to be updated
 * @param {String} value of the body, containing the body Id and the new value
 * @param {Object} [hooks] containing an array for the hooks to be passed to "selectAnnotation()"
 * @returns {Boolean} true, if the body was succesfully updated, false, if the update failed
 */
export async function updateBody(annoId, value, hooks = {}) {
  let bodyUpdated = false;
  try {
    // parsing the formvalue into JSON as the function to update the body requires
    // a JSONObject
    const body = JSON.parse(value);
    // eslint-disable-next-line no-unused-vars
    const response = await updateBodyData(annoId, body);
    bodyUpdated = true;
    window.SELECTED_ANNOTATION = await selectAnnotation(null, annoId, hooks);
    // updating the display for text annotation
    // checking if TEI-element is null. it is defined for text annotation,
    // but not for image annotation
    if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
      // redraw
      updateDisplay();
    }
  } catch (exception) {
    console.error(exception);
  }
  return bodyUpdated;
}

/**
 * Helper function to delete a body from an annotation. This is the callback for the
 * $deleteBodyIcon.
 *
 * @param {String} annoId single encoded id of the annotation, where to body has to be deleted
 * @param {Object} body to be deleted
 * @param {Object} [hooks] containing an array for the hook to be called at "preHorizontalCreation"
 * @returns {Boolean} true, if the body was succesfully deleted, false, if the user
 * canceled the process or deletion failed
 */
export async function deleteBody(annoId, body, hooks = {}) {
  let confirmation = confirm('Are you sure to delete this body?');

  if (confirmation) {
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await deleteBodyData(annoId, body);
      window.SELECTED_ANNOTATION = await selectAnnotation(null, annoId, hooks);
      if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
        // redraw
        updateDisplay();
      }
    } catch (exception) {
      console.error(exception);
      confirmation = false;
    }
  }
  return confirmation;
}

/**
 * Helper function to an annotation. This is the callback for the $deleteAnnotationIcon.
 *
 * @param {String} annoId single encoded id of the annotation, which has to be deleted
 * @returns {Boolean} true, if the annotation was succesfully deleted, false, if the user
 * canceled the process or deletion failed
 */
export async function deleteAnnotation(annoId) {
  let confirmation = confirm('Are you sure to delete this annotation?');

  if (confirmation) {
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await deleteAnnotationData(annoId);
      const $annotationDiv = document.getElementById('annotationCard');
      if (!$annotationDiv.classList.contains('is-hidden')) {
        toggleVisibility($annotationDiv);
      }

      // updating the display for image annotation
      // checking if paper is defined. it is defined for image annotation,
      // but not for text annotation
      // eslint-disable-next-line no-undef
      if (window.PAPER != undefined) {
        // eslint-disable-next-line no-undef
        window.PAPER.forEach(function (element) {
          if (element.annoId === annoId) {
            element.remove();
          }
        });
      }

      // this for-loop is unnecessary for the textEditor
      // as the updateDisplay()-function updates the annoJson as well
      // the imageEditor still needs the for-loop
      for (let anno in window.ANNOJSON) {
        if (window.ANNOJSON[anno].id === annoId) {
          //console.log(annoId + " this must go!")
          window.ANNOJSON.splice(anno, 1);
        }
      }

      // updating the display for text annotation
      // checking if TEI-element is null. it is defined for text annotation,
      // but not for image annotation
      if (document.getElementById('TEI') != null) {
        // redrawing all annotations
        updateDisplay();
        // removing the highlighting of the now deleted annotation
        removeStyles(document.getElementById('TEI'), ['selected']);
      }

      // maybe move it within the if clause?
      //console.log(annoJson);
      // TODO: previuosly fillMetaDataEditorTable() was used. When modularizing the imageEditor
      // uncomment the next line and import the corresponding function. The textEditor doesn't
      // need it, as the function is included in updateDisplay()
      // initializeAnnotationTable(
      //   window.ANNOJSON,
      //   document.getElementById('annotationTableBottom'),
      //   document.getElementById('annotationCard'),
      //   hooks,
      // );
    } catch (exception) {
      console.error(exception);
      confirmation = false;
    }
  }
  return confirmation;
}
