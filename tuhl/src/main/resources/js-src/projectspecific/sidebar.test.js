import { JSDOM } from 'jsdom';
import {
  enableHebrewSpecificButton,
  enableLanguageViewToggleButton,
  enableSanskritSpecificButton,
  toggleHebrewView,
  toggleSanskritView,
} from './sidebar';
import { Variant } from './textloader';

const innerHTMLHebrew = `
        <div id="sidebar">
            <div class="logo-name__button">
                <i class="bx  logo-name__icon annocollapse" id="logo-name__icon"
                    onclick="toggleAnnoSideBar()"></i>
                <span class="tooltip">Expand</span>
            </div>
            <li id="toggleViews" class="features-item draft">
                <i id="toggleViewsButton" class="bx bx-toggle-left features-item-icon"
                    "></i>
                <span class="features-item-text annocollapse";"
                    >Toggle Views</span>
                <span id="toggleViewsSpan" class="tooltip">Toggle Views</span>
            </li>
        </div>
        <div id="TEI" dir="rtl">
            <tei-text data-xmlns="http://www.tei-c.org/ns/1.0" xml:lang="hbo" lang="hbo" type="book">
                <tei-body n="Psalmi" xml:id="b.426617" id="b.426617">
                    <tei-div type="chapter" n="1" xml:id="c.427197" id="c.427197">
                        <tei-ab type="verse" n="1" xml:id="v.1429538" id="v.1429538">
                            <tei-choice data-origname="choice">
                                <tei-orig>
                                    <tei-w xml:id="w.310653_310654_310655"
                                        id="w.310653_310654_310655">
                                        <tei-w xml:id="w.310653" id="w.310653">אַ֥שְֽׁרֵי</tei-w>
                                        <tei-pc xml:id="pc.47746" id="pc.47746">־</tei-pc>
                                        <tei-w xml:id="w.310654" id="w.310654">הָ</tei-w>
                                        <tei-w xml:id="w.310655" id="w.310655">אִ֗ישׁ</tei-w>
                                    </tei-w>
                                </tei-orig>
                                <tei-reg></tei-reg>
                            </tei-choice>
                            <tei-pc id="pc.1" xml:id="pc.1">׀</tei-pc>
                        </tei-ab>
                    </tei-div>
                </tei-body>
            </tei-text>
        </div>`;

describe('assigns a css class to an element (when a user presses a button) for Hebrew texts', () => {
  beforeEach(() => {
    document.body.innerHTML = innerHTMLHebrew;
  });

  it('shows an element and a toggle right icon (first execution after on page load)', () => {
    const $ele = document.querySelectorAll('tei-reg')[0];
    const $button = document.getElementById('toggleViewsButton');
    toggleHebrewView($button);
    expect($ele.classList.contains('zeroOpacity')).toBe(true);
    expect($button.classList.contains('bx-toggle-left')).toBe(false);
    expect($button.classList.contains('bx-toggle-right')).toBe(true);
  });

  it('hides an element and shows a toggle left icon', () => {
    const $ele = document.querySelectorAll('tei-reg')[0];
    const $button = document.getElementById('toggleViewsButton');
    // mocking the state of the sidebar and document to match the state available
    // when the toggleHebriewView() was called already
    $ele.classList.add('zeroOpacity');
    $button.classList.add('bx-toggle-right');
    $button.classList.remove('bx-toggle-left');

    toggleHebrewView($button);
    expect($ele.classList.contains('zeroOpacity')).toBe(false);
    expect($button.classList.contains('bx-toggle-left')).toBe(true);
    expect($button.classList.contains('bx-toggle-right')).toBe(false);
  });
});

describe('assigns a css class to an element (when a user presses a button) for Sanskrit texts', () => {
  beforeEach(() => {
    document.body.innerHTML = innerHTMLHebrew;
  });

  it('shows an element and a toggle icon right left', () => {
    const $ele = document.querySelectorAll('tei-orig')[0];
    const $button = document.getElementById('toggleViewsButton');
    // mocking the state of the sidebar and document to match the state available
    // when the toggleSanskritView() was called already
    $button.classList.remove('bx-toggle-left');
    $button.classList.add('bx-toggle-right');
    $ele.classList.add('is-hidden');
    toggleSanskritView($button);
    expect($ele.classList.contains('is-hidden')).toBe(false);
    expect($button.classList.contains('bx-toggle-left')).toBe(true);
    expect($button.classList.contains('bx-toggle-right')).toBe(false);
  });

  it('hides an element and shows a toggle icon right (first execution after on page load)', () => {
    const $ele = document.querySelectorAll('tei-orig')[0];
    const $button = document.getElementById('toggleViewsButton');
    toggleSanskritView($button);
    expect($ele.classList.contains('is-hidden')).toBe(true);
    expect($button.classList.contains('bx-toggle-left')).toBe(false);
    expect($button.classList.contains('bx-toggle-right')).toBe(true);
  });
});

describe('enabling buttons in the sidebar', () => {
  let dom;
  beforeEach(() => {
    dom = new JSDOM(innerHTMLHebrew);
  });

  it('enables the button for Sanskrit texts', () => {
    const $sidebar = dom.window.document.getElementById('sidebar');
    const $toggleViews = $sidebar.querySelector('#toggleViews');

    enableSanskritSpecificButton($sidebar);
    expect($toggleViews.classList.contains('is-hidden')).toBe(false);
  });

  it('enables the button for Hebrew texts and presses it once', () => {
    const $sidebar = document.getElementById('sidebar');
    const $toggleViews = $sidebar.querySelector('#toggleViews');
    enableHebrewSpecificButton($sidebar);
    expect($toggleViews.classList.contains('is-hidden')).toBe(false);
  });
});

describe('enabling buttons in the sidebar based on a given Variant', () => {
  beforeEach(() => {
    document.body.innerHTML = innerHTMLHebrew;
  });

  it('enables the button for Sanskrit texts and presses it once', () => {
    const $sidebar = document.getElementById('sidebar');
    const $toggleViews = $sidebar.querySelector('#toggleViews');
    const $ele = document.querySelectorAll('tei-orig')[0];

    enableLanguageViewToggleButton($sidebar, Variant.B04);

    // execute the callback of the button to check if the callback is the
    // correct one, which works on Hebrew texts (the tei-reg element)
    const $button = $toggleViews.querySelector('#toggleViewsButton');
    $button.classList.add('bx-toggle-left');
    $button.click();

    expect($ele.classList.contains('is-hidden')).toBe(true);
    expect($button.classList.contains('bx-toggle-left')).toBe(false);
    expect($button.classList.contains('bx-toggle-right')).toBe(true);
    expect($toggleViews.classList.contains('is-hidden')).toBe(false);
  });

  it('enables the button for Hebrew texts and presses it once', () => {
    const $sidebar = document.getElementById('sidebar');
    const $toggleViews = $sidebar.querySelector('#toggleViews');
    const $ele = document.querySelectorAll('tei-reg')[0];

    enableLanguageViewToggleButton($sidebar, Variant.Hebrew);
    // execute the callback of the button to check if the callback is the
    // correct one, which works on Hebrew texts (the tei-reg element)
    const $button = $toggleViews.querySelector('#toggleViewsButton');
    $button.click();

    expect($ele.classList.contains('zeroOpacity')).toBe(false);
    expect($button.classList.contains('bx-toggle-left')).toBe(true);
    expect($button.classList.contains('bx-toggle-right')).toBe(false);
    expect($toggleViews.classList.contains('is-hidden')).toBe(false);
  });
});
