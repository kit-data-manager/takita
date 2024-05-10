/**
 * preselect all checkboxes for the mrw-annos present in the current selection
 * during metaphor annotation creation via the template
 */
export function preselectAllMRWAnnos() {
  // select all input fields, where the name starts with "mrws"
  // the input fields storing the mrws present in a selection
  // get their name from the ordering in the mrws-array:
  // name="mrws[0]" and name="mrws[1]" etc.
  // to get the changing name I refered to
  // https://stackoverflow.com/questions/16791527/how-to-use-a-regular-expression-in-queryselectorall
  const inputs = document.querySelectorAll('input[name^=mrws');
  // checking if any mrws are present in the selection and allowing the toggle
  // only if there are. This prevents an error to be thrown, when no mrws are present
  if (inputs.length > 0) {
    toggleCheckedInputs(inputs);
  }
}

/**
 * replace the button to create an annotation with a message on how to enable it.
 * currently not used as users are allowed to create a metaphorannotation without a mrw-annotation
 */
export function disableAnnotationCreation() {
  document.querySelector('#createAnnotationForm > div:nth-child(1) > input:nth-child(2)').remove();
  let explanationDiv = document.createElement('div');
  explanationDiv.innerText = 'Please include a mrw-annotation in your selection after closing this window.';
  document.querySelector('#createAnnotationForm').append(explanationDiv);
}

/**
 * function to check/uncheck all inputs
 *
 * @param {[Element]} inputs input elements to be checked/unchecked
 */
export function toggleCheckedInputs(inputs) {
  // to select/unselect all inputs the first input will be checked,
  // wether it is selected or not. Based on that all inputs will be
  // checked or unchecked
  let isInputChecked = false;

  if (inputs[0].checked) {
    isInputChecked = true;
  }

  inputs.forEach((input) => {
    if (isInputChecked) {
      input.checked = false;
    } else {
      input.checked = true;
    }
  });
}

/**
 * returns a button to select/unselect all mrws; is used by
 * - the METAPHOR annotation template
 * - the MRW body template
 *
 * @param {Enumerator} mrwEnum holding all mrws present in the form
 * @returns {Element} button to select/unselect all mrws present in the form
 */
export function getSelectMRWButton(mrwEnum) {
  const selectMRWButton = {
    type: 'button',
    title: 'Select/unselect all mrws',
    onClick: function (_e) {
      // select all input fields, where the name starts with "mrws"
      // the input fields storing the mrws present in a selection
      // get their name from the ordering in the mrws-array:
      // name="mrws[0]" and name="mrws[1]" etc.
      // to get the changing name I refered to
      // https://stackoverflow.com/questions/16791527/how-to-use-a-regular-expression-in-queryselectorall
      const inputs = document.querySelectorAll('input[name^=mrws');
      // checking if any mrws are present in the selection and allowing the toggle
      // only if there are. This prevents an error to be thrown, when no mrws are present
      if (inputs.length > 0) {
        toggleCheckedInputs(inputs);
      }
    },
  };
  // if less than two mrws are present in the selection, the
  // "is-hidden"-class (defined in chota.css) is added to the button and
  // the button won't be displayed
  if (mrwEnum.length < 2) {
    selectMRWButton['htmlClass'] = 'is-hidden';
  }

  return selectMRWButton;
}

// takes a list of mrwAnnos and returns
// - an enum holding all the ids of these annotations
// - a titleMap linking the ids to targeted strings and the type of the mrw annotation
//   which is set according to its color, which is based on the classifying body
/**
 * takes a list of mrwAnnos and stores their ids in an array and in a map, which
 * also stores the text targetted by the annotation and the type of the mrw annotation
 *
 * @param {Array} mrwAnnos list of mrw annotations
 * @returns {[Array, Map]}
 * - an array holding all the ids of these annotations
 * - a Map linking the ids to targeted strings and the type of the mrw annotation
 *   which is set according to its color, which is based on the classifying body
 */
export function getEnumAndTitleMap(mrwAnnos) {
  const idEnum = mrwAnnos.map((anno) => anno.id);
  const mrwTitleMap = {};

  mrwAnnos.forEach((anno) => {
    // getting the words targetted by the annotation
    // and concatenate them into one string
    const targetedString = anno.svg
      .map((svgs) => {
        const id = svgs.split('"')[1];
        return document.getElementById(id).innerHTML;
      })
      .join(' ');

    // adding the value of the classifying body (which is stored in the color)
    // to the string, that will be displayed in the modal.
    let mrwType = 'DEFAULT';
    switch (anno.color) {
      case '#000011':
        mrwType = 'mrw (direct)';
        break;
      case '#000012':
        mrwType = 'mrw (indirect)';
        break;
      case '#000013':
        mrwType = 'mrw (implicit)';
        break;
      case '#000014':
        mrwType = 'mflag';
        break;
    }
    mrwTitleMap[anno.id] = targetedString + ' | ' + mrwType;
  });

  return [idEnum, mrwTitleMap];
}

/**
 * replace the mrws key, with a new key for each value of the mrws key. Turn a key holding an array as value,
 * into multiple keys based on the arrays entries.
 * as the uris of the mrw annotations are stored in an array and the wadm does not accept an array as a value
 * of a textual body, the array will be split into multiple "key:value" pairs, with the same key (mrws0-n)
 *
 * @param {Object} jsonObject
 * @returns {Object} with replaced key
 */
export function spreadMRWArray(jsonObject) {
  let mrws = [...jsonObject.mrws];
  delete jsonObject.mrws;
  mrws.forEach((mrw, index) => (jsonObject['mrws' + index] = mrw));

  return jsonObject;
}

// wrapper function to hold all functions to be called after the
// modal to create an annotation is being displayed
// TODO: CUSTOMISE: add code/functions to be called
export function projectSpecifics() {
  // if a user wants to create a metaphor-annotation, preselect the checkboxes
  // for the linking of mrw-annotations
  if (
    window.MRW_ANNOS.length > 0 &&
    document.querySelector(
      '#pickAnnotationTemplateForm > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > select:nth-child(1)',
    ).value === 'METAPHOR'
  ) {
    preselectAllMRWAnnos();
  }

  // if a user wants to create a metaphor-annotation, but there is no
  // mrw-annotation present in the selection, disable annotation creation
  //if (window.MRW_ANNOS.length === 0 &&
  //document.querySelector("#pickAnnotationTemplateForm > div:nth-child(1) > div:nth-child(1)
  // > div:nth-child(2) > select:nth-child(1)").value === "METAPHOR"){
  //disableAnnotationCreation();
  //}
}
