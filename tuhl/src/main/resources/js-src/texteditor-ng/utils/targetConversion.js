/**
 * converts a long concatenated/joined xPath consisting of
 * multiple xPaths into multiple xPaths
 *
 * @param {String} longXPath long concatenated/joined xPath consisting of
 * multiple xPaths
 * @returns {[String]} holding the xPaths to each element
 */
export function convertXPath(longXPath) {
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
          // TODO: remove the leading/traling whitespace from the startingPosition and the length of the substring
          return xPath + ', ' + xPaths[index + 1] + ', ' + xPaths[index + 2];
        }
      })
      // remove the "empty"/undefined entries
      .filter((entry) => entry !== undefined);
  }

  return xPathArray;
}

/**
 * converts the target of an annotation, which is only one long xPath
 * (since commits 2cf252d43446ba8b3bc4b8ec6ed2624f9fc2693a
 * and 8164038629f4e7c31d4e2d60acefd0fc5ea1b01e, which implemented the substring selection and
 * changed how the targets look like) to multiple targets. This is needed
 * for backwards compatability until every project only has targets, which
 * are one long xPath.
 *
 * @param {Object} annotation to have its targets converted
 * @returns {[String]} holding the xPaths to each element
 */
export function makeTargetsCompatible(annotation) {
  // annotation passed to the function is part of the annoJson
  if (annotation.targets) {
    annotation.targets.forEach((target) => {
      const selector = target.selector;
      if (selector.type === 'XPathSelector') {
        if (selector.value instanceof Array) {
          if (selector.value[0].includes('xml:id') || selector.value[0].includes('id(')) {
            selector.value = convertXPath(selector.value[0]);
          }
        } else {
          if (selector.value.includes('xml:id') || selector.value.includes('id(')) {
            selector.value = convertXPath(selector.value);
          }
        }
      }
    });
    return annotation.targets;
  }

  // annotation passed to the function is the globalSelectedAnnotation
  let newTargets = [];
  if (annotation.targets) {
    annotation.targets.forEach((target) => {
      const selector = target.selector;
      if (selector?.xPath) {
        let xPathArray = convertXPath(selector.xPath);
        xPathArray.forEach((xPath) => {
          let newTarget = JSON.parse(JSON.stringify(target));
          newTarget.selector.xPath = xPath;
          newTargets.push(newTarget);
        });
      } else {
        // add the TextQuoteSelector target
        newTargets.push(target);
      }
    });
    return newTargets;
  }
}

/**
 * check if the annotation is compatible with the code
 *
 * @param {Object} annotation to have its targets checked
 * @returns {Boolean} indicating if the target is compatible
 * - true, if the annotation is compatible, i.e. has one xPath for each target
 * - false, if the annotation is incompatible, i.e. has one long xPath including all targets
 */
export function checkIsTargetCompatible(annotation) {
  let targetXPath = 'default';

  // annotation passed to the function is part of the annoJson
  if (annotation.targets) {
    annotation.targets.forEach((target) => {
      const selector = target.selector;
      if (selector.type === 'XPathSelector') {
        selector.value instanceof Array ? (targetXPath = selector.value[0]) : (targetXPath = selector.value);
      }
    });
  }

  // annotation passed to the function is the globalSelectedAnnotation
  // if (annotation.targets) {
  //   annotation.targets.forEach((target) => {
  //     const selector = target.selector;
  //     if (selector?.xPath) {
  //       selector.xPath instanceof Array ? (targetXPath = selector.xPath[0]) : (targetXPath = selector.xPath);
  //     }
  //   });
  // }
  // check if the xPath is a joined (resolving to nodes) or concatenated
  // (resolving to a string) one
  if (targetXPath.includes('|') || targetXPath.includes('concat')) {
    return false;
  }

  return true;
}
