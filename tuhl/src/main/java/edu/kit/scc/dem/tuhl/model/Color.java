package edu.kit.scc.dem.tuhl.model;

/**
 * The Color enum represents the different Colors an annotation can have.
 */
public enum Color {
  TEXT_REGION("#ff8d00", "TextRegion"),
  IMAGE_REGION("#3d3a2e", "ImageRegion"),
  LINE_DRAWING_REGION("#b7b4a7", "LineDrawingRegion"),
  GRAPHIC_REGION("#2e8da6", "GraphicRegion"),
  TABLE_REGION("#de0A19", "TableRegion"),
  CHART_REGION("#e2b8f7", "ChartRegion"),
  SEPARATOR_REGION("#b304f7", "SeparatorRegion"),
  MATHS_REGION("#06702d", "MathsRegion"),
  CHEM_REGION("#5df638", "ChemRegion"),
  MUSIC_REGION("#776ec3", "MusicRegion"),
  ADVERT_REGION("#f3bc6a", "AdvertRegion"),
  NOISE_REGION("#de4b44", "NoiseRegion"),
  UNKNOWN_REGION("#89f099", "UnknownRegion"),
  CUSTOM_REGION("#23035e", "CustomRegion"),
  PAGE_REGION("#ffed00", "PageRegion"),
  DEFAULT("#00edff", "Default");
  

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
}
