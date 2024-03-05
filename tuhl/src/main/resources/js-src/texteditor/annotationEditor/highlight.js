import { fillMetaDataEditorTable } from '../../common/utils';

// converts a long concatenated/joined xPath consisting of
// multiple xPaths into multiple xPaths
function convertXPath(longXPath) {
  let xPathArray = [];

  // if the xPath contains only joined xPaths resolving to nodes
  if (longXPath.includes('|')) {
    // split the xPath into multiple xPaths and remove leading whitespace.
    // Turn string:
    // "//*[@xml:id=\"w.121\"] | //*[@xml:id=\"w.122\"]"
    // into array:
    // ["//*[@xml:id=\"w.121\"]", "//*[@xml:id=\"w.122\"]"]
    xPathArray = longXPath.split('|').map((entry) => entry.trim());
  }

  // if the xPath contains concatenated xPaths resolving to a string
  if (longXPath.includes('concat(')) {
    // remove the surrounding concat()-function from the long xPath
    // and split it at the "," to reassemble each individual xPath.
    // Turn string:
    // "concat(//*[@xml:id=w.75], //*[@xml:id=pc.12], \"   \", substring(//*[@xml:id=w.76], 1, 5))"
    // into array:
    // ["//*[@xml:id=w.75]", "//*[@xml:id=pc.12]", "substring(//*[@xml:id=w.76], 1, 5)"]
    let xPaths = longXPath.split('concat(')[1].slice(0, -1).split(',');
    xPathArray = xPaths
      // remove leading/trailing whitespace from the entries
      .map((xPath) => xPath.trim())
      .map((xPath, index) => {
        if (xPath.startsWith('//*[@xml:id=') || xPath.startsWith('id(')) {
          return xPath;
        } else if (xPath.startsWith('substring(//*[@xml:id=') || xPath.startsWith('substring(id(')) {
          // add the startingPosition and the length of the substring to the xPath
          return xPath + ', ' + xPaths[index + 1] + ', ' + xPaths[index + 2];
        }
      })
      // remove the "empty"/undefined entries
      .filter((entry) => entry !== undefined);
  }

  return xPathArray;
}

// converts the target of an annotation, which is only one long xPath
// (since commitXYZ, which implemented the substring selection and
// changed how the targets look like) to multiple targets. This is needed
// for backwards compatability until every project only has targets, which
// are one long xPath.
export function makeTargetsCompatible(annotation) {
  // annotation passed to the function is part of the annoJson
  if (annotation.svg) {
    if (annotation.svg[0].includes('xml:id') || annotation.svg[0].includes('id(')) {
      annotation.svg = convertXPath(annotation.svg[0]);
    }
  }

  // annotation passed to the function is the globalSelectedAnnotation
  let newTargets = [];
  if (annotation.targets) {
    if (annotation.targets[0].selector.xPath) {
      let xPathArray = convertXPath(annotation.targets[0].selector.xPath);
      xPathArray.forEach((xPath) => {
        let newTarget = JSON.parse(JSON.stringify(annotation.targets[0]));
        newTarget.selector.xPath = xPath;
        newTargets.push(newTarget);
      });
      annotation.targets = newTargets;
    }
  }
}

// check if the annotation is compatible with the code
// returns:
// - true, if the annotation is compatible, i.e. has one xPath for each target
// - false, if the annotation is incompatible, i.e. has one long xPath including all targets
export function checkIsTargetCompatible(annotation) {
  let targetXPath = 'default';

  // annotation passed to the function is part of the annoJson
  if (annotation.svg) {
    targetXPath = annotation.svg[0];
  }

  // annotation passed to the function is the globalSelectedAnnotation
  if (annotation.targets) {
    if (annotation.targets[0].selector.xPath) {
      targetXPath = annotation.targets[0].selector.xPath;
    }
  }

  // check if the xPath is a joined (resolving to nodes) or concatenated
  // (resolving to a string) one
  if (targetXPath.includes('|') || targetXPath.includes('concat')) {
    return false;
  }

  return true;
}

// remove the style from all elements
// https://stackoverflow.com/questions/9252839/simplest-way-to-remove-all-the-styles-in-a-page
function removeStyles(el) {
  // TODO: CUSTOMISE classes to remove (linked to classes assigned in
  // drawAnnos() function)
  // specify the classe to remove here
  let possibleClasses = ['mrw', 'mflag', 'metaphor', 'metaphorSecond', 'defaulthighlight'];

  possibleClasses.forEach((entry) => {
    el.classList.remove(entry);
  });

  el.childNodes.forEach((childNode) => {
    if (childNode.nodeType == 1) removeStyles(childNode);
  });
}

// highlighting all annotations
export function drawAnnos(annoJson) {
  let targetXmlId;
  let alreadyAnnotated;
  annoJson.forEach((annotation) => {
    // check if a target has the class "metaphor" and
    // therefore, is already highlighted
    alreadyAnnotated = false;
    annotation.svg.forEach((target) => {
      targetXmlId = target.split('"')[1];
      if (document.getElementById(targetXmlId).classList.contains('metaphor')) {
        alreadyAnnotated = true;
      }
    });

    // adding classes to highlight annotations
    annotation.svg.forEach((target, index) => {
      targetXmlId = target.split('"')[1];
      const targetElement = document.getElementById(targetXmlId);

      // if color is available assign css class
      if (annotation.color) {
        // different highlights for different annotation types
        switch (annotation.color) {
          // TODO: CUSTOMISE highlighting of different annotations, based on the color
          // see "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
          // and "takita/tuhl/src/main/resources/static/js/creation_templates_text.js"
          // (linked to classes to be removed in removeStyles() funtcion)
          case '#000021':
            // if a word is not highlighted add the "metaphor" class, if it is
            // already highlighted add "metaphorSecond"
            if (!alreadyAnnotated) {
              targetElement.classList.add('metaphor');
            } else {
              targetElement.classList.add('metaphorSecond');
            }

            // if a word is followed only by whitespace add the "whitespaceAfter" class
            // unless its the last word of the target.
            // TODO: this doesn't work for overlapping annotations. The "whitespaceAfter" class will
            // be assigned even if the word is the last target for one annotation as the word is part of multiple
            // annotations and it might be the last target of one annotation but not the other one
            // This is needed to create overlapping boxshadows.
            // check if nextSibling is null first
            if (targetElement.nextSibling !== null) {
              if (targetElement.nextSibling.textContent.trim() === '' && !(index === annotation.svg.length - 1)) {
                targetElement.classList.add('whitespaceAfter');
              }
            } else {
              targetElement.classList.add('whitespaceAfter');
            }
            break;
          case '#000011':
            targetElement.classList.add('mrw');
            break;
          case '#000012':
            targetElement.classList.add('mrw');
            break;
          case '#000013':
            targetElement.classList.add('mrw');
            break;
          case '#000014':
            targetElement.classList.add('mflag');
            break;
          default:
            // this is not ideal, but without the if clause, most of words
            // will get the defaulthighlighting class
            if (
              annotation.color === '#000021' ||
              annotation.color === '#000011' ||
              annotation.color === '#000012' ||
              annotation.color === '#000013' ||
              annotation.color === '#000014'
            ) {
              // nothing will happen
            } else {
              targetElement.classList.add('defaulthighlight');
              //console.log("Tag value not matching the possible cases, 'defaulthighlight'
              // class added for:", annotation);
            }
        }
      } else {
        // if no tags are given (might be due to the tagging body being delted), assign default
        targetElement.classList.add('defaulthighlight');
      }
    });
  });

  fillMetaDataEditorTable(annoJson);
}

// get all displayable annotations and store them in the annoJson
// this function is used to get an updated annoJson after an
// annotation got created/modified/deleted
async function getAnnoJson() {
  const response = await fetch(window.CONTEXTPATH + 'editor/' + window.CURRENTPAGEID + '/displayableAnnotationsJSON', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  return await response.json();
}

// update the display of the textEditor
export async function updateDisplay() {
  try {
    // update annoJson to get the current tagging-body-values
    // as they are the basis for the highlighting
    let annoJson = await getAnnoJson();
    // check if the annotations are compatible with the code, i.e. have
    // one xPath for each target and not one long xPath including all targets.
    // Make them compatible, if they are not
    annoJson = annoJson.map((annotation) => {
      if (!checkIsTargetCompatible(annotation)) {
        makeTargetsCompatible(annotation);
      }
      return annotation;
    });
    // remove all styling/highlighting
    removeStyles(document.getElementById('TEI'));
    // highlight all annotated words
    drawAnnos(annoJson);
    console.log('Display and annoJson: ', annoJson, ' updated successfully.');
    // TODO: this window variable could maybe be removed
    window.ANNOJSON = annoJson;
    return annoJson;
  } catch (error) {
    console.error('Display update failed ', error);
  }
}
