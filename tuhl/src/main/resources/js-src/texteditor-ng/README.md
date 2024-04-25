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
* `textSelection`: transform browserSelection to target
* annotation modification, deletion, creation (??)

**Modifying the DOM**

* `textloader`: render a document provided as an XML string; this is a prerequisite of pretty much all other rendering related modules.
* `textcard`: render an annotation given its URI
* `highlighting`: render underlines/backgrounds for each annotation
* `annotationSelection`: provide interaction to trigger visual selection (done in `highlighting`) and rendering of textcards (done in `textcard`)
* `sidebar`: render sidebar and provide various text-toggling functionality
* `navigation`: render chapter/section navigation above a document 
* `projectspecific`: not fully planned out yet, but there need to be places to hook into with project-specific functionality:
  * textcard display
  * annotation selection
  * creation templates with respective forms (incl. purposes)
  * colors/highlighting
  
### common

_Note: the purpose of this module is to provide functionality which is useful to more than one "regular" module (like texteditor and analysis). It is therefore to be expected for some code from a regular module to move into this one, as soon as a second module is refactored to make use of this previously private implementation. It is **not** to be expected for code to move **out** of this, unless it has been ensured that this change does not break any of the regular modules which may rely on it._

* `utils`: basically a placeholder name, until there is enough functionality to warrant more structure.
  * `display`: functions related to showing/hiding DOM elements or changing the appearance of buttons
  * `tooltips`: provide basic tooltip functionality
  * `data`: encode anno id etc.
* `topbar`: modify the topbar (set pseudonym functionality etc)
  
## Projectspecific stuff

* preMakeHTML hook
* postApplyStyles hook
* textcard
  * editing of bodies in horizontal textcard: https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/common/annotationDisplay/selection.js#L343
  * horizontal texcard: https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/common/annotationDisplay/selection.js#L496 has a hook already
  * textcard button to analysisTool https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/common/annotationDisplay/selection.js#L502 has a hook already
  * horizontal textcard "content" of the body https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/common/utils/utils.js#L113
* creationTemplates and corresponding utils functions
  * assignement of purposes https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/texteditor/annotationEditor/annotationCreation/creationTemplates/utils.js#L685
* highlighting
  * annotation selection based on css classes https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/texteditor/annotationEditor/editor.js#L71
  * removal of css classes https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/texteditor/annotationEditor/highlight.js#L104
  * addition of css classes https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/blob/3d4f16288a6c9c4213d74e125d48b4ad05a1738a/tuhl/src/main/resources/js-src/texteditor/annotationEditor/highlight.js#L142
* window.variables
  * editor js: ANNOJSON, SELECTING_TEXT, PAPER, SELECTED_ANNOTATION, MRW_ANNOS, MODE, TEXTLANGUAGE
  * html: CONTEXTPATH, EDITORTYPE, TL_VARIABLES, CURRENTPAGENUMBER, CURRENTPAGEID, CURRENTPAGEURL