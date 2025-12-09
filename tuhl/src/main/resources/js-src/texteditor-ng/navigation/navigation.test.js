import * as annotationCard from '../../common/annotationCard/annotationCard';
import * as projectspecific from '../projectspecific/index';
import { createOption } from '../../common/utils';
import {
  getTargetDivision,
  selectDivision,
  getDivisionTypes,
  getDivisionLabel,
  getTargetElement,
  updateButtons,
  initializeNavigation,
  navigateToAnnotation,
} from './navigation';

const defaultNavBar = `
	<div id="textNavBar" class="textNavBar row d-none">
        <div class="col-1"></div>
        <div class="col-1"><button type="button" class="btn btn-secondary" id="prevChaptButton">Previous chapter</button></div>
        <div class="col-2">
	        <div class="row">
	                <div class="col-7">
	                    <button type="button" class="btn btn-secondary" id="goToChaptButton">Go to chapter</button>
	                </div>
	                <select class="col-5" id="chapterSelect">
	                </select>
	        </div>
        </div>
        <div class="col-1"><button type="button" class="btn btn-secondary" id="nextChaptButton">Next chapter</button></div>
        <div class="col-1"><button type="button" class="btn btn-secondary" id="toggleShowAllButton">Show all</button></div>
        <div class="col-6"></div>
    </div>
    <div id="textNavBarLow" class="textNavBar row d-none">
        <div class="col-1"></div>
        <div class="col-1"><button type="button" class="btn btn-secondary" id="prevChaptButtonLow">Previous chapter</button></div>
        <div class="col-2">
	        <div class="row">
	                <div class="col-7">
	                    <button type="button" class="btn btn-secondary" id="goToChaptButtonLow">Go to chapter</button>
	                </div>
	                <select class="col-5" id="chapterSelectLow">
	                </select>
	        </div>
        </div>
        <div class="col-1"><button type="button" class="btn btn-secondary" id="nextChaptButtonLow">Next chapter</button></div>
        <div class="col-1"><button type="button" class="btn btn-secondary" id="toggleShowAllButtonLow">Show all</button></div>
        <div class="col-6"></div>
    </div>`;

const teiWithUnknownDivtype = `
<tei-text data-xmlns="http://www.tei-c.org/ns/1.0" xml:lang="och" lang="och" type="book" data-origname="text" data-origatts="xmlns xml:lang type" data-processed="">
  <tei-body xml:id="b.3" id="b.3" n="guangzi_2" data-origname="body" data-origatts="xml:id n" data-processed="">
    <tei-head xml:id="h.3" id="h.3" data-origname="head" data-origatts="xml:id" data-processed="">
      <tei-w xml:id="w.2720" id="w.2720" data-origname="w" data-origatts="xml:id" data-processed="">心</tei-w>
      <tei-w xml:id="w.2721" id="w.2721" data-origname="w" data-origatts="xml:id" data-processed="">術</tei-w>
      <tei-w xml:id="w.2722" id="w.2722" data-origname="w" data-origatts="xml:id" data-processed="">上</tei-w>
    </tei-head>
    <tei-div type="fantasyDivType" n="1" xml:id="c.10" id="c.10" data-origname="div" data-origatts="type n xml:id" data-processed="" class="d-none">
        <tei-p xml:id="p.25" id="p.25" data-origname="p" data-origatts="xml:id" data-processed="">
          <tei-w xml:id="w.2723" id="w.2723" data-origname="w" data-origatts="xml:id" data-processed="">心</tei-w>
          <tei-w xml:id="w.2724" id="w.2724" data-origname="w" data-origatts="xml:id" data-processed="">之</tei-w>
          <tei-w xml:id="w.2725" id="w.2725" data-origname="w" data-origatts="xml:id" data-processed="">在</tei-w>
          <tei-w xml:id="w.2726" id="w.2726" data-origname="w" data-origatts="xml:id" data-processed="">體</tei-w>
          <tei-pc xml:id="pc.524" id="pc.524" data-origname="pc" data-origatts="xml:id" data-processed="">。</tei-pc>
        </tei-p>
    </tei-div>
  </tei-body>
</tei-text>
`;

const teiWithChapters = `
<tei-text data-xmlns="http://www.tei-c.org/ns/1.0" xml:id="v500_ck.xml" id="v500_ck.xml" xml:lang="la" lang="la" data-origname="text" data-origatts="xmlns xml:id xml:lang" data-processed="">
  <tei-body xml:id="NvK-CK" id="NvK-CK" n="De correctione kalendarii" data-origname="body" data-origatts="xml:id n" data-processed="">
    <tei-pb ed="print" n="2" data-origname="pb" data-origatts="ed n" data-empty="" data-processed=""></tei-pb>
    <tei-pb ed="digital" n="U1" data-origname="pb" data-origatts="ed n" data-empty="" data-processed=""></tei-pb>
    <tei-head data-origname="head" data-processed="">
      <tei-lb n="CK_U1_1" ed="CK_2_1" data-origname="lb" data-origatts="n ed" data-empty="" data-processed=""></tei-lb>
      <tei-w xml:id="C500000001" id="C500000001" data-origname="w" data-origatts="xml:id" data-processed="">De</tei-w>
      <tei-w xml:id="C500000002" id="C500000002" data-origname="w" data-origatts="xml:id" data-processed="">correctione</tei-w>
      <tei-w xml:id="C500000003" id="C500000003" data-origname="w" data-origatts="xml:id" data-processed="">kalendarii</tei-w>
    </tei-head>
    <tei-div type="chapter" n="prosa" data-origname="div" data-origatts="type n" data-processed="" class="">
      <tei-pb ed="print" n="4" data-origname="pb" data-origatts="ed n" data-empty="" data-processed=""></tei-pb>
      <tei-pb ed="digital" n="1" data-origname="pb" data-origatts="ed n" data-empty="" data-processed=""></tei-pb>
      <tei-head data-origname="head" data-processed="">
        <tei-lb n="CK_1_1" ed="CK_4_1" data-origname="lb" data-origatts="n ed" data-empty="" data-processed=""></tei-lb>
        <tei-w xml:id="C500000004" id="C500000004" data-origname="w" data-origatts="xml:id" data-processed="">CAPITULUM</tei-w>
        <tei-w xml:id="C500000005" id="C500000005" data-origname="w" data-origatts="xml:id" data-processed="">I</tei-w>
      </tei-head>
      <tei-p rend="indent" data-origname="p" data-origatts="rend" data-processed="">
        <tei-lb n="CK_1_2" ed="CK_4_2" data-origname="lb" data-origatts="n ed" data-empty="" data-processed=""></tei-lb>
        <tei-w xml:id="C500000006" id="C500000006" data-origname="w" data-origatts="xml:id" data-processed="">Ad</tei-w>
        <tei-w xml:id="C500000007" id="C500000007" data-origname="w" data-origatts="xml:id" data-processed="">laudem</tei-w>
        <tei-w xml:id="C500000008" id="C500000008" data-origname="w" data-origatts="xml:id" data-processed="">omnipotentis</tei-w>
        <tei-w xml:id="C500000009" id="C500000009" data-origname="w" data-origatts="xml:id" data-processed="">Dei</tei-w>
        <tei-pc xml:id="pc.1" id="pc.1" data-origname="pc" data-origatts="xml:id" data-processed="">.</tei-pc>
      </tei-p>
    </tei-div>
  </tei-body>
</tei-text>
`;

const teiWithSections = `
<tei-text data-xmlns="http://www.tei-c.org/ns/1.0" xml:lang="och" lang="och" type="book" data-origname="text" data-origatts="xmlns xml:lang type" data-processed="">
  <tei-body xml:id="b.3" id="b.3" n="guangzi_2" data-origname="body" data-origatts="xml:id n" data-processed="">
    <tei-head xml:id="h.3" id="h.3" data-origname="head" data-origatts="xml:id" data-processed="">
      <tei-w xml:id="w.2720" id="w.2720" data-origname="w" data-origatts="xml:id" data-processed="">心</tei-w>
      <tei-w xml:id="w.2721" id="w.2721" data-origname="w" data-origatts="xml:id" data-processed="">術</tei-w>
      <tei-w xml:id="w.2722" id="w.2722" data-origname="w" data-origatts="xml:id" data-processed="">上</tei-w>
    </tei-head>
    <tei-div type="section" n="1" xml:id="c.10" id="c.10" data-origname="div" data-origatts="type n xml:id" data-processed="">
      <tei-p xml:id="p.25" id="p.25" data-origname="p" data-origatts="xml:id" data-processed="">
        <tei-w xml:id="w.2723" id="w.2723" data-origname="w" data-origatts="xml:id" data-processed="">心</tei-w>
        <tei-w xml:id="w.2724" id="w.2724" data-origname="w" data-origatts="xml:id" data-processed="">之</tei-w>
        <tei-w xml:id="w.2725" id="w.2725" data-origname="w" data-origatts="xml:id" data-processed="">在</tei-w>
        <tei-w xml:id="w.2726" id="w.2726" data-origname="w" data-origatts="xml:id" data-processed="">體</tei-w>
        <tei-pc xml:id="pc.524" id="pc.524" data-origname="pc" data-origatts="xml:id" data-processed="">。</tei-pc>
      </tei-p>
    </tei-div>
    <tei-div type="section" n="2" xml:id="c.20" id="c.20" data-origname="div" data-origatts="type n xml:id" data-processed="">
      <tei-p xml:id="p.26" id="p.26" data-origname="p" data-origatts="xml:id" data-processed="">
        <tei-w xml:id="w.2823" id="w.2823" data-origname="w" data-origatts="xml:id" data-processed="">心</tei-w>
        <tei-w xml:id="w.2824" id="w.2824" data-origname="w" data-origatts="xml:id" data-processed="">之</tei-w>
        <tei-w xml:id="w.2825" id="w.2825" data-origname="w" data-origatts="xml:id" data-processed="">在</tei-w>
        <tei-w xml:id="w.2826" id="w.2826" data-origname="w" data-origatts="xml:id" data-processed="">體</tei-w>
        <tei-pc xml:id="pc.525" id="pc.525" data-origname="pc" data-origatts="xml:id" data-processed="">。</tei-pc>
      </tei-p>
  </tei-div>
  </tei-body>
</tei-text>
`;

const teiWithChaptersNSections = `
<tei-text data-xmlns="http://www.tei-c.org/ns/1.0" xml:lang="och" lang="och" type="book" data-origname="text" data-origatts="xmlns xml:lang type" data-processed="">
  <tei-body xml:id="b.3" id="b.3" n="guangzi_2" data-origname="body" data-origatts="xml:id n" data-processed="">
    <tei-div type="chapter" n="prosa" data-origname="div" data-origatts="type n" data-processed="" class="">
      <tei-div type="section" n="1" xml:id="c.10" id="c.10" data-origname="div" data-origatts="type n xml:id" data-processed="">
      </tei-div>
      <tei-div type="section" n="2" xml:id="c.20" id="c.20" data-origname="div" data-origatts="type n xml:id" data-processed="">
      </tei-div>
    </tei-div>
  </tei-body>
</tei-text>
`;

const teiWithSectionsNChapters = `
<tei-text data-xmlns="http://www.tei-c.org/ns/1.0" xml:lang="och" lang="och" type="book" data-origname="text" data-origatts="xmlns xml:lang type" data-processed="">
  <tei-body xml:id="b.3" id="b.3" n="guangzi_2" data-origname="body" data-origatts="xml:id n" data-processed="">
    <tei-div type="section" n="1" xml:id="c.10" id="c.10" data-origname="div" data-origatts="type n xml:id" data-processed="">
      <tei-div type="chapter" n="1" data-origname="div" data-origatts="type n" data-processed="" class="">
      </tei-div>
      <tei-div type="chapter" n="2" data-origname="div" data-origatts="type n" data-processed="" class="">
      </tei-div>
    </tei-div>
    <tei-div type="section" n="2" xml:id="c.20" id="c.20" data-origname="div" data-origatts="type n xml:id" data-processed="">
      <tei-div type="chapter" n="prosa" data-origname="div" data-origatts="type n" data-processed="" class="">
      </tei-div>
  </tei-div>
  </tei-body>
</tei-text>
`;

const teiWithSubsectionsNSubchapters = `
<tei-text data-xmlns="http://www.tei-c.org/ns/1.0" xml:lang="och" lang="och" type="book" data-origname="text" data-origatts="xmlns xml:lang type" data-processed="">
  <tei-body xml:id="b.3" id="b.3" n="guangzi_2" data-origname="body" data-origatts="xml:id n" data-processed="">
    <tei-div type="subsection" n="1" xml:id="c.10" id="c.10" data-origname="div" data-origatts="type n xml:id" data-processed="">
      <tei-div type="subchapter" n="1" data-origname="div" data-origatts="type n" data-processed="" class="">
      </tei-div>
      <tei-div type="subchapter" n="2" data-origname="div" data-origatts="type n" data-processed="" class="">
      </tei-div>
    </tei-div>
    <tei-div type="subsection" n="2" xml:id="c.20" id="c.20" data-origname="div" data-origatts="type n xml:id" data-processed="">
      <tei-div type="subchapter" n="prosa" data-origname="div" data-origatts="type n" data-processed="" class="">
      </tei-div>
  </tei-div>
  </tei-body>
</tei-text>
`;

describe('naviation.initializeNavigation()', () => {
  beforeAll(() => {
    // mocking the projectspecific division types so the test works independetly
    // from project setups
    jest.replaceProperty(projectspecific.POSSIBLE_DIVISION_TYPES, 'top', ['chapter', 'section']);
    jest.replaceProperty(projectspecific.POSSIBLE_DIVISION_TYPES, 'low', ['chapter', 'section', 'subsection']);
  });

  afterAll(() => {
    // restore replaced property
    jest.restoreAllMocks();
  });

  it('initializes the navBar for a text with only one divsion, so no navigation bar is needed', () => {
    const $body = document.createElement('div');
    $body.innerHTML = defaultNavBar + teiWithUnknownDivtype;
    const $navBar = $body.querySelector('#textNavBar');
    const $navBarLow = $body.querySelector('#textNavBar');
    const $text = $body.querySelector('tei-text');
    initializeNavigation($navBar, $navBarLow, $text);
    expect($navBar.classList.contains('d-none')).toBe(true);
  });
  it('initializes the navBar for a text with multiple sections as divisions', () => {
    const $body = document.createElement('div');
    $body.innerHTML = defaultNavBar + teiWithSections;
    const $navBar = $body.querySelector('#textNavBar');
    const $navBarLow = $body.querySelector('#textNavBarLow');
    const $text = $body.querySelector('tei-text');
    const $prevButton = $navBar.querySelector('#prevChaptButton');
    const $nextButton = $navBar.querySelector('#nextChaptButton');
    const $gotoButton = $navBar.querySelector('#goToChaptButton');
    const $chapterSelect = $navBar.querySelector('#chapterSelect');
    const $showAllButton = $navBar.querySelector('#toggleShowAllButton');
    initializeNavigation($navBar, $navBarLow, $text);
    expect($navBar.classList.contains('d-none')).toBe(false);
    expect($prevButton.disabled).toBe(true);
    expect($nextButton.disabled).toBe(false);
    expect($gotoButton.innerHTML).toStrictEqual('Go to section');
    expect($showAllButton.innerHTML).toStrictEqual('Show all sections');
    expect($chapterSelect.children.length).toBe(2);
  });

  it(`initializes the navBar for a text with multiple sections as divisions
     and chapters as low-level divisions`, () => {
    const $body = document.createElement('div');
    $body.innerHTML = defaultNavBar + teiWithSectionsNChapters;
    const $navBar = $body.querySelector('#textNavBar');
    const $navBarLow = $body.querySelector('#textNavBarLow');
    const $text = $body.querySelector('tei-text');

    const $prevButton = $navBar.querySelector('#prevChaptButton');
    const $nextButton = $navBar.querySelector('#nextChaptButton');
    const $gotoButton = $navBar.querySelector('#goToChaptButton');
    const $chapterSelect = $navBar.querySelector('#chapterSelect');
    const $showAllButton = $navBar.querySelector('#toggleShowAllButton');

    const $prevButtonLow = $navBarLow.querySelector('#prevChaptButtonLow');
    const $nextButtonLow = $navBarLow.querySelector('#nextChaptButtonLow');
    const $gotoButtonLow = $navBarLow.querySelector('#goToChaptButtonLow');
    const $chapterSelectLow = $navBarLow.querySelector('#chapterSelectLow');
    const $showAllButtonLow = $navBarLow.querySelector('#toggleShowAllButtonLow');

    initializeNavigation($navBar, $navBarLow, $text);

    expect($navBar.classList.contains('d-none')).toBe(false);
    expect($prevButton.disabled).toBe(true);
    expect($nextButton.disabled).toBe(false);
    expect($gotoButton.innerHTML).toStrictEqual('Go to section');
    expect($showAllButton.innerHTML).toStrictEqual('Show all sections');
    expect($chapterSelect.children.length).toBe(2);

    expect($navBarLow.classList.contains('d-none')).toBe(false);
    expect($prevButtonLow.disabled).toBe(true);
    expect($nextButtonLow.disabled).toBe(false);
    expect($gotoButtonLow.innerHTML).toStrictEqual('Go to chapter');
    expect($showAllButtonLow.innerHTML).toStrictEqual('Show all chapters');
    expect($chapterSelectLow.children.length).toBe(2);
  });
});

describe('navigation.navigateToAnnotation()', () => {
  it('shows the annotationCard for the preselected annotation', async () => {
    document.body.innerHTML = `<div id="annotationCard" class="invisible"></div>`;
    jest.spyOn(annotationCard, 'selectAnnotation').mockReturnValue(true);
    const $annotationCard = document.getElementById('annotationCard');
    await navigateToAnnotation('annoId', null);
    expect(window.SELECTED_ANNOTATION).toBe(true);
    expect($annotationCard.classList.contains('invisible')).toBe(false);
  });
});

describe('navigation.getDivisionTypes()', () => {
  it('yields "default" when no known text part type is present', () => {
    const $text = document.createElement('div');
    $text.innerHTML = teiWithUnknownDivtype;
    const topDivisions = ['chapter'];
    const lowDivisions = ['subchapter'];
    const divType = getDivisionTypes($text, topDivisions, lowDivisions);
    expect(divType).toStrictEqual(['default', 'default']);
  });

  it('can identify "chapter" top-level text part type', () => {
    const $text = document.createElement('div');
    $text.innerHTML = teiWithChapters;
    const topDivisions = ['chapter'];
    const lowDivisions = ['subchapter'];
    const divType = getDivisionTypes($text, topDivisions, lowDivisions);
    expect(divType).toStrictEqual(['chapter', 'default']);
  });

  it('can identify "chapter" top-level text part type (no low-level text parts given as options)', () => {
    const $text = document.createElement('div');
    $text.innerHTML = teiWithChapters;
    const topDivisions = ['chapter'];
    const lowDivisions = [];
    const divType = getDivisionTypes($text, topDivisions, lowDivisions);
    expect(divType).toStrictEqual(['chapter', 'default']);
  });

  it('can identify "section" top-level text part type', () => {
    const $text = document.createElement('div');
    $text.innerHTML = teiWithSections;
    const topDivisions = ['section'];
    const lowDivisions = ['subchapter'];
    const divType = getDivisionTypes($text, topDivisions, lowDivisions);
    expect(divType).toStrictEqual(['section', 'default']);
  });

  it(`can identify "chapter" top-level text part type when others are given as well, 
    but the low-level text part type doesn't match`, () => {
    const $text = document.createElement('div');
    $text.innerHTML = teiWithChaptersNSections;
    const topDivisions = ['chapter', 'section'];
    const lowDivisions = ['subchapter'];
    const divType = getDivisionTypes($text, topDivisions, lowDivisions);
    expect(divType).toStrictEqual(['chapter', 'default']);
  });

  it(`can identify "chapter" as a top-level text part type as no top-level type is available
    and it is only listed as a low-level text part type`, () => {
    const $text = document.createElement('div');
    $text.innerHTML = teiWithChapters;
    const topDivisions = ['section'];
    const lowDivisions = ['chapter'];
    const divType = getDivisionTypes($text, topDivisions, lowDivisions);
    expect(divType).toStrictEqual(['chapter', 'default']);
  });

  describe('it can properly distinguish top- and low-level text part types', () => {
    it('can identify "chapter" top-level text part type when low-level text parts are present as well', () => {
      const $text = document.createElement('div');
      $text.innerHTML = teiWithChaptersNSections;
      const topDivisions = ['chapter'];
      const lowDivisions = ['section'];
      const divType = getDivisionTypes($text, topDivisions, lowDivisions);
      expect(divType).toStrictEqual(['chapter', 'section']);
    });

    it('can identify "chapter" top-level text part type when other top-level text parts are given as well', () => {
      const $text = document.createElement('div');
      $text.innerHTML = teiWithChaptersNSections;
      const topDivisions = ['chapter', 'section'];
      const lowDivisions = ['section'];
      const divType = getDivisionTypes($text, topDivisions, lowDivisions);
      expect(divType).toStrictEqual(['chapter', 'section']);
    });

    it('can identify "chapter" top-level text part type when other top-level text parts are given as well', () => {
      const $text = document.createElement('div');
      $text.innerHTML = teiWithChaptersNSections;
      const topDivisions = ['section', 'chapter'];
      const lowDivisions = ['section'];
      const divType = getDivisionTypes($text, topDivisions, lowDivisions);
      expect(divType).toStrictEqual(['chapter', 'section']);
    });

    it('can identify top- and low-level text part type, if only low-level types are present', () => {
      const $text = document.createElement('div');
      $text.innerHTML = teiWithSubsectionsNSubchapters;
      const topDivisions = ['section', 'chapter'];
      const lowDivisions = ['subsection', 'subchapter'];
      const divType = getDivisionTypes($text, topDivisions, lowDivisions);
      expect(divType).toStrictEqual(['subsection', 'subchapter']);
    });
  });
});

describe('navigation.getDivisionLabel()', () => {
  it('retrieves correct text part label', () => {
    const $container = document.createElement('div');
    $container.innerHTML = '<tei-div type="section" n="1" xml:id="c.10" id="c.10"><tei-p>Test</tei-p></tei-div>';
    const label = getDivisionLabel($container.firstChild);
    expect(label).toBe('1');
  });
});

describe('navigation.getTargetDivision()', () => {
  it('finds correct existing target section', () => {
    const $container = document.createElement('div');
    $container.innerHTML = teiWithSections;
    const $element = $container.querySelector('#w\\.2823');
    const targetDivision = getTargetDivision($element, 'section');
    expect(targetDivision).toBeDefined();
    expect(targetDivision.id).toBe('c.20');
  });
  it("didn't get a correct parameter (targetElement)", () => {
    const $container = document.createElement('div');
    $container.innerHTML = teiWithSections;
    const targetDivision = getTargetDivision(undefined, 'section');
    expect(targetDivision).toBeUndefined();
  });
});

describe('navigation.selectDivision()', () => {
  it('shows only section "2"', () => {
    const $container = document.createElement('div');
    $container.innerHTML = teiWithSections;
    const divisionType = 'section';
    const $divisions = $container.querySelectorAll('tei-div[type="' + divisionType + '"]');
    selectDivision('2', $divisions);
    expect($divisions[0].classList.contains('d-none')).toBe(true);
    expect($divisions[1].classList.contains('d-none')).toBe(false);
  });
});

describe('navigation.getTargetElement()', () => {
  it('returns the desired element', () => {
    const $container = document.createElement('div');
    $container.innerHTML = teiWithSections;
    const result = getTargetElement('w.2721', $container);
    expect(result.innerHTML).toStrictEqual('術');
  });
});

describe('navigation.updateButtons()', () => {
  const divisionType = 'chapter';
  const divisionLabels = ['1', '2', '3'];
  const $container = document.createElement('div');
  $container.innerHTML = defaultNavBar;
  const $navBar = $container.querySelector('#textNavBar');
  const $prevButton = $navBar.querySelector('#prevChaptButton');
  const $nextButton = $navBar.querySelector('#nextChaptButton');
  const $chapterSelect = $navBar.querySelector('#chapterSelect');
  const $showAllButton = $navBar.querySelector('#toggleShowAllButton');
  // manually "initializing" the select element by adding option elements
  divisionLabels.map(createOption).forEach((option) => $chapterSelect.appendChild(option));

  describe('first page load', () => {
    const showAllDivisions = false;
    it('disables the previous chapter button as the first chapter is shown', () => {
      const selectedChapter = divisionLabels[0];

      updateButtons(
        divisionType,
        selectedChapter,
        showAllDivisions,
        divisionLabels,
        $prevButton,
        $nextButton,
        $chapterSelect,
        $showAllButton,
      );
      expect($prevButton.disabled).toBe(true);
      expect($nextButton.disabled).toBe(false);
      expect($chapterSelect.value).toStrictEqual(selectedChapter);
      expect($showAllButton.innerHTML).toStrictEqual('Show all chapters');
    });

    it('enablse both the previous and next chapter button as a chapter in the middle is shown', () => {
      const selectedChapter = divisionLabels[1];

      updateButtons(
        divisionType,
        selectedChapter,
        showAllDivisions,
        divisionLabels,
        $prevButton,
        $nextButton,
        $chapterSelect,
        $showAllButton,
      );
      expect($prevButton.disabled).toBe(false);
      expect($nextButton.disabled).toBe(false);
      expect($showAllButton.innerHTML).toStrictEqual('Show all chapters');
    });

    it('disables the next chapter button as the last chapter is shown', () => {
      const selectedChapter = divisionLabels[2];

      updateButtons(
        divisionType,
        selectedChapter,
        showAllDivisions,
        divisionLabels,
        $prevButton,
        $nextButton,
        $chapterSelect,
        $showAllButton,
      );

      expect($prevButton.disabled).toBe(false);
      expect($nextButton.disabled).toBe(true);
      expect($showAllButton.innerHTML).toStrictEqual('Show all chapters');
    });
  });

  describe('navigating the text after the initial page load', () => {
    const showAllDivisions = false;
    it('navigates from first to second chapter and enables the previous chapter button', () => {
      $prevButton.disabled = true;
      $chapterSelect.value = '2';
      const selectedChapter = divisionLabels[1];

      updateButtons(
        divisionType,
        selectedChapter,
        showAllDivisions,
        divisionLabels,
        $prevButton,
        $nextButton,
        $chapterSelect,
        $showAllButton,
      );
      expect($prevButton.disabled).toBe(false);
      expect($nextButton.disabled).toBe(false);
      expect($chapterSelect.value).toStrictEqual(selectedChapter);
      expect($showAllButton.innerHTML).toStrictEqual('Show all chapters');
    });

    it('navigates from second to first chapter and disables the previous chapter button', () => {
      $chapterSelect.value = '2';
      const selectedChapter = divisionLabels[0];

      updateButtons(
        divisionType,
        selectedChapter,
        showAllDivisions,
        divisionLabels,
        $prevButton,
        $nextButton,
        $chapterSelect,
        $showAllButton,
      );
      expect($prevButton.disabled).toBe(true);
      expect($nextButton.disabled).toBe(false);
      expect($chapterSelect.value).toStrictEqual(selectedChapter);
      expect($showAllButton.innerHTML).toStrictEqual('Show all chapters');
    });

    it('navigates from second to last chapter and disables the previous chapter button', () => {
      $chapterSelect.value = '2';
      const selectedChapter = divisionLabels[2];

      updateButtons(
        divisionType,
        selectedChapter,
        showAllDivisions,
        divisionLabels,
        $prevButton,
        $nextButton,
        $chapterSelect,
        $showAllButton,
      );
      expect($prevButton.disabled).toBe(false);
      expect($nextButton.disabled).toBe(true);
      expect($chapterSelect.value).toStrictEqual(selectedChapter);
      expect($showAllButton.innerHTML).toStrictEqual('Show all chapters');
    });
  });

  describe('showing all chapters or only one', () => {
    it('shows all chapters when previously the second chapter was shown', () => {
      const showAllDivisions = true;
      $chapterSelect.value = '2';
      const selectedChapter = divisionLabels[1];

      updateButtons(
        divisionType,
        selectedChapter,
        showAllDivisions,
        divisionLabels,
        $prevButton,
        $nextButton,
        $chapterSelect,
        $showAllButton,
      );
      expect($prevButton.disabled).toBe(true);
      expect($nextButton.disabled).toBe(true);
      expect($chapterSelect.value).toStrictEqual(selectedChapter);
      expect($showAllButton.innerHTML).toStrictEqual('Show only chapter 2');
    });

    it('shows only chapter 2 when previously all chapters were shown', () => {
      const showAllDivisions = false;
      const selectedChapter = divisionLabels[1];

      updateButtons(
        divisionType,
        selectedChapter,
        showAllDivisions,
        divisionLabels,
        $prevButton,
        $nextButton,
        $chapterSelect,
        $showAllButton,
      );
      expect($prevButton.disabled).toBe(false);
      expect($nextButton.disabled).toBe(false);
      expect($chapterSelect.value).toStrictEqual(selectedChapter);
      expect($showAllButton.innerHTML).toStrictEqual('Show all chapters');
    });
  });
});
