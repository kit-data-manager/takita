import { updateBodyData, updateTargetData, getAnnotationData } from '../texteditor-ng/data';
import { timestampsToISOString } from '../common/annotationCard';

/**
 * Helper/facade for network/annotation.js for the fetch call to update a target and body
 *
 * @param {Object} anno the annotation to be updated
 * @param {String} newTarget containing the new target (svg code or xPath)
 * @param {String} newText containing the new selected text
 * @throws {Exception} if the function fails while updating the target, creating the new body
 * or updating the body
 * @returns {Response} of the update request
 */
export async function updateTargetAndBodyData(anno, newTarget, newText) {
  let targetUpdateResponse;
  let bodyUpdateResponse;
  try {
    // update the target first
    // if this fails an exception will be thrown and rethrown, but the body
    // update request will not be send
    targetUpdateResponse = await updateTargetData(anno, newTarget);
    // update the respective body
    const newBody = createNewDescribingBody(targetUpdateResponse, newText);
    bodyUpdateResponse = await updateBodyData(anno.id, newBody);

    return [targetUpdateResponse, bodyUpdateResponse];
  } catch (exception) {
    throw new Error(
      'Failed with target udpate response: ',
      targetUpdateResponse,
      ' or with body update response: ',
      bodyUpdateResponse,
    );
  }
}

/**
 * Creates the datastructure, that is needed to update a body
 *
 * @param {Object} targetUpdateResponse response object from the target update, that happened previously
 * @param {String} newText containing the new selected text
 * @returns {Object} the new body
 */
function createNewDescribingBody(targetUpdateResponse, newText) {
  // find the describing body
  const describingBody = targetUpdateResponse.textCards.filter((textCard) => textCard.purpose === 'describing');
  if (describingBody.length > 0) {
    // create the new body
    targetUpdateResponse = timestampsToISOString(targetUpdateResponse);
    const newBody = {
      created: targetUpdateResponse.created,
      creators: targetUpdateResponse.creators,
      id: describingBody[0].id,
      modified: targetUpdateResponse.modified,
      purpose: describingBody[0].purpose,
      value: newText,
    };
    return newBody;
  } else {
    throw new Error('No describing body available in: ', targetUpdateResponse);
  }
}

// DATA
// gets the describing body of an annotation (mrw-annotation)
// used by src/main/resources/js-src/common/annotationDisplay/selection.js
export async function getMRWAnnoSelectedText(mrwAnnoId) {
  try {
    const mrwAnnotation = await getAnnotationData(mrwAnnoId);
    const describingBody = mrwAnnotation.textCards.filter((textCard) => textCard.purpose === 'describing')[0];
    return describingBody.value;
  } catch (exception) {
    // if the mrw-annotation linked to the metaphor-annotation got deleted or something else went
    // wrong while fetching the annotation, the code will end up here
    console.log(
      `ERROR: Something is wrong with the linked mrw-annotation; 
        most likely it got deleted, please contact the developers`,
      exception,
    );
  }
}
