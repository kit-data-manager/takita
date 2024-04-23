// internal modules
//import '../utils/metadataeditor';
import { encodeAnnoId, completeFormDataModel, toggleExpand } from '../utils';
import { deleteAnnotation, deleteBodyFromAnnotation } from './deletion';
import {
  updateDisplay,
  checkIsTargetCompatible,
  makeTargetsCompatible,
  pickTemplate,
  modifySelection,
  saveModification,
  cancelModification,
} from '../../texteditor/annotationEditor';

// TODO: CUSTMOISE add project specific imports
import { addLinkToAnalysisTool, updateLinkingTextcard } from '../../projectspecific/crc1475';

// called when you select an annotation to display the textCard.


// TODO: CUSTOMISE this function and add corresponding imports
// to change the horizontal display of a textcard
async function projectSpecificTextCardCreation(annoId, resourceHorizontal) {
  return await updateLinkingTextcard(annoId, resourceHorizontal);
}

// TODO: CUSTOMISE this function and add corresponding imports
// to change the div displaying the annotation
function projectSpecificAnnoDivCreation(responseJson, annoId, annotationDiv) {
  addLinkToAnalysisTool(responseJson, annoId, annotationDiv);
}
