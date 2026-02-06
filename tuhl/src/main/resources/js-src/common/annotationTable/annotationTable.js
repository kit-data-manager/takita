import Tabulator from 'tabulator-tables';
import { selectAnnotation } from '../annotationCard';
import { enableTooltips, encodeAnnoId, toggleVisibility } from '../utils';
import { initializeNavigation } from '../../texteditor-ng/navigation';
import { toggleShapeSelect } from '../../imageeditor-ng/highlighting';

/**
 * innitialize the table displaying all annotation of the current editor window.
 * Similar code to what is used for the annotation overview on the main page.
 * The biggest difference is the way an annotation is displayed. This can be controlled
 * via injecting a function.
 *
 * @param {[Object]} annoJson containing all annotations
 * @param {Element} $annotationTable the element holding the table
 * @param {Function} [onCellClick] the function used to display an annotation when clicking on it in the table.
 * The calling code passes it in.
 * For the textEditor it should be textDisplayAnnotation (= initializeNavigation()) and passed in by
 * /texteditor-ng/index or /texteditor-ng/display;
 * for the imageEditor it should be defaultDisplayAnnotation.
 * @param {Object} [hooks] containing an array for various hooks to be called at preAnnotationTableCreation
 * @returns {Element} $annotationTable the element holding the table
 */
export function initializeAnnotationTable(annoJson, $annotationTable, onCellClick, hooks = {}) {
  let tableData = annoJson;

  tableData.forEach((entry) => {
    // unwrapping the creator array
    entry.creator = entry.creator.replace('[', '').replace(']', '');
  });

  const tooltipDisplayAnnotation = window?.TL_VARIABLES?.tooltips?.annotation_table?.display_annotation
    ? window.TL_VARIABLES.tooltips.annotation_table.display_annotation
    : 'Display Annotation';

  let columns = [
    {
      formatter: function (_cell, _formatterParams, _onRendered) {
        return `<i class='fa fa-eye' 
                  data-bs-toggle="tooltip" data-bs-placement="top"
                  data-bs-title="${tooltipDisplayAnnotation}"></i>`;
      },
      hozAlign: 'center',
      resizable: false,
      width: '4rem',
      frozen: true,
      headerSort: false,
      cellClick: function (_e, cell) {
        onCellClick(_e, cell, hooks);
      },
    },
    {
      title: 'Creator',
      field: 'creator',
      headerSort: true,
    },
    {
      title: 'Modified',
      field: 'modified',
      headerSort: true,
    },
    {
      title: 'Created',
      field: 'created',
      headerSort: true,
    },
  ];

  // manipulate the data (eg. by filtering) and column definitions passed to Tabulator
  if (hooks.preAnnotationTableCreation) {
    hooks.preAnnotationTableCreation.forEach((hook) => {
      [tableData, columns] = hook(tableData, columns);
    });
  }

  // eslint-disable-next-line no-unused-vars
  const annotable = new Tabulator($annotationTable, {
    layout: 'fitColumns',
    pagination: 'local',
    data: tableData,
    movableColumns: true, //enable user movable columns
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 30, 40],
    rowDblClick: function (_e, row) {
      //shows and hides the bodies for each row/annotation
      let id = row.getData().id;
      if (document.getElementById('holder' + id) == null) {
        // create container/holder for all body rows
        let holder = document.createElement('div');
        holder.style.display = 'block';
        holder.setAttribute('id', 'holder' + id);
        let cardBody = document.createElement('div');
        cardBody.setAttribute('class', 'card card-body no-wrap');

        // create rows for all bodies
        const textCards = row.getData().textCards;
        textCards.forEach((textCard) => {
          let row = document.createElement('div');
          row.setAttribute('class', 'row');
          row.innerText = textCard.purpose + ': ' + textCard.value;
          cardBody.appendChild(row);
        });
        const tags = row.getData().tags;
        tags.forEach((tag) => {
          let row = document.createElement('div');
          row.setAttribute('class', 'row');
          row.innerText = 'tagging: ' + tag.value;
          cardBody.appendChild(row);
        });
        holder.appendChild(cardBody);
        row.getElement().appendChild(holder);
      } else {
        document.getElementById('holder' + id).remove();
      }
    },
    rowFormatter: function (row) {
      // enabling tooltips for the annotation table using bootstrap
      // inspiration from: https://stackoverflow.com/questions/71755490/bootstrap-tooltips-with-tabulator
      // this might be replaced/improved in the future, but for now bootstrap is creating
      // all tooltips
      const $tooltipTriggerList = row.getElement().querySelectorAll('[data-bs-toggle="tooltip"]');
      enableTooltips($tooltipTriggerList);
    },
    columns: columns,
  });

  // the fixTableStyling()-function is no longer neccessary as different css is used
  // since the merge related to the css/bootstrap/modal update
  //fixTableStyling($annotationTable);
  $annotationTable.querySelector('.tabulator-footer').style.backgroundColor = 'white';

  return $annotationTable;
}

// TODO: this is no longer used since the merge related to the css/bootstrap/modal update
/**
 * various changes to the styling of the table to make it look "better" via inline css.
 * Hopefully are not neessary in the future as the root causes might be fixed
 * by an update of the Tabulator version.
 *
 * @param {Element} $annotationTable the element holding the table
 * @returns {Element} $annotationTable the element holding the table
 */
export function fixTableStyling($annotationTable) {
  // the css from chota influences tabbulator. So the size of the
  // select element to select the pagination size has to be set, to stop
  // the element from getting to big and overflowing the container
  $annotationTable.querySelector('.tabulator-page-size').style.width = '6rem';
  // removing dark grey background color
  $annotationTable.style.backgroundColor = 'white';
  $annotationTable.querySelector('.tabulator-header').style.backgroundColor = 'white';
  $annotationTable.querySelectorAll('.tabulator-col.tabulator-sortable').forEach((element) => {
    element.style.backgroundColor = 'white';
    // for some reason the column headers are missing as their height is set to "0px"
    // so it has to be reset
    element.style.height = 'initial';
  });
  $annotationTable.querySelector('.tabulator-footer').style.backgroundColor = 'white';

  return $annotationTable;
}

/**
 * Displays an annotation. Should be used for imageEditor.
 *
 * @param {Event} _event
 * @param {*} cell tabulator cell containing information about the cell and its parent row (annotaiton information)
 * @param {Object} [hooks] containing an array for various hooks to be passed to initializeNavigation
 */
export function defaultDisplayAnnotationFunction(_event, cell, hooks) {
  const $annotationCard = document.getElementById('annotationCard');
  const annotationId = encodeAnnoId(cell.getRow().getData().id);
  // display the annotation with the id stored in the url
  selectAnnotation(null, annotationId, hooks);
  if ($annotationCard.classList.contains('invisible')) {
    toggleVisibility($annotationCard);
  }

  // if there is a shape, highlight it. For page-annotations, no shape will be highlighted
  // as there is none
  if (cell.getRow().getData().targets.length > 0) {
    let targetShape = undefined;
    // getting the shape corresponding to the annotation and unselecting
    // all previously selected shapes
    // Note: raphael doesn't offer a filter()-function
    window.paper.forEach((shape) => {
      // finding the correct shape
      if (shape.annoIdEncoded === annotationId) {
        targetShape = shape;
      }
      // unselecting all previously selected shapes
      if (shape.selected) {
        toggleShapeSelect(shape);
      }
    });
    if (targetShape) {
      // highlight the shape on the canvas
      toggleShapeSelect(targetShape);
    }
  }
}

/**
 * Displays an annotation and navigates to the correct text division, if necessary. Should be used for textEditor.
 * Used by /texteditor-ng/index or /texteditor-ng/display
 *
 * @param {Event} _event
 * @param {*} cell tabulator cell containing information about the cell and its parent row (annotaiton information)
 * @param {Object} [hooks] containing an array for various hooks to be passed to initializeNavigation
 */
export function textDisplayAnnotationFunction(_event, cell, hooks) {
  const rowData = cell.getRow().getData();
  const $text = document.getElementById('TEI');
  const $navBarTop = document.getElementById('textNavBar');
  const $navBarLow = document.getElementById('textNavBarLow');
  // get the Id of the first word of the target. First find the xPathSelector and then
  // unpack its value from 'id("w.123")' to 'w.123'
  const xPathSelector = rowData.targets?.filter((target) => target.selector.type === 'XPathSelector')[0].selector;
  const fragmentId =
    xPathSelector.value instanceof Array
      ? xPathSelector.value[0].split('id("')[1].split('"')[0]
      : xPathSelector.value.split('id("')[1].split('"')[0];
  const annotationId = rowData.id;
  initializeNavigation($navBarTop, $navBarLow, $text, fragmentId, annotationId, hooks);
}
