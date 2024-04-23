// internal modules
import { createDriver, getElementById, getElementByXPath, enterPseudonym, leftclick } from '../../_selenium';

// selenium variables
// duration of timeout
const timeoutAfter = 10000;

// urls and ids, that need to be changed according to the setup
const testURL = 'http://localhost:8181/editor/af28d854-6240-49ab-b94e-37c175dead54';

/**
 * manipulates the font size (increase, decrease) and returns the font size before/after manipulation
 *
 * @param {String} xPathToButton xPath matching the button to be pressed to increase/decrease the font
 * @param {SeleniumDriver} driver selenium webdriver
 * @returns JSON-object containing the test results
 */
async function fontSizeManipulationTest(xPathToButton, driver) {
  await driver.get(testURL);
  await enterPseudonym(driver);
  const $text = await getElementById('TEI', driver);
  // getting the fonts size before manipulation, manipulating it by clicking on the
  // respective button and getting the font size afterwards
  const sizeBeforeChange = (await $text.getCssValue('font-size')).split('px')[0];
  await leftclick(xPathToButton, driver);
  const sizeAfterChange = (await $text.getCssValue('font-size')).split('px')[0];
  return { sizeBeforeChange: sizeBeforeChange, sizeAfterChange: sizeAfterChange };
}

/**
 * resets the font size and returns the font size
 *
 * @param {SeleniumDriver} driver selenium webdriver
 * @returns JSON-object containing the test results
 */
async function fontSizeResetTest(driver) {
  await driver.get(testURL);
  await enterPseudonym(driver);
  // setting the font size manually to a different value
  const $text = await getElementById('TEI', driver);
  await driver.executeScript("arguments[0].style.fontSize = '30px';", $text);
  // getting the fonts size before manipulation, manipulating it by clicking on the
  // respective button and getting the font size afterwards
  const fontResetButton = 'id("resetFontButton")';
  await leftclick(fontResetButton, driver);
  const sizeAfterReset = await $text.getCssValue('font-size');

  return { sizeAfterReset: sizeAfterReset };
}

// selenium tests
describe('decreasing the font size', () => {
  let driver;
  afterEach(() => {
    driver.quit();
  });

  it(
    'decreases the font size in Chrome',
    async () => {
      driver = await createDriver('chrome', true);
      const xPathToButton = 'id("fontDecreaseButton")';
      const result = await fontSizeManipulationTest(xPathToButton, driver);
      expect(result.sizeBeforeChange > result.sizeAfterChange).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'decreases the font size in Edge',
    async () => {
      driver = await createDriver('edge', true);
      const xPathToButton = 'id("fontDecreaseButton")';
      const result = await fontSizeManipulationTest(xPathToButton, driver);
      expect(result.sizeBeforeChange > result.sizeAfterChange).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'decreases the font size in Firefox',
    async () => {
      driver = await createDriver('firefox', true);
      const xPathToButton = 'id("fontDecreaseButton")';
      const result = await fontSizeManipulationTest(xPathToButton, driver);
      expect(result.sizeBeforeChange > result.sizeAfterChange).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'decreases the font size in Safari',
    async () => {
      driver = await createDriver('safari', true);
      const xPathToButton = 'id("fontDecreaseButton")';
      const result = await fontSizeManipulationTest(xPathToButton, driver);
      expect(result.sizeBeforeChange > result.sizeAfterChange).toBe(true);
    },
    timeoutAfter,
  );
});

describe('increasing the font size', () => {
  let driver;
  afterEach(() => {
    driver.quit();
  });

  it(
    'increases the font size in Chrome',
    async () => {
      driver = await createDriver('chrome', true);
      const xPathToButton = 'id("fontIncreaseButton")';
      const result = await fontSizeManipulationTest(xPathToButton, driver);
      expect(result.sizeBeforeChange < result.sizeAfterChange).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'increases the font size in Edge',
    async () => {
      driver = await createDriver('edge', true);
      const xPathToButton = 'id("fontIncreaseButton")';
      const result = await fontSizeManipulationTest(xPathToButton, driver);
      expect(result.sizeBeforeChange < result.sizeAfterChange).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'increases the font size in Firefox',
    async () => {
      driver = await createDriver('firefox', true);
      const xPathToButton = 'id("fontIncreaseButton")';
      const result = await fontSizeManipulationTest(xPathToButton, driver);
      expect(result.sizeBeforeChange < result.sizeAfterChange).toBe(true);
    },
    timeoutAfter,
  );
  it(
    'increases the font size in Safari',
    async () => {
      driver = await createDriver('safari', true);
      const xPathToButton = 'id("fontIncreaseButton")';
      const result = await fontSizeManipulationTest(xPathToButton, driver);
      expect(result.sizeBeforeChange < result.sizeAfterChange).toBe(true);
    },
    timeoutAfter,
  );
});

describe('resetting the font size to the "initial" value of 16px', () => {
  let driver;
  afterEach(() => {
    driver.quit();
  });

  it(
    'resets the font size in Chrome',
    async () => {
      driver = await createDriver('chrome', true);
      const result = await fontSizeResetTest(driver);
      expect(result.sizeAfterReset).toBe('16px');
    },
    timeoutAfter,
  );
  it(
    'resets the font size in Edge',
    async () => {
      driver = await createDriver('edge', true);
      const result = await fontSizeResetTest(driver);
      expect(result.sizeAfterReset).toBe('16px');
    },
    timeoutAfter,
  );
  it(
    'resets the font size in Firefox',
    async () => {
      driver = await createDriver('firefox', true);
      const result = await fontSizeResetTest(driver);
      expect(result.sizeAfterReset).toBe('16px');
    },
    timeoutAfter,
  );
  it(
    'resets the font size in Safari',
    async () => {
      driver = await createDriver('safari', true);
      const result = await fontSizeResetTest(driver);
      expect(result.sizeAfterReset).toBe('16px');
    },
    timeoutAfter,
  );
});
