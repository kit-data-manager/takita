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

* `data` fetching & storing module
  * fetch text (GET)
  * annotations
    * fetching (GETting)
        * load all annos
        * load single anno for selected textcard
        * load single mrw-anno
    * storing (PUTting / POST)
        * single annotation w/o body
        * body
        * target
    * delete (DELETE)
* `textcard`
  * render by uri
  * probably needs to use `data/fetch*` functionality
* `textloader`
  * render after using `data/fetchText`
* `highlighting`
  * render underlines / background-colors for each annotation after textloader is done
* `textSelection`
  * transform browserSelection to target
* `annotationSelection`
* `topbar` --> adjust DOM
* `sidebar` --> adjust DOM
* `navigation` --> adjust DOM
* `utils` --> encode annod id etc.
* annotation modification, deletion, creation
* `projectspecific`
  * textcard display
  * annotation selection
  * creation templates with respective forms (incl. purposes)
  * colors/highlighting
  