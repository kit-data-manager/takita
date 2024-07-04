import { Variant } from '../../projectspecific';
import { collapseSidebar, determineVariant, toggleSidebar } from './sidebar';

const expandedSidebar = `
<div id="sideBar" class="anno-side-bar">
  <div class="logo-name-wrapper">
    <div class="logo-name">
      <span class="logo-name__name">Akita 3.0</span>
    </div>
    <div class="logo-name__button">
      <i class="bx bx-arrow-from-right logo-name__icon" id="logo-name__icon"></i>
      <span class="tooltip">Collapse</span>
    </div>
  </div>
  <ul class="features-list">
    <div class="category-header">View Mode</div>
    <li class="features-item draft">
      <i id="fontIncreaseButton" class="bx bx-zoom-in features-item-icon"></i>
      <span id="fontIncreaseSpan" class="features-item-text">Increase Font Size</span>
      <span class="tooltip">Increase Font Size</span>
    </li>
  </ul>
</div>
`;

const collapsedSidebar = `
<div id="sideBar" class="anno-side-bar annocollapse">
  <div class="logo-name-wrapper">
    <div class="logo-name">
      <span class="logo-name__name">Akita 3.0</span>
    </div>
    <div class="logo-name__button">
      <i class="bx bx-arrow-from-left logo-name__icon annocollapse" id="logo-name__icon"></i>
      <span class="tooltip">Expand</span>
    </div>
  </div>
  <ul class="features-list">
    <div class="category-header">View Mode</div>
    <li class="features-item draft">
      <i id="fontIncreaseButton" class="bx bx-zoom-in features-item-icon"></i>
      <span id="fontIncreaseSpan" class="features-item-text annocollapse">Increase Font Size</span>
      <span class="tooltip">Increase Font Size</span>
    </li>
  </ul>
</div>
`;

const innerHTMLSanskrit =
  '<div id="TEI"><tei-text xml:lang="sa-Latn" lang="sa-Latn" type="book" data-xmlns="http://www.tei-c.org/ns/1.0">' +
  '<tei-body n="Viṣṇupurāṇa" xml:id="b.400" id="b.400">' +
  '   <tei-div type="kāṇḍa" n="ViPur, 5">' +
  '        <tei-div type="chapter" n="1" xml:id="c.8520" id="c.8520">' +
  '            <tei-lg n="19">' +
  '                <tei-l xml:id="l.501102" id="l.501102"><tei-choice n="sandhi"><tei-orig><tei-w xml:id="w.4292523.s" id="w.4292523.s">sa</tei-w> </tei-orig> <tei-reg><tei-w xml:id="w.4292523" id="w.4292523">saḥ</tei-w> </tei-reg></tei-choice> <tei-w xml:id="w.4292524" id="w.4292524">dadarśa</tei-w> <tei-w xml:id="w.4292525" id="w.4292525">tadā</tei-w> <tei-w xml:id="w.4292526" id="w.4292526">tatra</tei-w> <tei-w xml:id="w.4292737" id="w.4292737">kṛṣṇam</tei-w> <tei-w xml:id="w.4292755" id="w.4292755">ādohane</tei-w> <tei-w xml:id="w.4292527" id="w.4292527">gavām</tei-w> </tei-l>' +
  '                <tei-l xml:id="l.501103" id="l.501103"><tei-choice n="sandhi"><tei-orig><tei-w xml:id="w.4292528_4292529_4292530.s" id="w.4292528_4292529_4292530.s">vatsamadhyagataṃ</tei-w> </tei-orig> <tei-reg><tei-w xml:id="w.4292528" id="w.4292528" class="">vatsa</tei-w><tei-w xml:id="w.4292529" id="w.4292529" class="">madhya</tei-w><tei-w xml:id="w.4292530" id="w.4292530">gatam</tei-w> </tei-reg></tei-choice> <tei-choice n="sandhi"><tei-orig><tei-w xml:id="w.4292531_4292532_4292533_4292534.s" id="w.4292531_4292532_4292533_4292534.s">phullanīlotpaladalacchavim</tei-w> </tei-orig> <tei-reg><tei-w xml:id="w.4292531" id="w.4292531" class="mrw metaphor whitespaceAfter ">phulla</tei-w><tei-w xml:id="w.4292532" id="w.4292532" class="mrw metaphor whitespaceAfter ">nīlotpala</tei-w><tei-w xml:id="w.4292533" id="w.4292533" class="mrw metaphor whitespaceAfter ">dala</tei-w><tei-w xml:id="w.4292534" id="w.4292534" class="mrw metaphor">chavim</tei-w> </tei-reg></tei-choice> </tei-l>' +
  '            </tei-lg></tei-div></tei-div></tei-body></tei-text></div>';

const innerHTMLHebrew =
  '<div id="TEI" dir="rtl"><tei-text data-xmlns="http://www.tei-c.org/ns/1.0" xml:lang="hbo" lang="hbo" type="book">' +
  '<tei-body n="Psalmi" xml:id="b.426617" id="b.426617">' +
  '   <tei-div type="chapter" n="1" xml:id="c.427197" id="c.427197">' +
  '      <tei-ab type="verse" n="1" xml:id="v.1429538" id="v.1429538"><tei-choice data-origname="choice"><tei-orig><tei-w xml:id="w.310653_310654_310655" id="w.310653_310654_310655"><tei-w xml:id="w.310653" id="w.310653">אַ֥שְֽׁרֵי</tei-w><tei-pc xml:id="pc.47746" id="pc.47746">־</tei-pc><tei-w xml:id="w.310654" id="w.310654">הָ</tei-w><tei-w xml:id="w.310655" id="w.310655">אִ֗ישׁ</tei-w></tei-w></tei-orig> <tei-reg class="zeroOpacity"></tei-reg></tei-choice><tei-pc id="pc.1" xml:id="pc.1">׀</pc></tei-ab></tei-div></tei-body></tei-text></div>';

describe('in a collapsed sidebar', () => {
  let $sidebar;

  beforeEach(() => {
    let $container;
    $container = document.createElement('div');
    $container.innerHTML = collapsedSidebar;
    $sidebar = $container.firstElementChild;
  });

  it('expands the sidebar itself', () => {
    toggleSidebar($sidebar);
    expect($sidebar.classList.contains('annocollapse')).toBe(false);
  });

  it('adjusts the toggle button to be an arrow from the left', () => {
    toggleSidebar($sidebar);
    const button = $sidebar.querySelector('#logo-name__icon');
    expect(button).toBeDefined();
    expect(button.classList.contains('annocollapse')).toBe(false);
    expect(button.classList.contains('bx-arrow-from-right')).toBe(true);
  });

  it('expands text elements (toggle sidebar test)', () => {
    toggleSidebar($sidebar);
    const allExpanded = [...$sidebar.querySelectorAll('.features-item-text')].every(($elem) => {
      return !$elem.classList.contains('annocollapse');
    });
    expect(allExpanded).toBe(true);
  });
});

describe('in an expanded sidebar (toggle sidebar test)', () => {
  let $sidebar;

  beforeEach(() => {
    let $container;
    $container = document.createElement('div');
    $container.innerHTML = expandedSidebar;
    $sidebar = $container.firstElementChild;
  });

  it('collapses the sidebar itself', () => {
    toggleSidebar($sidebar);
    expect($sidebar.classList.contains('annocollapse')).toBe(true);
  });

  it('adjusts the toggle button to be an arrow from the right', () => {
    toggleSidebar($sidebar);
    const button = $sidebar.querySelector('#logo-name__icon');
    expect(button).toBeDefined();
    expect(button.classList.contains('annocollapse')).toBe(true);
    expect(button.classList.contains('bx-arrow-from-left')).toBe(true);
  });

  it('collapses text elements', () => {
    toggleSidebar($sidebar);
    const allCollapsed = [...$sidebar.querySelectorAll('.features-item-text')].every(($elem) => {
      return $elem.classList.contains('annocollapse');
    });
    expect(allCollapsed).toBe(true);
  });
});

describe('in an expanded sidebar (collapse sidebar test)', () => {
  let $sidebar;

  beforeEach(() => {
    let $container;
    $container = document.createElement('div');
    $container.innerHTML = expandedSidebar;
    $sidebar = $container.firstElementChild;
  });

  it('collapses the sidebar itself', () => {
    collapseSidebar($sidebar);
    expect($sidebar.classList.contains('annocollapse')).toBe(true);
  });

  it('adjusts the toggle button to be an arrow from the right', () => {
    collapseSidebar($sidebar);
    const button = $sidebar.querySelector('#logo-name__icon');
    expect(button).toBeDefined();
    expect(button.classList.contains('annocollapse')).toBe(true);
    expect(button.classList.contains('bx-arrow-from-left')).toBe(true);
  });

  it('collapses text elements', () => {
    collapseSidebar($sidebar);
    const allCollapsed = [...$sidebar.querySelectorAll('.features-item-text')].every(($elem) => {
      return $elem.classList.contains('annocollapse');
    });
    expect(allCollapsed).toBe(true);
  });
});

describe('in a collapsed sidebar (collapse sidebar test)', () => {
  let $sidebar;

  beforeEach(() => {
    let $container;
    $container = document.createElement('div');
    $container.innerHTML = collapsedSidebar;
    $sidebar = $container.firstElementChild;
  });

  it('keeps the sidebar itself collapsed', () => {
    collapseSidebar($sidebar);
    expect($sidebar.classList.contains('annocollapse')).toBe(true);
  });

  it('does not adjust the toggle button to be an arrow from the left', () => {
    collapseSidebar($sidebar);
    const button = $sidebar.querySelector('#logo-name__icon');
    expect(button).toBeDefined();
    expect(button.classList.contains('annocollapse')).toBe(true);
    expect(button.classList.contains('bx-arrow-from-left')).toBe(true);
    expect(button.classList.contains('bx-arrow-from-right')).toBe(false);
  });

  it('does not expand text elements', () => {
    collapseSidebar($sidebar);
    const allExpanded = [...$sidebar.querySelectorAll('.features-item-text')].every(($elem) => {
      return !$elem.classList.contains('annocollapse');
    });
    expect(allExpanded).toBe(false);
  });
});

// these tests need to be adapted or skipped by projects, if the Variant are different
describe('getting the variant of the text', () => {
  it('determines the variant to be Default', () => {
    let $container = document.createElement('div');
    $container.innerHTML = innerHTMLHebrew;
    const variant = determineVariant($container, 'en');
    expect(variant).toBe(Variant.Default);
  });
  it('determines the variant to be Default', () => {
    let $container = document.createElement('div');
    $container.innerHTML = '<div>hi</div>';
    const variant = determineVariant($container, 'sa-Latn');
    expect(variant).toBe(Variant.Default);
  });
  it('determines the variant to be Default', () => {
    let $container = document.createElement('div');
    $container.innerHTML = innerHTMLSanskrit;
    const variant = determineVariant($container, 'en');
    expect(variant).toBe(Variant.Default);
  });
  it('determines the variant to be Hebrew', () => {
    let $container = document.createElement('div');
    $container.innerHTML = innerHTMLHebrew;
    const variant = determineVariant($container, 'hbo');
    expect(variant).toBe(Variant.Hebrew);
  });
  it('determines the variant to be B04', () => {
    let $container = document.createElement('div');
    $container.innerHTML = innerHTMLSanskrit;
    const variant = determineVariant($container, 'sa-Latn');
    expect(variant).toBe(Variant.B04);
  });
});
