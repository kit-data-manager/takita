// external modules
import { Builder, Browser, By, Origin } from 'selenium-webdriver';
// internal modules
import {
  enterPseudonym,
  markWord,
  markWords,
  showAnnoCreationModal,
  chooseAnnoTemplate,
  createAnnotation,
  checkIsAnnotationCardVisible,
  checkDisplayedAnnotation,
} from '../../_selenium';
import { annotateSelectedText } from './editor';

// duration of timeout
const timeoutAfter = 10000;

// urls and ids, that need to be changed according to the setup
const testURL = 'http://localhost:8181/editor/af28d854-6240-49ab-b94e-37c175dead54';
const testWord = 'id("w.15")';
const testSingleWordTemplate = 'MRWDIRECT';
const testMultiWordTemplate = 'METAPHOR';

async function singleWordAnnotationCreationTest(xPath, driver) {
  await driver.get(testURL);
  await enterPseudonym(driver);

  // select the word, that will be annotated
  await markWord(xPath, driver);

  // show annotaton creation modal
  await showAnnoCreationModal(driver);

  // choose the metaphor template and create the anntoation
  await chooseAnnoTemplate(testSingleWordTemplate, driver);

  // create annotation
  await createAnnotation(driver);

  // check if the annotation card is displayed
  const annotationCardIsVisible = checkIsAnnotationCardVisible(driver);
  // check if an annotation is displayed
  const displayedAnnotation = checkDisplayedAnnotation(driver);
  return { annotationCardIsVisible: annotationCardIsVisible, displayedAnnotation: displayedAnnotation != null };
}

async function multiWordAnnotationCreationTest(xPath, driver) {
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
  const displayedAnnotation = await checkDisplayedAnnotation(driver);
  return { annotationCardIsVisible: annotationCardIsVisible, displayedAnnotation: displayedAnnotation != null };
}

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
  const displayedAnnotation = await checkDisplayedAnnotation(driver);
  return { annotationCardIsVisible: annotationCardIsVisible, displayedAnnotation: displayedAnnotation != null };
}

// selenium tests
describe.skip('creating a single word annotation', () => {
  it(
    'creates an annotation targetting the selected word in Chrome',
    async () => {
      const driver = await new Builder().forBrowser(Browser.CHROME).build();
      const result = await singleWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word in Edge',
    async () => {
      const driver = await new Builder().forBrowser(Browser.EDGE).build();
      const result = await singleWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word in Firefox',
    async () => {
      const driver = await new Builder().forBrowser(Browser.FIREFOX).build();
      const result = await singleWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word in Safari',
    async () => {
      const driver = await new Builder().forBrowser(Browser.SAFARI).build();
      const result = await singleWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
});

describe.skip('creating a multi word annotation', () => {
  it(
    'creates an annotation targetting the selected word and following words in Chrome',
    async () => {
      const driver = await new Builder().forBrowser(Browser.CHROME).build();
      const result = await multiWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word and following words in Edge',
    async () => {
      const driver = await new Builder().forBrowser(Browser.EDGE).build();
      const result = await multiWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word and following words in Firefox',
    async () => {
      const driver = await new Builder().forBrowser(Browser.FIREFOX).build();
      const result = await multiWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
  it(
    'creates an annotation targetting the selected word and following words in Safari',
    async () => {
      const driver = await new Builder().forBrowser(Browser.SAFARI).build();
      const result = await multiWordAnnotationCreationTest(testWord, driver);
      expect(result.annotationCardIsVisible).toBe(true);
      expect(result.displayedAnnotation).toBe(true);
      await driver.quit();
    },
    timeoutAfter,
  );
});

// will not work as I can't get the selection out of the browser
describe.skip('integration: getting xPath from selection', () => {
  it('deals with single word selection', () => {
    const selection = {};
    const result = annotateSelectedText(selection);
    expect(result).toBe('xpath');
  });
  it('deals with single word selection including a linebreak in the word', () => {
    const selection = {};
    const result = annotateSelectedText(selection);
    expect(result).toBe('xpath');
  });
  it('deals with single word selection of nested (choice) elements', () => {
    const selection = {};
    const result = annotateSelectedText(selection);
    expect(result).toBe('xpath');
  });
  it('deals with multi word selection', () => {
    const selection = {};
    const result = annotateSelectedText(selection);
    expect(result).toBe('xpath');
  });
  it('deals with multi word selection including substrings', () => {
    const selection = {};
    const result = annotateSelectedText(selection);
    expect(result).toBe('xpath');
  });
});
