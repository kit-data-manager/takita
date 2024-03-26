import { Builder, Browser, By, Key, Origin, until, waitUntilTime } from 'selenium-webdriver';

// helper functions for selenium
// get an element by id
export async function getElementById(id, driver) {
  const el = await driver.wait(until.elementLocated(By.id(id)), waitUntilTime);
  return await driver.wait(until.elementIsVisible(el), waitUntilTime);
}
// get an element by xPath
export async function getElementByXPath(xPath, driver) {
  const el = await driver.wait(until.elementLocated(By.xpath(xPath)), waitUntilTime);
  return await driver.wait(until.elementIsVisible(el), waitUntilTime);
}

// function to let selenium set the pseudonym
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

// helper to simulate a leftclick on a node
// this is necessary as seleniums clicks aren't working in safari
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

// helper to simulate a lick on a node selected with an xPath
// this is necessary as seleniums clicks aren't working in safari
export async function leftclick(xPath, driver) {
  const $node = await getElementByXPath(xPath, driver);
  const browserName = (await driver.getCapabilities()).getBrowserName();
  if (browserName == 'safari' || browserName == 'Safari' || browserName == 'SAFARI') {
    await driver.executeScript('arguments[0].click();', $node);
  } else {
    await $node.click();
  }
}

// helper to simulate a rightlick on a node selected with an xPath
// this is necessary as seleniums clicks aren't working in safari
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

// helper to mark/select one word
export async function markWord(xPath, driver) {
  const $word = getElementByXPath(xPath, driver);
  const actions = driver.actions({ async: true });
  await actions.doubleClick($word).perform();
}

// helper to mark/select multiple words
export async function markWords(xPath, driver) {
  const $word = getElementByXPath(xPath, driver);
  const actions = driver.actions({ async: true });
  await actions.move({ origin: $word }).press().perform();
  await actions.move({ x: 0, y: 80, origin: Origin.POINTER }).perform();
}

// helper function to show the annotation creation modal
export async function showAnnoCreationModal(driver) {
  // trigger mousedown event on the button to show annotaton creation modal
  const mouseDownScript =
    'const target = document.evaluate(\'id("selectTextButton")\', document,null,XPathResult.ANY_TYPE, XPathResult.singleNodeValue).iterateNext();' +
    'const evt = new MouseEvent("mousedown", {bubbles: true,cancelable: true});target.dispatchEvent(evt);';
  await driver.executeScript(mouseDownScript);
}

// helper function choose the metaphor template
export async function chooseAnnoTemplate(template, driver) {
  const $annoTypeDropdown = await driver.findElement(By.xpath('/html/body/div[13]/div/form[1]/div/div/div/select'));
  await $annoTypeDropdown.sendKeys(template);
}

// helper function to create the anntoation
export async function createAnnotation(driver) {
  await leftclick('/html/body/div[13]/div/form[2]/div/input', driver);
}

// helper function to check if the annotationCard is visible on the
// right side of the screen
export async function checkIsAnnotationCardVisible(driver) {
  const $annotationCard = await getElementById('annotationCard', driver);
  const annotationCardClasses = await $annotationCard.getAttribute('class');
  const annotationCardIsVisible = !annotationCardClasses.split(' ').find((entry) => entry === 'is-hidden');
  return annotationCardIsVisible;
}

// helper function to check, which annotation is displayed
export async function getDisplayedAnnoId(driver) {
  const $iconRowTop = await getElementById('iconRowTop', driver);
  return await $iconRowTop.getAttribute('title');
}
