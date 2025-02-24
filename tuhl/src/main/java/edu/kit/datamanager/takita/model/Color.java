package edu.kit.datamanager.takita.model;

/**
 * The Color enum represents the different Colors an annotation can have.
 */
public enum Color {
	// TODO: CUSTOMISE which colors are used in 
	// - "src/main/resources/js-src/projectspecific/annotationCreation/templates.js",
	// - "src/main/resources/js-src/projectspecific/highlight.js" at assignStyle() and
	// - "src/main/resources/js-src/projectspecific/utils.js" at getColorNameFromEnumEntry(colorEnumEntry)/
	//    getColorHexFromEnumEntry(colorEnumEntry)
	// and adjust the stringToColor()/colorToString()-functions
	
	// the string-VALUE in "INDEX("#COLHEX", "VALUE")" might need to be equal
	// to the string (case insensitive) of the tagging/classifying-body assigned by
	// js-src/projectspecific/annotationCreation/templates.js
	// CRC980 colors
  TEXT_REGION("#00edff", "TextRegion"),
  IMAGE_REGION("#3d3a2e", "ImageRegion"),
  LINE_DRAWING_REGION("#b7b4a7", "LineDrawingRegion"),
  GRAPHIC_REGION("#2e8da6", "GraphicRegion"),
  TABLE_REGION("#de0A19", "TableRegion"),
  CHART_REGION("#ffed00", "ChartRegion"),
  SEPARATOR_REGION("#b304f7", "SeparatorRegion"),
  MATHS_REGION("#06702d", "MathsRegion"),
  CHEM_REGION("#5df638", "ChemRegion"),
  MUSIC_REGION("#776ec3", "MusicRegion"),
  ADVERT_REGION("#f3bc6a", "AdvertRegion"),
  NOISE_REGION("#de4b44", "NoiseRegion"),
  UNKNOWN_REGION("#89f099", "UnknownRegion"),
  CUSTOM_REGION("#23035e", "CustomRegion"),
  PAGE_REGION("#e2b8f7", "PageRegion"),
  // CRC1475 colors
  // toRoll colors
  EXAMPLE("#000011", "example"),
  // default
  DEFAULT("#ff8d00", "Default");
  

  private final String colorHex;
  private final String name;

  /**
   * Constructor for color.
   *
   * @param color of color
   */
  Color(String color, String name) {
    this.colorHex = color;
    this.name = name;
  }

  /**
   * Gets the lower case name of a color.
   *
   * @return String name
   */
  public String getName() {
    return name;
  }

  /**
   * Gets the color of a Color as hexadecimal value.
   *
   * @return string color as hex
   */
  public String getColorHex() {
    return colorHex;
  }

  /**
   * Converts String with color name to Color
   * 
   * @param stringColor
   * @return Color color
   */
  public static Color stringToColor(String stringColor) {
    if (Color.TEXT_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.TEXT_REGION;
    } else if (Color.IMAGE_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.IMAGE_REGION;
    } else if (Color.PAGE_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.PAGE_REGION;
    } else if (Color.LINE_DRAWING_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.LINE_DRAWING_REGION;
    } else if (Color.GRAPHIC_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.GRAPHIC_REGION;
    } else if (Color.TABLE_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.TABLE_REGION;
    } else if (Color.CHART_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.CHART_REGION;
    } else if (Color.SEPARATOR_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.SEPARATOR_REGION;
    } else if (Color.MATHS_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.MATHS_REGION;
    } else if (Color.CHEM_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.CHEM_REGION;
    } else if (Color.MUSIC_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.MUSIC_REGION;
    } else if (Color.ADVERT_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.ADVERT_REGION;
    } else if (Color.NOISE_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.NOISE_REGION;
    } else if (Color.UNKNOWN_REGION.getName().equalsIgnoreCase(stringColor)) {
    	return Color.UNKNOWN_REGION;
    } else if (Color.EXAMPLE.getName().equalsIgnoreCase(stringColor)) {
        return Color.EXAMPLE;
    } else {
      return Color.DEFAULT;
    }
  }

  public static String colorToString(Color color) {
    switch (color) {
      case TEXT_REGION:
        return Color.TEXT_REGION.getName();
      case IMAGE_REGION:
        return Color.IMAGE_REGION.getName();
      case PAGE_REGION:
        return Color.PAGE_REGION.getName();
      case LINE_DRAWING_REGION:
        return Color.LINE_DRAWING_REGION.getName();
      case GRAPHIC_REGION:
        return Color.GRAPHIC_REGION.getName();
      case TABLE_REGION:
        return Color.TABLE_REGION.getName();
      case CHART_REGION:
        return Color.CHART_REGION.getName();
      case SEPARATOR_REGION:
        return Color.SEPARATOR_REGION.getName();
      case MATHS_REGION:
        return Color.MATHS_REGION.getName();
      case CHEM_REGION:
        return Color.CHEM_REGION.getName();
      case MUSIC_REGION:
        return Color.MUSIC_REGION.getName();
      case ADVERT_REGION:
        return Color.ADVERT_REGION.getName();
      case NOISE_REGION:
        return Color.NOISE_REGION.getName();
      case UNKNOWN_REGION:
        return Color.UNKNOWN_REGION.getName();
      case CUSTOM_REGION:
        return Color.CUSTOM_REGION.getName();
      case EXAMPLE:
          return Color.EXAMPLE.getName();
      default:
        return Color.DEFAULT.getName();
    }
  }
}
