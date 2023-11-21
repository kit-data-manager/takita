/**
 * All the functionality in this module is about preprocessing the raw string
 * which we get from WAPS via Takita. When using HTTP to get data from WAPS,
 * the response data is not properly escaped, so it is not valid JSON.
 * Until WAPS is fixed, we try to work around this issue with crude
 * string replacement heuristics. :/
 * 
 * See https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/132 for details.
 */

/**
 * Find matching brackets in a string.
 *
 * @param {String} string the string to search in
 * @param {Number} start position index of starting bracket
 * @param {String} matchingFor character which, if found along the way, makes one more match necessary
 * @param {String} lookingFor character which potentially is a matching bracket
 * @returns {Number} position of matching bracket; returns null if there is no match
 */
export const findMatchingBracket = (string, start, matchingFor='[', lookingFor=']') => {
  let idx = start + 1;
  let count = 1;
  while (idx < string.length) {
    if (string[idx] === lookingFor) {
      count--;
    }
    else if (string[idx] === matchingFor) {
      count++;
    }
    if (count === 0) {
      return idx;
    }
    idx++;
  }
  return null;
};

/**
 * Extract only the auxiliaryText from the analysisString.
 */
export const extractAuxText = (analysisString) => {
  // Extract auxiliaryText data:
  const auxStart = analysisString.indexOf('"auxiliaryText":{') + '"auxiliaryText":{'.length-1;
  const auxEnd = findMatchingBracket(analysisString, auxStart, '{', '}') + 1; // +1 to include the matching bracket!
  return {
    before: analysisString.substring(0, auxStart),
    auxText: analysisString.substring(auxStart, auxEnd),
    after: analysisString.substring(auxEnd)
  };
};

/**
 * Extract only the tertiaComment from the analysisString.
 */
export const extractTertiaComment = (analysisString) => {
  const startPattern = '"tertiaComment":"';
  const start = analysisString.indexOf(startPattern) + startPattern.length-1;
  const endPatterns = [
    '","propositions"',
    '","auxiliaryText"',
    '","mappings"',
    '","linkings"',
    '"}',
  ];
  let end;
  for (const pattern of endPatterns) {
    end = analysisString.indexOf(pattern, start);
    if (end !== -1) { break; }
  };
  // Extract the tertiaComment segment, including the JSON-field-delimiting quotes.
  return {
    before: analysisString.substring(0, start),
    tertiaComment: analysisString.substring(start, end+1),
    after: analysisString.substring(end+1),
  };
};


/**
 * Fix wrongly escaped newlines and unescaped quotation marks in strings
 * which are part of user provided data.
 * 
 * The string _content_ should start and end with quotation marks, to indicate
 * the beginning and end of the JSON string value. Only the quotation marks
 * inside of that, and all newlines, potentially need fixing.
 * A proper string would have content like "this is \\"a\\" tricky\\n" (note that
 * the quotation marks are part of the string _value_).
 *
 * @param {String} string value of a JSON field including the enclosing quotes
 * @returns {String} escaped string, suitable as a string value inside a JSON string
 */
export const sanitize = (string) => {
  // If the string can be used as a valid JSON field value, leave it untouched.
  try {
    const fragment = `{"key":${string}}`;
    JSON.parse(fragment);
    return string;
  }
  catch  {
    // Remove the enclosing quotes
    let sanitized = string.substring(1, string.length-1);
    // Escape all the remaining quotation marks
    sanitized = sanitized.replaceAll('"', '\\"');
    // Remove superfluous escapes before newlines
    sanitized = sanitized.replaceAll('\n', 'n');
    // Wrap the string in quotes again
    return `"${sanitized}"`;
  }
};


/**
 * Split a string, which contains the auxiliaryText of an analysis, into
 * consecutive segments of "insert" blocks and everything in between.
 * We need to do this because the insert blocks need special treatment
 * to fix some escaping issues.
 * See https://git.noc.ruhr-uni-bochum.de/sfb1475-inf/takita/-/issues/132 for details.
 *
 * @param {String} auxText
 * @returns {Array} sorted list of text segments, containing text, boundaries, and type information
 */
export const splitInserts = (auxText) => {
    // Extract all the `insert` fields from auxiliaryText.
    const insertStarts = [];
    const pattern = /"insert":/g;
    let matches;
    // eslint-disable-next-line no-cond-assign,no-unused-vars
    while (matches = pattern.exec(auxText)) {
      insertStarts.push(pattern.lastIndex);
    }
    const inserts = insertStarts.map(startIdx => {
      // NOTE: this can break for certain string contents, but there is no
      // 100% robust solution.
      const endIdx = auxText.indexOf('"}', startIdx) + 1;
      return {
        startIdx,
        endIdx,
        text: auxText.substring(startIdx, endIdx),
        type: 'insert',
      };
    });

    // Extract all the in-between strings.
    let latestEnd = 0;
    const nonInserts = inserts.flatMap(({startIdx, endIdx}) => {
      let inbetween;
      if (startIdx > latestEnd) {
        inbetween = {
          startIdx: latestEnd,
          endIdx: startIdx,
          text: auxText.substring(latestEnd, startIdx),
          type: 'non-insert',
        };
      }
      else {
        inbetween = [];
      }
      latestEnd = endIdx;
      return inbetween;
    });
    // No inserts at all. Make sure to at least preserve the empty object.
    if (!inserts.length) {
      nonInserts.push({
        startIdx: 0,
        endIdx: 2,
        text: '{}',
        type: 'non-insert',
      });
    }
    // Preserve non-insert parts at the end of the whole auxString structure.
    else if (inserts.length && inserts.slice(-1)[0].endIdx < auxText.length) {
      nonInserts.push({
        startIdx: inserts.slice(-1)[0].endIdx,
        endIdx: auxText.length,
        text: auxText.substring(inserts.slice(-1)[0].endIdx),
        type: 'non-insert',
      });
    }

    return inserts.concat(nonInserts).sort((a, b) => a.startIdx - b.startIdx);
};

/**
 * Fix faulty escaping in auxiliaryText to make analysisString valid JSON.
 */
export const processAuxText = (analysisString) => {
  const { before, auxText, after } = extractAuxText(analysisString);

  // Extract all the string segments which form an "insert", and all the rest in between:
  const segments = splitInserts(auxText);
  const sanitized = segments
    .map(s => {
      if (s.type === 'insert') {
        return sanitize(s.text);
      }
      else {
        return s.text;
      }
    })
    .join('');

  // Replace the complete auxText part of the analysis string.
  analysisString = before + sanitized + after;
  return analysisString;
};

/**
 * Fix faulty escaping in tertiaComment to make analysisString valid JSON.
 */
export const processTertiaComment = (analysisString) => {
  // Extract the tertiaComment segment, including the JSON-field-delimiting quotes.
  const { before, tertiaComment, after } = extractTertiaComment(analysisString);
  const sanitized = sanitize(tertiaComment);
  analysisString = before + sanitized + after;

  return analysisString;
};

/**
 * Fix faulty escaping in mappings to make analysisString valid JSON.
 */
export const processMappingText = (analysisString) => {
  // TODO: not implemented yet
  console.warn('processMappingText() not yet implemented');
  return analysisString;
};
