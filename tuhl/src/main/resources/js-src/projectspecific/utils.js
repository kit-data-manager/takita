// TODO: CUSTOMISE the colors based
// see "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
// and "takita/tuhl/src/main/resources/resources/js-src/projectspecific/annotationCreation/templates.js"
export function getColorHexFromEnumEntry(colorEnumEntry) {
  let colorHex = '#89f099';
  switch (colorEnumEntry) {
    case 'MRW_DIRECT':
      colorHex = '#000011';
      break;
    case 'MRW_INDIRECT':
      colorHex = '#000012';
      break;
    case 'MRW_IMPLICIT':
      colorHex = '#000013';
      break;
    case 'MFLAG':
      colorHex = '#000014';
      break;
    case 'METAPHOR':
      colorHex = '#000021';
      break;
  }
  return colorHex;
}

// TODO: CUSTOMISE the colors based
// see "takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
// and "takita/tuhl/src/main/resources/resources/js-src/projectspecific/annotationCreation/templates.js"
export function getColorNameFromEnumEntry(colorEnumEntry) {
  let colorName = 'Default';
  switch (colorEnumEntry) {
    case 'MRW_DIRECT':
      colorName = 'mrw (direct)';
      break;
    case 'MRW_INDIRECT':
      colorName = 'mrw (indirect)';
      break;
    case 'MRW_IMPLICIT':
      colorName = 'mrw (implicit)';
      break;
    case 'MFLAG':
      colorName = 'mflag';
      break;
    case 'METAPHOR':
      colorName = 'metaphor';
      break;
  }
  return colorName;
}
