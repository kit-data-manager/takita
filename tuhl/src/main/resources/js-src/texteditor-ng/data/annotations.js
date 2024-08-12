import { encodeAnnoId } from '../../common/utils';
import { getColorNameFromEnumEntry } from '../../projectspecific';
import {
  getAnnotation,
  getAllAnnotations,
  createAnnotation,
  createBody,
  deleteBody,
  updateBody,
  deleteAnnotation,
  updateTarget,
} from '../network';
/**
 * Build the URL under which we can access annotation data.
 * @param {String} annoId single encoded Id of the annotation
 * @returns {String} full URL, ready for fetching
 */
function buildAnnoUrl(annoId) {
  return window.CONTEXTPATH + 'editor_rest/annotations/' + encodeAnnoId(annoId);
}

// GET

/**
 * Helper/facade for network/annotation.js for the fetch call to get an annotation
 *
 * @param {String} annoId single encoded Id of the annotation
 * @throws {Exception} if the annotation couldn't be fetched
 * @returns {Object} annotation data
 */
export async function getAnnotationData(annoId) {
  const url = buildAnnoUrl(annoId);
  const response = await getAnnotation(url);
  if (response.status == 200) {
    return await response.json();
  } else {
    throw new Error('Getting the annotation failed with response: ', response);
  }
}

/**
 * Helper/facade for network/annotation.js for the fetch call to get all annotations (annoJson)
 *
 * @throws {Exception} if the annotations couldn't be fetched
 * @returns {Object} annotations data (annoJson)
 */
export async function getAllAnnotationsData() {
  // TODO: this should use the 'editor_rest' endpoint like the other functions. Therefore, the
  // endpoint in the serverside java code needs to be changed
  const url = window.CONTEXTPATH + 'editor/' + window.CURRENTPAGEID + '/displayableAnnotationsJSON';
  const response = await getAllAnnotations(url);
  if (response.status == 200) {
    return await response.json();
  } else {
    throw new Error('Getting all annotations failed with response: ', response);
  }
}

// CREATE
/**
 * Helper/facade for network/annotation.js for the fetch call to create a new annotation
 *
 * @param {Object} annotationData to be stored as a new annotation
 * @throws {Exception} if the annotation couldn't be created
 * @returns {Object} annotation data
 */
export async function createAnnotationData(annotationData) {
  const url = window.CONTEXTPATH + 'editor_rest/annotations';
  const response = await createAnnotation(url, annotationData);
  if (response.status == 200) {
    return await response.json();
  } else {
    throw new Error('Annotation creation failed with response: ', response);
  }
}

/**
 * Helper/facade for network/annotation.js for the fetch call to create a new body
 *
 * @param {String} annoId unencoded annotation id
 * @param {*} bodyData to be stored for the annotation with the given id
 * @throws {Exception} if the body couldn't be created
 * @returns {Object} annotation data
 */
export async function createBodyData(annoId, bodyData) {
  // double encoding the id. This is only necessary for creation of bodies
  const annoIdEncoded = encodeAnnoId(encodeAnnoId(annoId));
  const type = bodyData.purpose === 'tagging' ? '/tags' : '/bodies';
  const url = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + type;

  const response = await createBody(url, bodyData);
  if (response.status == 200) {
    return await response.json();
  } else {
    throw new Error('Body creation failed with response: ', response);
  }
}

// UPDATE

/**
 * Helper/facade for network/annotation.js for the fetch call to update a body
 *
 * @param {String} annoIdEncoded single encoded Id of the annotation to be updated
 * @param {String} newBody the body, containing the body Id and the new value
 * @throws {Exception} if the body wasn't updated
 * @returns {Response} of the update request
 */
export async function updateBodyData(annoId, newBody) {
  // construct the url/endpoint
  const annoIdEncoded = encodeAnnoId(annoId);
  const type = newBody.purpose === 'tagging' ? '/tags/' : '/bodies/';
  const url = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + type + newBody.id;

  const response = await updateBody(url, newBody);
  if (response.status == 200) {
    return await response.json();
  } else {
    throw new Error('Body update failed with response: ', response);
  }
}

/**
 * Helper/facade for network/annotation.js for the fetch call to update a target
 *
 * @param {Object} anno the annotation to be updated
 * @param {String} newTarget containing the new target (svg code or xPath)
 * @throws {Exception} if the tsrget wasn't updated
 * @returns {Response} of the update request
 */
export async function updateTargetData(anno, newTarget) {
  const idOfAnnotationToUpdate = encodeAnnoId(anno.id);

  // update the target of an annotation (and the "purpose:describing" body, if it exists) by sending a put request
  const colorName = getColorNameFromEnumEntry(anno.color);
  const annotationDataJson = { color: colorName, motivation: 'describing', svgCode: newTarget };

  const url = window.CONTEXTPATH + 'editor_rest/annotations/' + idOfAnnotationToUpdate;

  const response = await updateTarget(url, annotationDataJson);
  if (response.status == 200) {
    return await response.json();
  } else {
    throw new Error('Target update failed with response: ', response);
  }
}

// DELETE

/**
 * Helper/facade for network/annotation.js for the fetch call to delete an annotation
 *
 * @param {String} annoId single encoded id of the annotation, which will be deleted
 * @throws {Exception} if the body wasn't deleted
 * @returns {Response} of the deletion request
 */
export async function deleteAnnotationData(annoId) {
  const annoIdEncoded = encodeAnnoId(annoId);
  const url = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded;
  const response = await deleteAnnotation(url);
  if (response.status == 204) {
    return response;
  } else {
    throw new Error('Annotation deletion failed with response: ', response);
  }
}

/**
 * Helper/facade for network/annotation.js for the fetch call to delete a body
 *
 * @param {String} annoId single encoded id of the annotation, where a body will be deleted
 * @param {Object} body to be deleted
 * @throws {Exception} if the body wasn't deleted
 * @returns {Response} of the deletion request
 */
export async function deleteBodyData(annoId, body) {
  //console.log(annoId);
  //console.log(bodyId);

  // let annoIdEncoded = encodeAnnoId(annoId);

  // $.ajax({
  //   type: 'DELETE',
  //   url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId,

  //   success: function (responseData) {
  //     //console.log(responseData);
  //     selectAnnotation(null, annoIdEncoded);
  //     // updating the display for text annotation
  //     // checking if TEI-element is null. it is defined for text annotation,
  //     // but not for image annotation
  //     if (document.getElementById('TEI') != null) {
  //       // redrawing all annotations
  //       updateDisplay();
  //     }
  //   },

  //   error: function (errorData) {
  //     //console.log(errorData);

  //     $.ajax({
  //       type: 'DELETE',
  //       url: window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/tags/' + bodyId,

  //       success: function (responseData) {
  //         //console.log(responseData);
  //         selectAnnotation(null, annoIdEncoded);
  //         // TODO: this is just a bandaid for now as it empties the tags array completly
  //         // so if there would be multiple tags none would be left, even if only one got
  //         // deleted. For now in (CRC1475) an annotation only has one tag anyways.

  //         // updating the display for text annotation
  //         // checking if TEI-element is null. it is defined for text annotation,
  //         // but not for image annotation
  //         if (document.getElementById('TEI') != null) {
  //           // redrawing all annotations
  //           updateDisplay();
  //         }
  //       },
  //     });
  //   },
  // });

  /* legace code version, similiar to the code above
    const annoIdEncoded = encodeAnnoId(annoId);
    // try to delete the body assuming its a "textcard" first
    let url = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/bodies/' + bodyId;
    const responseBody = await deleteAnnotationBody(url);
    if (responseBody.status == 204) {
      selectAnnotation(null, annoIdEncoded);
      if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
        // redraw
        updateDisplay();
      }
    } else if (responseBody.status != 204) {
      // delete the body if its a "tag"
      url = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + '/tags/' + bodyId;
      const responseTag = await deleteAnnotationBody(url);
      if (responseTag.status == 204) {
        selectAnnotation(null, annoIdEncoded);
        if (window.EDITORTYPE == 'TEXT' && document.getElementById('TEI') != null) {
          // redraw
          updateDisplay();
        }
      }
    } else {
      console.error(responseBody);
    }
    */

  // NOTE: the following code requires the presence of the "purpose"-field in the annotation.
  // If that field is not present use the legacy code version above.
  const annoIdEncoded = encodeAnnoId(annoId);
  const type = body.purpose === 'tagging' ? '/tags/' : '/bodies/';
  const url = window.CONTEXTPATH + 'editor_rest/annotations/' + annoIdEncoded + type + body.id;
  const response = await deleteBody(url);
  if (response.status == 204) {
    return response;
  } else {
    throw new Error('Body deletion failed with response: ', response);
  }
}
