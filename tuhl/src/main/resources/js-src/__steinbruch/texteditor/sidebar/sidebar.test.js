import {
  initializeSidebar,
  updateSidebar,
  hideExpandedSidebar,
  toggleAnnoSideBar,
  increaseFontSize,
  decreaseFontSize,
  resetFontSize,
  toggleBoxIcon,
  toggleHebrewView,
  toggleSanskritView,
  enableTooltips,
} from './sidebar';

// initializeNavbar mostly attaches eventHandlers, which presence can't be tested, so there is no
// test for it.
// font size manipulation isn't tested either see below.

// loading the full html file according to:
// https://dev.to/snowleo208/things-i-learned-after-writing-tests-for-js-and-html-page-4lja
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.resolve(__dirname, './testing.html'), 'utf8');

jest.dontMock('fs');

describe('initializing the sidebar', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it('initializes the sidebar', () => {
    const initializedSidebar = initializeSidebar();
    expect(initializedSidebar).toBe(true);
  });
});

describe('updating buttons in the sidebar', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it('updates the buttons in the sidebar by initiliazing the buttons for texts in Hebrew', () => {
    const language = 'hbo';
    const sidebarUpdated = updateSidebar(language);
    const wrapperIsVisible = !document.getElementById('toggleViews').classList.contains('is-hidden');
    expect(wrapperIsVisible).toBe(true);
    expect(sidebarUpdated).toBe(true);
  });
  it('updates the buttons in the sidebar by initiliazing the buttons for texts in Sanskrit', () => {
    const language = 'sa-Latn';
    const sidebarUpdated = updateSidebar(language);
    const wrapperIsVisible = !document.getElementById('toggleViews').classList.contains('is-hidden');
    expect(wrapperIsVisible).toBe(true);
    expect(sidebarUpdated).toBe(true);
  });
  it('does not update the buttons in the sidebar as the text is not in Sanskrit or Hebrew', () => {
    const language = 'arb';
    const sidebarUpdated = updateSidebar(language);
    const wrapperIsVisible = !document.getElementById('toggleViews').classList.contains('is-hidden');
    expect(wrapperIsVisible).toBe(false);
    expect(sidebarUpdated).toBe(false);
  });
  // old test; not working as Philipp couldn't check for the presence of eventListeners.
  // The new tests use a return value by the called function, which is true, if everything worked.
  // it('updates the buttons in the sidebar by initiliazing the buttons for texts in Sanskrit', () => {
  //   const language = 'sa-Latn';
  //   updateSidebar(language);
  //   const wrapperIsVisible = !document.getElementById('toggleViews').classList.contains('is-hidden');
  //   const buttonHasEventListener = document.getElementById('toggleViewsButton').getAttribute('onclick') != null;
  //   const spanHasEventListener = document.getElementById('toggleViewsSpan').getAttribute('onclick') != null;
  //   expect(wrapperIsVisible).toBe(true);
  //   expect(buttonHasEventListener).toBe(true);
  //   expect(spanHasEventListener).toBe(true);
  // });
});

describe('hiding the sidebar', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it('hides the sidebar after a button was clicked, if the sidebar was visible', () => {
    const $sidebar = document.querySelector('.anno-side-bar');
    const $icon = document.getElementById('logo-name__icon');
    $sidebar.classList.remove('annocollapse');
    $icon.classList.remove('annocollapse');
    hideExpandedSidebar();
    const sidebarIsHidden = $sidebar.classList.contains('annocollapse');
    const iconPointsRight = $icon.classList.contains('bx-arrow-from-left');
    expect(sidebarIsHidden).toBe(true);
    expect(iconPointsRight).toBe(true);
  });
  it('keeps the sidebar hidden after a button was clicked, if the sidebar was hidden already', () => {
    const $sidebar = document.querySelector('.anno-side-bar');
    hideExpandedSidebar();
    const sidebarIsHidden = $sidebar.classList.contains('annocollapse');
    const iconPointsRight = document.getElementById('logo-name__icon').classList.contains('bx-arrow-from-left');
    expect(sidebarIsHidden).toBe(true);
    expect(iconPointsRight).toBe(true);
  });
});

describe('showing the sidebar', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it('shows the sidebar after clicking on the arrow in the top left corner', () => {
    const $sidebar = document.querySelector('.anno-side-bar');
    const $icon = document.getElementById('logo-name__icon');
    // showing the sidebar
    toggleAnnoSideBar();
    const sidebarIsHidden = $sidebar.classList.contains('annocollapse');
    const iconPointsLeft = $icon.classList.contains('bx-arrow-from-right');
    expect(sidebarIsHidden).toBe(false);
    expect(iconPointsLeft).toBe(true);
  });
});

// Philipp couldn't figure out a way to get the stlye/fontsize of the elements
// and thinks its impossible as jest doesnt render the HTML.
// This is tested using selenium see ./sidebar.selenium.test.js
describe.skip('manipulating the font size', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it('increases the font size', () => {
    const $txt = document.getElementById('TEI');
    const sizeBeforeChange = window.getComputedStyle($txt).fontSize;
    console.log($txt.style.fontSize);
    console.log(window.getComputedStyle($txt).fontSize);
    console.log(window.getComputedStyle($txt));
    increaseFontSize();
    const sizeAfterChange = window.getComputedStyle($txt).fontSize;
    console.log(document.getElementById('TEI').style.fontSize);
    console.log(window.getComputedStyle($txt).fontSize);
    console.log(window.getComputedStyle($txt));
    expect(sizeBeforeChange < sizeAfterChange).toBe(true);
  });
  it('decreases the font size', () => {
    const $txt = document.getElementById('TEI');
    const sizeBeforeChange = $txt.style.fontSize;
    decreaseFontSize();
    const sizeAfterChange = $txt.style.fontSize;
    expect(sizeBeforeChange > sizeAfterChange).toBe(true);
  });
  it('resets the font size', () => {
    const $txt = document.getElementById('TEI');
    resetFontSize();
    const textFontSize = $txt.style.fontSize;
    expect(textFontSize).toBe('initial');
  });
});

describe('toggling icons of buttons', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it('toggles the icons (A present, B missing at the start)', () => {
    const $button = document.getElementById('toggleViewsButton');
    toggleBoxIcon($button, 'bx-toggle-left', 'bx-toggle-right');
    const iconAPresent = $button.classList.contains('bx-toggle-left');
    const iconBPresent = $button.classList.contains('bx-toggle-right');
    expect(iconAPresent).toBe(false);
    expect(iconBPresent).toBe(true);
  });
  it('toggles the icons (A missing, B present at the start)', () => {
    const $button = document.getElementById('toggleViewsButton');
    // toggling the icons initially to emulate the case when A is missing and B present
    $button.classList.toggle('bx-toggle-left');
    $button.classList.toggle('bx-toggle-right');
    toggleBoxIcon($button, 'bx-toggle-left', 'bx-toggle-right');
    const iconAPresent = $button.classList.contains('bx-toggle-left');
    const iconBPresent = $button.classList.contains('bx-toggle-right');
    expect(iconAPresent).toBe(true);
    expect(iconBPresent).toBe(false);
  });
});

describe('changing the displayed Hebrew text', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it('hides the elements containing vocalized version in the texts', () => {
    const $button = document.getElementById('toggleViewsButton');
    toggleHebrewView();
    const iconAPresent = $button.classList.contains('bx-toggle-left');
    const iconBPresent = $button.classList.contains('bx-toggle-right');
    const regElementIsHidden = document.querySelectorAll('tei-reg')[0].classList.contains('zeroOpacity');
    expect(iconAPresent).toBe(false);
    expect(iconBPresent).toBe(true);
    expect(regElementIsHidden).toBe(true);
  });
  it('shows the elements containing vocalized version in the text', () => {
    const $button = document.getElementById('toggleViewsButton');
    // hiding the elenents and toggling the icons initially to emulate the case when the text is hidden
    document.querySelectorAll('tei-reg')[0].classList.add('zeroOpacity');
    $button.classList.toggle('bx-toggle-left');
    $button.classList.toggle('bx-toggle-right');
    toggleHebrewView();
    const iconAPresent = $button.classList.contains('bx-toggle-left');
    const iconBPresent = $button.classList.contains('bx-toggle-right');
    const regElementIsHidden = document.querySelectorAll('tei-reg')[0].classList.contains('zeroOpacity');
    expect(iconAPresent).toBe(true);
    expect(iconBPresent).toBe(false);
    expect(regElementIsHidden).toBe(false);
  });
});

describe('changing the displayed Sanskrit text', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it('hides the elements containing sandhied version in the texts', () => {
    const $button = document.getElementById('toggleViewsButton');
    toggleSanskritView();
    const iconAPresent = $button.classList.contains('bx-toggle-left');
    const iconBPresent = $button.classList.contains('bx-toggle-right');
    const origElementIsHidden = document.querySelectorAll('tei-orig')[0].classList.contains('is-hidden');
    expect(iconAPresent).toBe(false);
    expect(iconBPresent).toBe(true);
    expect(origElementIsHidden).toBe(true);
  });
  it('shows the elements containing sandhied version in the text', () => {
    const $button = document.getElementById('toggleViewsButton');
    // hiding the elenents and toggling the icons initially to emulate the case when the text is hidden
    document.querySelectorAll('tei-orig')[0].classList.add('is-hidden');
    $button.classList.toggle('bx-toggle-left');
    $button.classList.toggle('bx-toggle-right');
    toggleSanskritView();
    const iconAPresent = $button.classList.contains('bx-toggle-left');
    const iconBPresent = $button.classList.contains('bx-toggle-right');
    const origElementIsHidden = document.querySelectorAll('tei-orig')[0].classList.contains('is-hidden');
    expect(iconAPresent).toBe(true);
    expect(iconBPresent).toBe(false);
    expect(origElementIsHidden).toBe(false);
  });
});

describe('enabling tooltips', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it('enables the tooltips for the sidebar by attaching eventListeners', () => {
    const tooltipsEnabled = enableTooltips();
    const hoverTooltipExists = document.querySelectorAll('.hoverTooltip')[0] != undefined;
    expect(tooltipsEnabled).toBe(true);
    expect(hoverTooltipExists).toBe(true);
  });
});
