// TODO: CUSTOMISE the colors based
// see "src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
// and "src/main/resources/js-src/projectspecific/annotationCreation/templates.js"
export function getColorHexFromEnumEntry(colorEnumEntry) {
  let colorHex = '#89f099';
  switch (colorEnumEntry) {
    case 'EXAMPLE':
      colorHex = '#000011';
      break;
  }
  return colorHex;
}

// TODO: CUSTOMISE the colors based
// see "src/main/java/edu/kit/scc/dem/tuhl/model/Color.java"
// and "src/main/resources/js-src/projectspecific/annotationCreation/templates.js"
export function getColorNameFromEnumEntry(colorEnumEntry) {
  let colorName = 'Default';
  switch (colorEnumEntry) {
    case 'EXAMPLE':
      colorName = 'example';
      break;
  }
  return colorName;
}
