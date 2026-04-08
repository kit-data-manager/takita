# Frontend

## Modularized JavaScript code

### Formatting/Linting

We use prettier and ESLint for formatting and linting respectively. You will not be able to build the JavaScript code without linting. You can install prettier and ESLint like all other dependencies by running `npm install` in `frontend`. Afterwards you can use `npx prettier ${PATH} --write` and `npx eslint --fix ${PATH}` to fix all issues (the `${PATH}` should either be the whole folder `js-src` or a single file in that folder). Many IDEs also offer plugins for both.
For VSCode we use the settings `"prettier.useTabs": true,` and `"editor.codeActionsOnSave": {"source.fixAll.eslint": "explicit"},`, which can be added to the `settings.json` of VSCode (use `cmd+ shift + p` or the search bar to search for "Preference: Open User Settings JSON" and edit the file). If you open the `takita` of `takita/frontend` folder and edit files, the code should get formatted and linted when you save a file.

### Generic Code

#### common

- `annotationCard`: return the selected annotation and render information (metadata and bodies) stored in annotation given its URI
- `annotationCreation`: annotation creation (modification, deletion is done in the `annotationCard`)
- `annotationTable`: renders table with all annotations at the bottom of the editor
- `data`: data access module; uses `network` but provides a more convenient interface; extended as needed
- `mode`: class to decide which actions can be done in the editor (e.g. only view or edit annotations)
- `network`: a thin wrapper around the browser's fetch API to get or store documents and annotations
- `utils`: basically a placeholder name, until there is enough functionality to warrant more structure
  - `display`: functions related to showing/hiding DOM elements or changing the appearance of buttons
  - `tooltips`: provide basic tooltip functionality
  - `data`: encode anno id etc.
- `sidebar`: provide sidebar toggling functionality to `sidebar`-modules of text- and imageeditor
- `utils`: various util functions to streamline interaction with libraries/dependencies (bootstrap for tooltips and modals; metadataEditor for forms), toggle CSS-classes and handle URLs

#### imageeditor-ng

`index.js` initializes the component and subcomponents and attaches eventListeners.

- `highlighting`: drawing/highlighting shapes on Raphael canvas for each annotation
- `sidebar`: attaches EventListeners to sidebar for image manipulation (zoom and move), annotation creation and toggling of document part navigation and annotation table
- `targetBuilding`: drawing/highlighting shapes on Raphael canvas when an annotation is modified
- `textloader`: render a document provided as an XML string; this is a prerequisite of pretty much all other rendering related modules.
- `utils`

#### texteditor-ng

`index.js` initializes the component and subcomponents and attaches eventListeners.

- `display`: wrapper module to update highlighting and annotationtable
- `editor`: attaching EventListeners for mouse clicks for annotation creation and annotation selection
- `highlighting`: render underlines/backgrounds for each annotation
- `navigation`: render navigation above a document
- `sidebar`: attaches EventListeners to sidebar for font manipulation, annotation creation and toggling of document part navigation and annotation table
- `targetBuilding`: transform browserSelection to target
- `textloader`: render a document provided as an XML string; this is a prerequisite of pretty much all other rendering related modules.
- `utils`: code for conversion of legacy targets (backwards compatibility)

### Projectspecific Code

For both editors the projectspecifc code can be found in `${EDITORNAME}/projectspecific`. Items

- marked with \*\* have to be customized
- marked with \* should be customized
- that are unmarked can be customized

#### texteditor-ng

- `annotationCard.js`\*\* arrays directly influence the display and behavior of the annotationCard rendered with jsonForms. And assignment of labels for the horizontal view
  - `headerFieldsArray`: remove fields from the form entirely by removing them from "headerFields" (some are necessary though; at least "annotationId")
  - `omitFieldsArray`: hide fields/remove fields from the display
  - `editableFieldsArray`\*\*: fields (bodies with purposes listed here) that can be edited in the horizontal view
  - `changeLabel`\*: swaps out the purpose for a enduser-readable label for the horizontal view
- `/annotationCreation`\*\* templates and conversion of template form values into data to be sent to tAkita, which then creates the annotation
  - `templates.js`\*\*: templates used for annotation creation
    - `annotationTemplate`\*\* holds available templates to create an annotation (the values are shown in the dropdown after starting the process of creating a new annotation)
    - `bodyTemplate`\*\* holds available templates to add additional bodies to an annotation after its initial creation (the values are shown in the dropdown after starting the process of creating a new body by clicking on the "+" icon in the top right corner of the annotation card)
    - `getFormModel()`\*\* defines data model and UI form for your templates, so they can be rendered via metadataEditor/jsonForm
    - `getFormObjectCreateAnnotation()` is passed to the jsonForm library, which renders the according form
    - `getFormObjectCreateBody()` is passed to the jsonForm library, which renders the according form
  - `utils.js`: functionality to convert the form values into data to be sent to tAkita, which then creates the annotation/body. `assignPurpose`\* can be used to change the purpose for each body.
- `data.js`
- `editor.js`
- `highlight.js`\*
  - `getSpecificClasses` you can, but don't have to, add more CSS classes here and use them later; be sure to add some CSS rules in the projectspecific folder (`frontend/static/CSS/editor_text.CSS`). This array has to be defined.
  - `assignStyle`\* main function to change how an annotation target is getting highlighted by assigning styles/CSS class to elements. Only use classes defined in `getSpecificClasses`.
  - `getTypeOfAnnotation`\* helper function to determine the type of an annotation. You can access the whole annotation here and use the value fo a body to determine the type of the annotation for example
  - `checkIsATargetAlreadyHighlighted` helper to decide if a target/group of words is already highlighted
  - `customHighlighting` will use your customized highlighting from above; you don't have to change this function.
- `hooks.js` you can add functions, which will be called at other points in the code, to the hooks object. E.g. by adding a function to the array in `hooks.preMakeHTML`, the function will then be executed at `texteditor-ng/textloader/textloader.js (prepareTEIDocument())`. Check the file for documentation on possible hooks and behaviours. You can either define your functions in this file or spread them into other files and import them into `hooks.js`.
- `index.js`\* main entry point, where the exports happen. Usually you don't need to touch the "mandatory" `export`-statements.
  - `targetUpdateCallback` function used when a user wants to update a target. `updateTargetData` is the standard function to update a target; it will only update the target. This will be sufficient in most cases.
  - `POSSIBLE_DIVISION_TYPES`\* arrays holding information regarding the division of your texts. Change the arrays to fit your texts. The navigation bar is based on the values of `div[@type]`. Please add your values here.
  - `highlightAnnotationFunction`\* function used for highlighting the targets of an annotation (mentioned above at the `highlight` bullet point). This functions should assign CSS classes to elements (see `getSpecificClasses`). You have to write the according CSS rules as well (see `CSS/editor_text.CSS`). You can swap out the `defaultHighlighting`-function with your `customHighlighting`-function (defined in `highlight.js`)
  - `possibleHighlightClasses` you can leave this untouched
- `sidebar.js`
- `textloader.js` add functions to change how the text is rendered here
  - class and function to store information about the variant/type of a text. Variant can be used to enable buttons in the sidebar
- `utils.js`

#### imageeditor-ng

- `annotationCard.js`\*\* arrays directly influence the display and behavior of the annotationCard rendered with jsonForms. And assignment of labels for the horizontal view
  - `headerFieldsArray`: remove fields from the form entirely by removing them from "headerFields" (some are necessary though; at least "annotationId")
  - `omitFieldsArray`: hide fields/remove fields from the display
  - `editableFieldsArray`\*\*: fields (bodies with purposes listed here) that can be edited in the horizontal view
  - `changeLabel`\*: swaps out the purpose for a enduser-readable label for the horizontal view
- `/annotationCreation`\*\* templates and conversion of template form values into data to be sent to tAkita, which then creates the annotation
  - `templates.js`\*\*: templates used for annotation creation
    - `annotationTemplate`\*\* holds available templates to create an annotation (the values are shown in the dropdown after starting the process of creating a new annotation)
    - `bodyTemplate`\*\* holds available templates to add additional bodies to an annotation after its initial creation (the values are shown in the dropdown after starting the process of creating a new body by clicking on the "+" icon in the top right corner of the annotation card)
    - `getFormModel()`\*\* defines data model and UI form for your templates, so they can be rendered via metadataEditor/jsonForm
    - `getFormObjectCreateAnnotation()` is passed to the jsonForm library, which renders the according form
    - `getFormObjectCreateBody()` is passed to the jsonForm library, which renders the according form
  - `utils.js`: functionality to convert the form values into data to be sent to tAkita, which then creates the annotation/body. `assignPurpose`\* can be used to change the purpose for each body.
- `data.js`
- `editor.js`
- `highlight.js`\*
  - `assignColor`\* main function to change how an annotation target/shape is colored on the canvas.
- `hooks.js` you can add functions, which will be called at other points in the code, to the hooks object. E.g. by adding a function to the array in `hooks.postSidebarCreation`, the function will then be executed at `imageeditor-ng/sidebar/sidebar.js (initializeSidebar())`. Check the file for documentation on possible hooks and behaviours. You can either define your functions in this file or spread them into other files and import them into `hooks.js`.
- `index.js`
- `sidebar.js`
- `utils.js`

## HTML templates

We use thymeleaf for templating.

### Projectspecific templates

You can store projectspecific HTML files in `templates/projectspecific` and open them via the `/addon`-endpoint using `/addon/${TEMPLATENAME}`.

## Projectspecific CSS

To style all texts you can edit `static/CSS/editor_text.css`.

To style texts based on the project you can store projectspecific CSS files in `static/CSS/projectspecific`. The files have to be named in accordance to the `publisher`-field of your DOs so that the texteditor can load these files. The value of the `publisher`-field is stripped of all whitespace by tAktia core, so your file has to be named like the publisher without whitespace (e.g. publisher: "Example - Project" -> file name: `Example-Project.CSS`).
