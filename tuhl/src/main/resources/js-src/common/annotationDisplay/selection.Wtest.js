// external modules
import { Builder, Browser } from 'selenium-webdriver';
// internal modules
import {
  getElementById,
  rightclick,
  enterPseudonym,
  getElementByXPath,
  checkIsAnnotationCardVisible,
  getDisplayedAnnoId,
} from '../../_selenium';
import { selectAnnotation } from './selection';

// duration of timeout
const timeoutAfter = 10000;

// urls and ids, that need to be changed according to the setup
const testURL = 'http://localhost:8181/editor/af28d854-6240-49ab-b94e-37c175dead54';
const testWord = 'id("w.3")';
const testAnnoId = 'http://localhost/wap/sfb1475/philipp/takita/0c26e038-9b07-4aed-8b70-8e314129f967';
const testSecondWord = 'id("w.4")';
const testSecondAnnoId = 'http://localhost/wap/sfb1475/philipp/takita/c2c2c7a4-8ff4-48d4-aa2f-a948347348f9';

async function selectionTest(xPath, driver) {
  await driver.get(testURL);
  await enterPseudonym(driver);
  // select an annotation by rightlicking the word
  await rightclick(xPath, driver);
  // check if the annotation card is displayed
  const annotationCardIsVisible = await checkIsAnnotationCardVisible(driver);
  // check if an annotation is displayed
  const displayedAnnoId = await getDisplayedAnnoId(driver);
  return { annotationCardIsVisible: annotationCardIsVisible, displayedAnnoId: displayedAnnoId };
}

async function cyclingSelectionTest(xPath, driver) {
  await driver.get(testURL);
  await enterPseudonym(driver);
  // select the first annotation by rightlicking the word once
  await rightclick(xPath, driver);
  // check if the annotation card is displayed
  const firstAnnotationCardIsVisible = await checkIsAnnotationCardVisible(driver);
  // check if an annotation is displayed
  const firstDisplayedAnnoId = await getDisplayedAnnoId(driver);

  // select the second annotation by rightlicking the word a second time
  await rightclick(xPath, driver);
  // check if the annotation card is displayed
  const secondAnnotationCardIsVisible = await checkIsAnnotationCardVisible(driver);
  // check if an annotation is displayed
  const secondDisplayedAnnoId = await getDisplayedAnnoId(driver);

  const firstAnnoEqualsSecondAnno = firstDisplayedAnnoId == secondDisplayedAnnoId;
  return {
    firstAnnotationCardIsVisible: firstAnnotationCardIsVisible,
    firstDisplayedAnnoId: firstDisplayedAnnoId,
    secondAnnotationCardIsVisible: secondAnnotationCardIsVisible,
    secondDisplayedAnnoId: secondDisplayedAnnoId,
    firstAnnoEqualsSecondAnno: firstAnnoEqualsSecondAnno,
  };
}

// as it is hard to control the order in which the annotations
// are getting selected, the order of the selected annotations in the result
// has to be fixed, before evaluation
function swapAnnotation(result) {
  if (result.firstDisplayedAnnoId == testSecondAnnoId) {
    const firstDisplayedAnnoId = result.firstDisplayedAnnoId;
    result.firstDisplayedAnnoId = result.secondDisplayedAnnoId;
    result.secondDisplayedAnnoId = firstDisplayedAnnoId;
  }
  return result;
}

async function crc1475selectionTest(xPath, testMRWAnnoText, driver) {
  let result = await selectionTest(xPath, driver);
  // check if the mrw annotation linked to the metaphor annotation is isplayed
  const $linkedMRWAnnoTextcard = await getElementByXPath('//*[@value="' + testMRWAnnoText + '"]', driver);
  const linkedMRWAnnoTextcontent = await $linkedMRWAnnoTextcard.getAttribute('value');
  // check if button to got to the analysisTool is displayed
  const $buttonToAnalysisTool = await getElementById('buttonToAnalysisTool', driver);

  result.linkedMRWAnnoText = linkedMRWAnnoTextcontent;
  result.buttonToAnalysisToolExists = $buttonToAnalysisTool != undefined;
  return result;
}

// selenium tests
describe('selecting an annotation', () => {
  it(
    'displays an annotation targetting the selected word in Chrome',
    async () => {
      const driver = await new Builder().forBrowser(Browser.CHROME).build();
      const result = await selectionTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnoId).toBe(testAnnoId);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'displays an annotation targetting the selected word in Edge',
    async () => {
      const driver = await new Builder().forBrowser(Browser.EDGE).build();
      const result = await selectionTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnoId).toBe(testAnnoId);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'displays an annotation targetting the selected word in Firefox',
    async () => {
      const driver = await new Builder().forBrowser(Browser.FIREFOX).build();
      const result = await selectionTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnoId).toBe(testAnnoId);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'displays an annotation targetting the selected word in Safari',
    async () => {
      const driver = await new Builder().forBrowser(Browser.SAFARI).build();
      const result = await selectionTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnoId).toBe(testAnnoId);
      await driver.quit();
    },
    timeoutAfter,
  );
});

describe('selecting multiple annotations', () => {
  it(
    'displays multiple annotations targetting the selected word in Chrome',
    async () => {
      const driver = await new Builder().forBrowser(Browser.CHROME).build();
      let result = await cyclingSelectionTest(testSecondWord, driver);
      result = swapAnnotation(result);
      expect(result.firstAnnotationCardIsVisible).toBe(true);
      expect(result.firstDisplayedAnnoId).toBe(testAnnoId);
      expect(result.secondAnnotationCardIsVisible).toBe(true);
      expect(result.secondDisplayedAnnoId).toBe(testSecondAnnoId);
      expect(result.firstAnnoEqualsSecondAnno).toBe(false);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'displays multiple annotations targetting the selected word in Edge',
    async () => {
      const driver = await new Builder().forBrowser(Browser.EDGE).build();
      let result = await cyclingSelectionTest(testSecondWord, driver);
      result = swapAnnotation(result);
      expect(result.firstAnnotationCardIsVisible).toBe(true);
      expect(result.firstDisplayedAnnoId).toBe(testAnnoId);
      expect(result.secondAnnotationCardIsVisible).toBe(true);
      expect(result.secondDisplayedAnnoId).toBe(testSecondAnnoId);
      expect(result.firstAnnoEqualsSecondAnno).toBe(false);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'displays multiple annotations targetting the selected word in Firefox',
    async () => {
      const driver = await new Builder().forBrowser(Browser.FIREFOX).build();
      let result = await cyclingSelectionTest(testSecondWord, driver);
      result = swapAnnotation(result);
      expect(result.firstAnnotationCardIsVisible).toBe(true);
      expect(result.firstDisplayedAnnoId).toBe(testAnnoId);
      expect(result.secondAnnotationCardIsVisible).toBe(true);
      expect(result.secondDisplayedAnnoId).toBe(testSecondAnnoId);
      expect(result.firstAnnoEqualsSecondAnno).toBe(false);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'displays multiple annotations targetting the selected word in Safari',
    async () => {
      const driver = await new Builder().forBrowser(Browser.SAFARI).build();
      let result = await cyclingSelectionTest(testSecondWord, driver);
      result = swapAnnotation(result);
      expect(result.firstAnnotationCardIsVisible).toBe(true);
      expect(result.firstDisplayedAnnoId).toBe(testAnnoId);
      expect(result.secondAnnotationCardIsVisible).toBe(true);
      expect(result.secondDisplayedAnnoId).toBe(testSecondAnnoId);
      expect(result.firstAnnoEqualsSecondAnno).toBe(false);
      await driver.quit();
    },
    timeoutAfter,
  );
});

// CRC1475 specific tests
const testMetaphorWord = testWord;
const testMetaphorAnnoId = testAnnoId;
const testMRWAnnoText = 'אֱלֹהִ֑ים';
describe('selecting a metaphor annotation', () => {
  it(
    'displays a metaphor annotation targetting the selected word in Chrome',
    async () => {
      const driver = await new Builder().forBrowser(Browser.CHROME).build();
      const result = await crc1475selectionTest(testMetaphorWord, testMRWAnnoText, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnoId).toBe(testMetaphorAnnoId);
      expect(result.linkedMRWAnnoText).toBe(testMRWAnnoText);
      expect(result.buttonToAnalysisToolExists).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'displays a metaphor annotation targetting the selected word in Edge',
    async () => {
      // const capabilities = {
      //   browserName: 'MicrosoftEdge',
      //   version: 'latest',
      // };
      // const driver = await new Builder().withCapabilities(capabilities).build();
      const driver = await new Builder().forBrowser(Browser.EDGE).build();
      const result = await crc1475selectionTest(testMetaphorWord, testMRWAnnoText, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnoId).toBe(testMetaphorAnnoId);
      expect(result.linkedMRWAnnoText).toBe(testMRWAnnoText);
      expect(result.buttonToAnalysisToolExists).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'displays a metaphor annotation targetting the selected word in Firefox',
    async () => {
      const driver = await new Builder().forBrowser(Browser.FIREFOX).build();
      const result = await crc1475selectionTest(testMetaphorWord, testMRWAnnoText, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnoId).toBe(testMetaphorAnnoId);
      expect(result.linkedMRWAnnoText).toBe(testMRWAnnoText);
      expect(result.buttonToAnalysisToolExists).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'displays a metaphor annotation the selected word in Safari',
    async () => {
      const driver = await new Builder().forBrowser(Browser.SAFARI).build();
      const result = await crc1475selectionTest(testMetaphorWord, testMRWAnnoText, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnoId).toBe(testMetaphorAnnoId);
      expect(result.linkedMRWAnnoText).toBe(testMRWAnnoText);
      expect(result.buttonToAnalysisToolExists).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
});
