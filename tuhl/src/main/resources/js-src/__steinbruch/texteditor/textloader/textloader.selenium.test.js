// internal modules
import { createDriver, getElementById, getElementByXPath, enterPseudonym } from '../../_selenium';

// selenium variables
// duration of timeout
const timeoutAfter = 10000;

// urls and ids, that need to be changed according to the setup
const testURL = 'http://localhost:8181/editor/af28d854-6240-49ab-b94e-37c175dead54';

/**
 * loads the texts and checks if the text was loaded, transformed into TEI and the textlanguage
 *
 * @param {SeleniumDriver} driver selenium webdriver
 * @returns JSON-object containing the test results
 */
async function textloadTest(driver) {
  await driver.get(testURL);
  await enterPseudonym(driver);
  const $text = await getElementById('TEI', driver);
  // check if the text was loaded and the default message replaced
  const textIsVisible =
    $text.getText() != 'Please wait until your text is loaded. If it doesn´t load, contact the developers.' &&
    $text.getText() != '';
  //check if the text was transformed into custom HTML-elements by CETEIcean
  const $teiText = await getElementByXPath('//tei-text', driver);
  const tagName = await $teiText.getTagName();
  // the return of getTagName() above for Safari is different than the return
  // of the function in other browsers; Safari returns an uppercase string.
  // So the string is turned into lowercase
  const textIsTEI = tagName.toLowerCase() == 'tei-text';
  // getting the text language stored in the window.object
  const textLanguage = await driver.executeScript(
    'function getLanguage(){return window.TEXTLANGUAGE;}; return getLanguage();',
  );

  return { textIsVisible: textIsVisible, textIsTEI: textIsTEI, textLanguage: textLanguage };
}

// selenium tests
describe('loading the text', () => {
  let driver;
  afterEach(() => {
    driver.quit();
  });

  it(
    'loads the text and transforms it into TEI in Chrome',
    async () => {
      driver = await createDriver('chrome', true);
      const result = await textloadTest(driver);
      expect(result.textIsVisible).toBe(true);
      expect(result.textIsTEI).toBe(true);
      expect(result.textLanguage).toBe('hbo');
    },
    timeoutAfter,
  );
  it(
    'loads the text and transforms it into TEI in Edge',
    async () => {
      driver = await createDriver('edge', true);
      const result = await textloadTest(driver);
      expect(result.textIsVisible).toBe(true);
      expect(result.textIsTEI).toBe(true);
      expect(result.textLanguage).toBe('hbo');
    },
    timeoutAfter,
  );
  it(
    'loads the text and transforms it into TEI in Firefox',
    async () => {
      driver = await createDriver('firefox', true);
      const result = await textloadTest(driver);
      expect(result.textIsVisible).toBe(true);
      expect(result.textIsTEI).toBe(true);
      expect(result.textLanguage).toBe('hbo');
    },
    timeoutAfter,
  );
  it(
    'loads the text and transforms it into TEI in Safari',
    async () => {
      driver = await createDriver('safari', true);
      const result = await textloadTest(driver);
      expect(result.textIsVisible).toBe(true);
      expect(result.textIsTEI).toBe(true);
      expect(result.textLanguage).toBe('hbo');
    },
    timeoutAfter,
  );
});
