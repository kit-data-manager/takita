// internal modules
import { createDriver, getElementByXPath, enterPseudonym, markWords } from '../../_selenium';
import { getContentOfSelection } from './textSelection';
// selenium variables
// duration of timeout
const timeoutAfter = 20000;

// urls and ids, that need to be changed according to the setup
const testURL = 'http://localhost:8181/editor/9e92b0dd-dd60-48f3-9ded-ba7a8d3f0d2f';

// selenium tests
// this test needs to be done in selenium as firefox (while violating the specs)
// can create selections with multiple ranges, hence the rangeCount will be bigger than 1.
// (see https://w3c.github.io/selection-api/#dom-selection-rangecount).
describe('merging all selection ranges into one DocumentFragment', () => {
  let driver;
  afterEach(() => {
    driver.quit();
  });

  it(
    'merges all ranges of a selection into one DocumentFragment in Firefox',
    async () => {
      driver = await createDriver('firefox', false);
      await driver.get(testURL);
      await enterPseudonym(driver);

      // turn the imported function, which will be tested, into a String to pass
      // it to Selenium
      const functionString = getContentOfSelection.toString();
      // this script contains all the code to create the necessary selection object
      // and the function code from 'textSelection.js/getContentOfSelection(selection)'
      const script =
        functionString +
        'function createSelection() {' +
        ' const range1 = new Range();' +
        ' range1.setStart(document.getElementById("w.133"), 0);' +
        ' range1.setEnd(document.getElementById("w.134"), 1);' +
        ' const range2 = new Range();' +
        ' range2.setStart(document.getElementById("w.136").childNodes[0], 2);' +
        ' range2.setEnd(document.getElementById("w.138"), 1);' +
        ' const range3 = new Range();' +
        ' range3.setStart(document.getElementById("w.139").childNodes[0], 2);' +
        ' range3.setEnd(document.getElementById("w.141").childNodes[0], 4);' +
        ' const selection = window.getSelection();' +
        ' selection.addRange(range1);' +
        ' selection.addRange(range2);' +
        ' selection.addRange(range3);' +
        ' return selection;' +
        '}' +
        'const selection = createSelection();' +
        'const selectionRangeContents = getContentOfSelection(selection);' +
        'const result = {' +
        '   selectionRangeContentsLength: selectionRangeContents.childNodes.length,' +
        '   selectionRangeContentsFirstElementChildId: selectionRangeContents.firstElementChild.id,' +
        '   selectionRangeContentsLastElementChildId: selectionRangeContents.lastElementChild.id,' +
        '};' +
        'return result';
      const result = await driver.executeScript(script);
      expect(result.selectionRangeContentsLength).toBe(13);
      expect(result.selectionRangeContentsFirstElementChildId).toBe('w.133');
      expect(result.selectionRangeContentsLastElementChildId).toBe('w.141');
    },
    timeoutAfter,
  );
});
