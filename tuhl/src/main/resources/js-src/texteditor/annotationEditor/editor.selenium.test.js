// external modules
import { Builder, Browser } from 'selenium-webdriver';
// internal modules
import {
  createDriver,
  enterPseudonym,
  markWord,
  markWords,
  showAnnoCreationModal,
  chooseAnnoTemplate,
  createAnnotation,
  checkIsAnnotationCardVisible,
  getDisplayedAnnoId,
} from '../../_selenium';

// duration of timeout
const timeoutAfter = 10000;

// urls and ids, that need to be changed according to the setup
const testURL = 'http://localhost:8181/editor/af28d854-6240-49ab-b94e-37c175dead54';
const testWord = 'id("w.15")';
const testSingleWordTemplate = 'MRWDIRECT';
const testMultiWordTemplate = 'METAPHOR';

/**
 * creates an annotation targetting one word
 *
 * @param {*} xPath of the word to be annotated
 * @param {SeleniumDriver} driver selenium webdriver
 * @returns JSON-object containing the test results
 */
async function singleWordAnnotationCreationTest(xPath, driver) {
  await driver.get(testURL);
  await enterPseudonym(driver);

  // select the word, that will be annotated
  await markWord(xPath, driver);

  // show annotaton creation modal
  // doesn't work in Safari for some reason
  await showAnnoCreationModal(driver);

  // choose the metaphor template and create the anntoation
  await chooseAnnoTemplate(testSingleWordTemplate, driver);

  // create annotation
  await createAnnotation(driver);

  // check if the annotation card is displayed
  const annotationCardIsVisible = await checkIsAnnotationCardVisible(driver);
  // check if an annotation is displayed
  const displayedAnnotation = await getDisplayedAnnoId(driver);
  return { annotationCardIsVisible: annotationCardIsVisible, displayedAnnotation: displayedAnnotation != null };
}

/**
 * creates an annotation targetting multiple words
 *
 * @param {*} xPath of the first word to be annotated
 * @param {SeleniumDriver} driver selenium webdriver
 * @returns JSON-object containing the test results
 */
async function multiWordAnnotationCreationTest(xPath, driver) {
  await driver.get(testURL);
  await enterPseudonym(driver);

  // select the words, that will be annotated
  await markWords(xPath, driver);

  // show annotaton creation modal
  // doesn't work in Safari for some reason
  await showAnnoCreationModal(driver);

  // choose the metaphor template and create the anntoation
  await chooseAnnoTemplate(testMultiWordTemplate, driver);

  // create annotation
  await createAnnotation(driver);

  // check if the annotation card is displayed
  const annotationCardIsVisible = await checkIsAnnotationCardVisible(driver);
  // check if an annotation is displayed
  const displayedAnnotation = await getDisplayedAnnoId(driver);
  return { annotationCardIsVisible: annotationCardIsVisible, displayedAnnotation: displayedAnnotation != null };
}

/**
 * creates an annotation targetting multiple words
 *
 * @param {*} xPath of the first word to be annotated
 * @param {SeleniumDriver} driver selenium webdriver
 * @returns JSON-object containing the test results
 */
async function crc1475multiWordAnnotationCreationTest(xPath, driver) {
  await driver.get(testURL);
  await enterPseudonym(driver);

  // select the words, that will be annotated
  await markWords(xPath, driver);

  // show annotaton creation modal
  await showAnnoCreationModal(driver);

  // choose the metaphor template and create the anntoation
  await chooseAnnoTemplate(testMultiWordTemplate, driver);

  // create annotation
  await createAnnotation(driver);

  // check if the annotation card is displayed
  const annotationCardIsVisible = await checkIsAnnotationCardVisible(driver);
  // check if an annotation is displayed
  const displayedAnnotation = await getDisplayedAnnoId(driver);
  return { annotationCardIsVisible: annotationCardIsVisible, displayedAnnotation: displayedAnnotation != null };
}

// selenium tests
describe('creating a single word annotation', () => {
  let driver;
  afterEach(() => {
    driver.quit();
  });
  it(
    'creates an annotation targetting the selected word in Chrome',
    async () => {
      driver = await createDriver('chrome', true);
      const result = await singleWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word in Edge',
    async () => {
      driver = await createDriver('edge', true);
      const result = await singleWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word in Firefox',
    async () => {
      driver = await createDriver('firefox', true);
      const result = await singleWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word in Safari',
    async () => {
      driver = await createDriver('safari', true);
      const result = await singleWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
    },
    timeoutAfter,
  );
});

describe('creating a multi word annotation', () => {
  let driver;
  afterEach(() => {
    driver.quit();
  });
  it(
    'creates an annotation targetting the selected word and following words in Chrome',
    async () => {
      driver = await createDriver('chrome', true);
      const result = await multiWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word and following words in Edge',
    async () => {
      driver = await createDriver('edge', true);
      const result = await multiWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word and following words in Firefox',
    async () => {
      driver = await createDriver('firefox', true);
      const result = await multiWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word and following words in Safari',
    async () => {
      driver = await createDriver('safari', true);
      const result = await multiWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
    },
    timeoutAfter,
  );
});
