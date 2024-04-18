import { Builder, Browser, By, Key, Origin, until, waitUntilTime } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import edge from 'selenium-webdriver/edge';
import firefox from 'selenium-webdriver/firefox';

/**
 * helper function to create all drivers
 *
 * @param {boolean} headless to decide if the driver should be headless
 * @returns a list of webdrivers and their names
 */
export function createDrivers(headless) {
  const chrome = createChromeDriver(headless);
  const edge = createEdgeDriver(headless);
  const firefox = createFirefoxDriver(headless);
  const safari = createSafariDriver(headless);

  return [
    ['Chrome', chrome],
    ['Edge', edge],
    ['Firefox', firefox],
    ['Safari', safari],
  ];
}
/**
 * helper function to create a browser
 *
 * @param {String} browser to decide which browser to create
 * @param {boolean} headless to decide if the driver should be headless
 * @returns the desired browser
 */
export async function createDriver(browser, headless) {
  switch (browser) {
    case 'chrome':
      return await createChromeDriver(headless);
    case 'edge':
      return await createEdgeDriver(headless);
    case 'firefox':
      return await createFirefoxDriver(headless);
    case 'safari':
      return await createSafariDriver(headless);
  }
}

// functions to create a variety of drivers
/**
 *
 * @param {boolean} headless to decide if the driver should be headless
 * @returns chrome webdriver
 */
export async function createChromeDriver(headless) {
  let options = new chrome.Options();
  if (headless) {
    // see https://www.selenium.dev/documentation/webdriver/browsers/chrome/#arguments
    options.addArguments('--headless=new');
  }
  let driverBuilder = new Builder().forBrowser(Browser.CHROME);
  driverBuilder = driverBuilder.setChromeOptions(options);
  return driverBuilder.build();
}
/**
 *
 * @param {boolean} headless to decide if the driver should be headless
 * @returns edge webdriver
 */
export async function createEdgeDriver(headless) {
  let options = new edge.Options();
  if (headless) {
    // see https://www.selenium.dev/documentation/webdriver/browsers/edge/#arguments
    options.addArguments('--headless=new');
  }
  let driverBuilder = new Builder().forBrowser(Browser.EDGE);
  driverBuilder = driverBuilder.setEdgeOptions(options);
  return driverBuilder.build();
}
/**
 *
 * @param {boolean} headless to decide if the driver should be headless
 * @returns firefox webdriver
 */
export async function createFirefoxDriver(headless) {
  let options = new firefox.Options();
  if (headless) {
    // see https://www.selenium.dev/documentation/webdriver/browsers/firefox/#arguments
    options.addArguments('--headless');
  }
  let driverBuilder = new Builder().forBrowser(Browser.FIREFOX);
  driverBuilder = driverBuilder.setFirefoxOptions(options);
  return driverBuilder.build();
}
/**
 *
 * @param {boolean} headless to decide if the driver should be headless
 * @returns safari webdriver
 */
export async function createSafariDriver(_headless) {
  // no headless option for Safari
  return new Builder().forBrowser(Browser.SAFARI).build();
}

// helper functions for selenium
/**
 * get an element by id
 *
 * @param {String} id of the element
 * @param {SeleniumDriver} driver selenium webdriver
 * @returns a "selenium" node
 */
export async function getElementById(id, driver) {
  const el = await driver.wait(until.elementLocated(By.id(id)), waitUntilTime);
  return await driver.wait(until.elementIsVisible(el), waitUntilTime);
}

/**
 * get an element by xPath
 *
 * @param {String} xPath to the element
 * @param {SeleniumDriver} driver selenium webdriver
 * @returns a "selenium" node
 */
export async function getElementByXPath(xPath, driver) {
  const el = await driver.wait(until.elementLocated(By.xpath(xPath)), waitUntilTime);
  return await driver.wait(until.elementIsVisible(el), waitUntilTime);
}

/**
 * function to let selenium set the pseudonym
 *
 * @param {SeleniumDriver} driver selenium webdriver
 */
export async function enterPseudonym(driver) {
  const $pseudInput = await getElementById('pseudonymInitInput', driver);
  //const $pseudSubmitButton = await getElementByXPath('//*[@id="pseudonymInputModal"]/div/form/div[2]/button', driver);
  const caps = await driver.getCapabilities();
  const name = await caps.get('browserName');
  await $pseudInput.sendKeys('Selenium - ' + name);
  const xPath = '//*[@id="pseudonymInputModal"]/div/form/div[2]/button';
  await leftclick(xPath, driver);

  // reload the page using **the driver** after the page was reloaded by setting the pseudonmy
  // This avoids "StaleElementReferenceError: A node reference could not be resolved" and
  // "StaleElementReferenceError: stale element reference: stale element not found"
  await driver.navigate().refresh();
}

/**
 * helper to simulate a leftclick on a node
 * this is necessary as seleniums clicks aren't working in safari *
 *
 * @param {SeleniumNode} $node the node to be clicked
 * @param {SeleniumDriver} driver selenium webdriver
 */
export async function leftclickNode($node, driver) {
  const browserName = (await driver.getCapabilities()).getBrowserName();
  /* alternative way of getting the browsername
  const caps = await driver.getCapabilities();
  const name = await caps.get('browserName');
  console.log(name);
  */
  if (browserName == 'safari' || browserName == 'Safari' || browserName == 'SAFARI') {
    await driver.executeScript('arguments[0].click();', $node);
  } else {
    await $node.click();
  }
}

/**
 * helper to simulate a lick on a node selected with an xPath
 * this is necessary as seleniums clicks aren't working in safari *
 *
 * @param {String} xPath to the element
 * @param {SeleniumDriver} driver selenium webdriver
 */
export async function leftclick(xPath, driver) {
  const $node = await getElementByXPath(xPath, driver);
  const browserName = (await driver.getCapabilities()).getBrowserName();
  if (browserName == 'safari' || browserName == 'Safari' || browserName == 'SAFARI') {
    await driver.executeScript('arguments[0].click();', $node);
  } else {
    await $node.click();
  }
}

/**
 * helper to simulate a rightlick on a node selected with an xPath
 * this is necessary as seleniums clicks aren't working in safari *
 *
 * @param {String} xPath to the element
 * @param {SeleniumDriver} driver selenium webdriver
 */
export async function rightclick(xPath, driver) {
  const browserName = (await driver.getCapabilities()).getBrowserName();
  if (browserName == 'safari' || browserName == 'Safari' || browserName == 'SAFARI') {
    // as safari can't click properly, the click is simulated using js
    // see: https://stackoverflow.com/questions/43293136/javascript-simulate-click-on-contextmenu
    // the script const has different quotation markers to start the string as the xPath contains " and
    // therefore ' has to be used in the evaluate function. ESLint changed the escaped \' of the first part
    // of the string to ".
    const script =
      "var target = document.evaluate('" +
      xPath +
      '\', document,null,XPathResult.ANY_TYPE, XPathResult.singleNodeValue).iterateNext(); var evt = new MouseEvent("contextmenu", {bubbles: true,cancelable: true,view: window,buttons: 2,});target.dispatchEvent(evt);';
    await driver.executeScript(script);
  } else {
    const actions = driver.actions({ async: true });
    const $node = await getElementByXPath(xPath, driver);
    await actions.contextClick($node).perform();
  }
}

/**
 * helper to mark/select one word
 *
 * @param {String} xPath to the element
 * @param {SeleniumDriver} driver selenium webdriver
 */
export async function markWord(xPath, driver) {
  const $word = getElementByXPath(xPath, driver);
  const actions = driver.actions({ async: true });
  await actions.doubleClick($word).perform();
}

/**
 * helper to mark/select multiple words
 *
 * @param {String} xPath to the element
 * @param {SeleniumDriver} driver selenium webdriver
 */
export async function markWords(xPath, driver) {
  const $word = getElementByXPath(xPath, driver);
  const actions = driver.actions({ async: true });
  await actions.dragAndDrop($word, { x: 0, y: 80 }).perform();
  // old code, which does the same without a mouseUp at the end of the action
  // await actions.move({ origin: $word }).press().perform();
  // await actions.move({ x: 0, y: 80, origin: Origin.POINTER }).perform();
}

/**
 * helper function to show the annotation creation modal
 *
 * @param {SeleniumDriver} driver selenium webdriver
 */
export async function showAnnoCreationModal(driver) {
  // trigger mousedown event on the button to show annotaton creation modal
  const mouseDownScript =
    'const target = document.getElementById("selectTextButton");' +
    'const evt = new MouseEvent("mousedown", {bubbles: true,cancelable: true});' +
    'target.dispatchEvent(evt);';

  await driver.executeScript(mouseDownScript);
}

/**
 * helper function choose the metaphor template
 *
 * @param {String} template name of the template
 * @param {SeleniumDriver} driver selenium webdriver
 */
export async function chooseAnnoTemplate(template, driver) {
  const $annoTypeDropdown = await driver.findElement(By.xpath('/html/body/div[13]/div/form[1]/div/div/div/select'));
  await $annoTypeDropdown.sendKeys(template);
}

/**
 * helper function to create the anntoation
 *
 * @param {SeleniumDriver} driver selenium webdriver
 */
export async function createAnnotation(driver) {
  await leftclick('/html/body/div[13]/div/form[2]/div/input', driver);
}

/**
 * helper function to check if the annotationCard is visible on the
 * right side of the screen
 *
 * @param {SeleniumDriver} driver selenium webdriver
 * @returns boolen; truef if the annotation card is visible
 */
export async function checkIsAnnotationCardVisible(driver) {
  const $annotationCard = await getElementById('annotationCard', driver);
  const annotationCardClasses = await $annotationCard.getAttribute('class');
  const annotationCardIsVisible = !annotationCardClasses.split(' ').find((entry) => entry === 'is-hidden');
  return annotationCardIsVisible;
}

/**
 * helper function to check, which annotation is displayed
 *
 * @param {SeleniumDriver} driver selenium webdriver
 * @returns String of the ID of the annotation
 */
export async function getDisplayedAnnoId(driver) {
  const $iconRowTop = await getElementById('iconRowTop', driver);
  return await $iconRowTop.getAttribute('title');
}
