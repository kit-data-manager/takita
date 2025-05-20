# Design Notes Texteditor

## Data Flow

* OnPageLoad:
  * **load** TEI (for CETEIcean)
  * **load** AnnoList (for Highlighting)
* OnSelect:  
  * get id (comes from the TEI-file) of target of oncontextclick, find the id in the targets of annoJson and pass the id/uri of the annotation to selectAnnotation()
  * **load** "full" annotation (body) data from index
  * textcard rendering process
    * for metaphor-annotations, **load** mrw-annotation data, add that to the "render que"
* OnSaveModificationAnnotation (same procedure for body addition/deletion):
  * **store** updated body, get updated annotation data
  * then textcard rendering process
* OnSaveModificationText:
* OnAddBody
* OnDeleteBody
*

### Sources of Truth & Local State

TEI Document: SoT Base Repo; Local State DOM
All Annotations: SoT WAPS (index); Local State annoJson
Selected Annotation + linked MRW Annotations of Selected Annotation: SoT WAPS (index); Local State DOM (+ globalSelectedAnnotation/window.SELECTED_ANNOTATION)
window.SELECTED_TEXT;
window.SELECTING_TEXT;
window.MODE (CREATE | VIEW)

#### properties (im Sinne von react)

window.TEXTLANGUAGE = 'default';
divisiontype for navigation
Current User:  SoT Java

## Timeline

* pageload --> TEI load --> replace part of DOM based on TEI (document, sidebar?, navigation)
    --> Anno Load into JSONObject --> highlighting
* select text + click annotate --> transform selection to target (xPath) --> _annotation creation_
* annotation creation --> render form template modal --> select form template --> render form template --> click save --> create persistent annotation
    --> store individual bodies -->   "select" annotation --> Anno load --> render form template
* contextclick highlight --> cycle through available matching annotations --> "select" annotation --> Anno load --> render form template

## Tentative Architecture

### texteditor-ng

_Note: when the module folder is eventually renamed to just "texteditor", all the code should continue to just work._

**Not Modifying the DOM**

* `network`: a thin wrapper around the browsers fetch API to get or store documents and annotations _(maybe this should eventually be in `common` instead)_
* `data`: data access module; uses `network` but provides a more convenient interface; extended as needed; _(maybe this should eventually be in `common` instead)_
  * fetching (GETting)
    * get text
    * load all annos
    * load single anno for selected textcard
    * load single mrw-anno
  * storing (PUTting / POST)
    * single annotation w/o body
    * body
    * target
  * delete (DELETE)
* `targetBuilding`: transform browserSelection to target

**Modifying the DOM**

* `textloader`: render a document provided as an XML string; this is a prerequisite of pretty much all other rendering related modules.
* `highlighting`: render underlines/backgrounds for each annotation
  * `target`: provide interaction to trigger visual selection (done in `highlighting`) and rendering of annotationCard (done in `annotationCard`)
* `sidebar`: render sidebar and provide various text-toggling functionality
* `navigation`: render chapter/section navigation above a document
  
### common

_Note: the purpose of this module is to provide functionality which is useful to more than one "regular" module (like texteditor and analysis). It is therefore to be expected for some code from a regular module to move into this one, as soon as a second module is refactored to make use of this previously private implementation. It is **not** to be expected for code to move **out** of this, unless it has been ensured that this change does not break any of the regular modules which may rely on it._

* `annotationCard`: return the selected annotation and render an annotation given its URI
  * elements:
    * annotation: addBody, deleteAnnotationIcon, iconRowTop (needs annoId, contains addBody, deleteAnnotationIcon); at the end: buttonModifySelection, buttonSaveModification, buttonCancelModification
    * bodies:
      * bodyCard
        * formRowDiv > bodyForm (anchor for the jsonForm)
        * bodyRowDiv > bodyDiv (needs bodyId and annoId) > iconRow (contains expand, deleteBody)
    * deleteAnnotationIcon and deleteBody can be created by the same function, if it accepts an id and a callback as parameters
  * create the jsonForm function
* `annotationCreation`: annotation creation (modification, deletion is done in the `annotationCard`)
* `utils`: basically a placeholder name, until there is enough functionality to warrant more structure.
  * `display`: functions related to showing/hiding DOM elements or changing the appearance of buttons
  * `tooltips`: provide basic tooltip functionality
  * `data`: encode anno id etc.
* `topbar`: modify the topbar (set pseudonym functionality etc)

### Projectspecific stuff

* preMakeHTML hook
* postApplyStyles hook
* textcard
  * editing of bodies in horizontal textcard: <https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/common/annotationDisplay/selection.js#L343>
  * horizontal texcard: <https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/common/annotationDisplay/selection.js#L496> has a hook already
  * copyId button (similar to button to analysisTool, but gets appended earlier) <https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/toroll/tuhl/src/main/resources/static/js/editor.js?ref_type=heads#L133>
  * textcard button to analysisTool <https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/common/annotationDisplay/selection.js#L502> has a hook already
  * horizontal textcard "content" of the body <https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/common/utils/utils.js#L113>
* creationTemplates and corresponding utils functions
  * assignement of purposes <https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/texteditor/annotationEditor/annotationCreation/creationTemplates/utils.js#L685>
* highlighting
  * annotation selection based on css classes <https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/texteditor/annotationEditor/editor.js#L71>
  * removal of css classes <https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/texteditor/annotationEditor/highlight.js#L104>
  * addition of css classes <https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/texteditor/annotationEditor/highlight.js#L142>
* window.variables
  * editor js: ANNOJSON, SELECTING_TEXT, PAPER, SELECTED_ANNOTATION, MRW_ANNOS, MODE, TEXTLANGUAGE, EDITORTYPE
  * html: CONTEXTPATH, TL_VARIABLES, CURRENTPAGENUMBER, CURRENTPAGEID, CURRENTPAGEURL
* exchange functions
  * targetUpdateCallback (this should be moved from annotationCard to projectspecific/index.js)
  * highlightAnnotationFunction, getProjectSpecificClasses
* implement functions
  * for annotation creation procedure the functions makeAnnotationData, makeBodyData and assignPurpose need to be implemented
  
#### implementation necessary

_preliminary remarks:_

* colors get assigned in the `templates` and are used for highlighting the targets of an annotation. You have to keep the various representations the same. A couple of changes are necessary
  * js
    * `annotationCreation/templates/getFormObjectCreateAnnotation()`: initial assignment of colors (hex value)
    * `highlight`: can use the color to assign a css class (hex value)
    * `utils/getColorNameFromEnumEntry`: provides the name of a color (string) during the update of the target of an annotation in `/data/annotations/updateTargetData`
  * java
    * `takita/tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java` holds all the various representations

mandatory stuff is usually a "setting/variable/function" to be changed. optional stuff is a hook

**mandatory implementations**

* `annotationCreation`: templates and conversion of template form values into data to be sent to tAkita, which then creates the annotation
  * `templates`: necessary for the creation of
    * a new annotation: `getFormObjectCreateAnnotation()` is passed to the jsonForm library, which renders the according form
      * you should add colors to the templates as they are used for highlighting
    * a new body: `getFormObjectCreateBody()` is passed to the jsonForm library, which renders the according form
    * `annotationTemplate` and `bodyTemplate` serve as enums to provide values for the dropdowns to select the according template
  * `utils`: functionality to convert the form values into data to be sent to tAkita, which then creates the annotation
    * `makeAnnotationData` and `makeBodiesData`/`makeBodyData` (inlcudes the assignment of purposes to the bodies via `assignPurpose`)
* `highlight`: rendering of annotated words
  * `getSpecificClasses`: add the css-classes for highlighting the target of an annotation used by a project here. The array can be empty as well, but it needs to be defined for `index/possibleHighlightClasses` to work.
* `utils`: utils used for the assignment of hex and strings based for the colors used
  * `getColorHexFromEnumEntry`/`getColorNameFromEnumEntry`: returns the hex or name of a color. Colors are assigned in the `templates`.

**optional implementations**

* `annotationCard`: arrays directly influencing the display and behavior of the annotationCard rendered with jsonForms and assignment of labels for the horizontal view
  * `headerFieldsArray`: remove fields from the form entirely by removing them from "headerFields" (some are necessary though)
  * `omitFieldsArray`: remove them from the display by adding them to "omitFields"
  * `editableFieldsArray`: fields (bodies with purposes listed here) that can be edited in the horizontal view
  * `changeLabel`: swaps out the purpose for a enduser-readable label for the horizontal view
* `highlight`: rendering of annotated words
  * you can add a function for the assignment of css-classes here as well; this should then be added to the export in `projectspecific/index`. Check the `defaultHighlighting`-function in `texteditor/highlighting/target.js` as well. You can use the "color" of an annotation stored in the annotation-object as well (`annotation.color`)
* `hooks`: you can add functions, which will be called at other points in the code, to the hooks object. By adding a function to the array in `hooks.preMakeHTML`, the function will then be executed at `texteditor-ng/textloader/textloader.js (prepareTEIDocument())`. Check the file for documentation on possible hooks and behaviours. You can either define your functions in this file or spread them into other files and import them into `hooks.js`.
* `index`: main entry point, where the exports happen. Usually you don't need to touch the "mandatory" `export`-statements.
  * `targetUpdateCallback`: function used when a user wants to update a target. `updateTargetData` is the standard function to update a target, it will only update the target; this will be sufficient in most cases.
  * `POSSIBLE_DIVISION_TYPES`: array holding the types of divisions used in a text. This is neccessary for the navigation bar to work. Add the `div[@type]` used in your project here.
  * `highlightAnnotationFunction`: function used for highlighting the targets of an annotation (mentioned above at the `highlight` bullet point). This functions should assign css-classes to elements (see `getSpecificClasses`). You have to write the according css rules as well (see `css/editor_text.css`)
* `textloader`: add functions to change how the text is rendered here
  * `Variant`: stores information about the variant/type of a text, which can then be used to determine custom rendering
