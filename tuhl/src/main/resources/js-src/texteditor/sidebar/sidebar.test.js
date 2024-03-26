import {
  updateSidebar,
  hideExpandedSidebar,
  increaseFontSize,
  decreaseFontSize,
  resetFontSize,
  toggleBoxIcon,
  toggleHebrewView,
  toggleSanskritView,
  enableTooltips,
} from './sidebar';

// loading the full html file according to:
// https://dev.to/snowleo208/things-i-learned-after-writing-tests-for-js-and-html-page-4lja
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.resolve(__dirname, './testing.html'), 'utf8');

jest.dontMock('fs');

describe.skip('updating buttons in the sidebar', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it('updates the buttons in the sidebar by initiliazing the buttons for texts in Hebrew', () => {
    const language = 'hbo';
    updateSidebar(language);
    const wrapperIsVisible = !document.getElementById('toggleViews').classList.contains('is-hidden');
    const buttonHasEventListener = document.getElementById('toggleViewsButton').getAttribute('onclick') != null;
    const spanHasEventListener = document.getElementById('toggleViewsSpan').getAttribute('onclick') != null;
    expect(wrapperIsVisible).toBe(true);
    expect(buttonHasEventListener).toBe(true);
    expect(spanHasEventListener).toBe(true);
  });
  it('updates the buttons in the sidebar by initiliazing the buttons for texts in Sanskrit', () => {
    const language = 'sa-Latn';
    updateSidebar(language);
    const wrapperIsVisible = !document.getElementById('toggleViews').classList.contains('is-hidden');
    const buttonHasEventListener = document.getElementById('toggleViewsButton').getAttribute('onclick') != null;
    const spanHasEventListener = document.getElementById('toggleViewsSpan').getAttribute('onclick') != null;
    expect(wrapperIsVisible).toBe(true);
    expect(buttonHasEventListener).toBe(true);
    expect(spanHasEventListener).toBe(true);
  });
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
    $sidebar.classList.remove('annocollapse');
    hideExpandedSidebar();
    const sidebarIsHidden = $sidebar.classList.contains('annocollapse');
    expect(sidebarIsHidden).toBe(true);
  });
  it('keeps the sidebar hidden after a button was clicked, if the sidebar was hidden already', () => {
    const $sidebar = document.querySelector('.anno-side-bar');
    hideExpandedSidebar();
    const sidebarIsHidden = $sidebar.classList.contains('annocollapse');
    expect(sidebarIsHidden).toBe(true);
  });
});

describe('manipulating the font size', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it.skip('increases the font size', () => {
    const $txt = document.getElementById('TEI');
    const sizeBeforeChange = window.getComputedStyle($txt).fontSize;
    console.log(window.getComputedStyle($txt).fontSize);
    console.log(window.getComputedStyle($txt));
    increaseFontSize();
    const sizeAfterChange = window.getComputedStyle($txt).fontSize;
    console.log(window.getComputedStyle($txt).fontSize);
    console.log(window.getComputedStyle($txt));
    expect(sizeBeforeChange < sizeAfterChange).toBe(true);
  });
  it.skip('decreases the font size', () => {
    const $txt = document.getElementById('TEI');
    const sizeBeforeChange = $txt.style.fontSize;
    decreaseFontSize();
    const sizeAfterChange = $txt.style.fontSize;
    expect(sizeBeforeChange > sizeAfterChange).toBe(true);
  });
  it.skip('resets the font size', () => {
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

  it.skip('enables the tooltips for the sidebar by attaching eventListeners', () => {
    enableTooltips();
    const hoverAreaHasEventListeners =
      document.querySelectorAll('.features-item')[0].getAttribute('mouseenter') != null &&
      document.querySelectorAll('.features-item')[0].getAttribute('mouseleave') != null;
    const hoverTooltipExists = document.querySelectorAll('.hoverTooltip')[0] != undefined;
    expect(hoverAreaHasEventListeners).toBe(true);
    expect(hoverTooltipExists).toBe(true);
  });
});
