/**
 * available hooks for various modules are:
 *
 * - common/annotationCard: preAppendingBodies, postAppendingBodies, preHorizontalCreation,
 * postAnnotationCardCreation, manipulatingData
 * - texteditor/textloader: preMakeHTML, postApplyStyles
 * - texteditor/editor: postTargetCreation
 */
export const hooks = {
  preAppendingBodies: [],
  postAppendingBodies: [],
  preHorizontalCreation: [],
  postAnnotationCardCreation: [],
  manipulatingData: [],
  preMakeHTML: [],
  postApplyStyles: [],
  postTargetCreation: [],
};

// function postTargetCreationHook(selection, annoJson) {
//   const selectionRangeContents = getContentOfSelection(selection);
//   // emptying the globalMrwAnnos array to only store the mrw
//   // annotations present in the current selection
//   // so they can be accessed in creation_templates_text.js to generate
//   // a list of selected mrws inside a metaphor and link the mrw annotations
//   // to the metaphor annotation
//   window.MRW_ANNOS = [];
//   let targetRangeList = createTargetList(selection);
//   targetRangeList.forEach((range) => {
//     // to prevent duplicates in the globalMrwAnnos array, it has to be cleaned
//     // after more mrw-annotations got included, which might be duplicates. This is needed, because
//     // for some texts multiple ranges get created and then for each individual
//     // range the globalMrwAnno array is appended, which can cause duplicates
//     // https://medium.com/@rivoltafilippo/javascript-merge-arrays-without-duplicates-3fbd8f4881be
//     // TODO: this can be improved by using a set. This will affect storeSelectedMRWAnnos() and
//     // the points in the creation_templates_text.js where the globalMrwAnno array is used.
//     const tmpMrwAnnos = window.MRW_ANNOS.concat(storeSelectedMRWAnnos(annoJson, range.targetList));
//     window.MRW_ANNOS = tmpMrwAnnos.filter((item, idx) => tmpMrwAnnos.indexOf(item) === idx);
//   });

//   // set globalSelectedText so it can be displayed in the modal and remove all whitespaces
//   window.SELECTED_TEXT = removeWhitespaceFromSelectionTextContent(selectionRangeContents.textContent);
//   console.log('GlobalSelectedText: ', window.SELECTED_TEXT);
// }

// // store all the mrw annotations that are contained in a selection
// /**
//  *
//  * @param {JSONArray} annoJson contains all the annotation of the pages as JSONObjects
//  * @param {Array} targetList of ranges from the selection
//  * @returns an array holding all the annotation that are mrw-annotations and
//  * target words present in the current selection (targetList)
//  */
// export function storeSelectedMRWAnnos(annoJson, targetList) {
//   // empty the mrwAnno list beforehand
//   let mrwAnnos = [];
//   annoJson.forEach((annotation) => {
//     //annoXmlId = annotation.svg.split("\"")[1];
//     //console.log(annotation);
//     // checking if the annotation is a mrw-annotation by checking its color,
//     // which is based on the classifying body.
//     // See "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
//     // for the corresponding hexes/mrw-annotation types
//     if (
//       annotation.color === '#000011' ||
//       annotation.color === '#000012' ||
//       annotation.color === '#000013' ||
//       annotation.color === '#000014'
//     ) {
//       targetList.forEach((target) => {
//         annotation.svg.forEach((svg) => {
//           if (target.id === svg.split('"')[1]) {
//             // this iteration should not be necessary as a Set
//             // should not hold the same annotation twice
//             if (mrwAnnos.length === 0) {
//               mrwAnnos.push(annotation);
//             } else {
//               if (!mrwAnnos.some((entry) => entry.id === annotation.id)) {
//                 mrwAnnos.push(annotation);
//               }
//             }
//           }
//         });
//       });
//     }
//   });
//   console.log('MRW annotations present in current selection: ', mrwAnnos);

//   return mrwAnnos;
// }
