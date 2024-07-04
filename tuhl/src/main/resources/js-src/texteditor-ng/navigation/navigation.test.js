import { createOption } from '../../common/utils';
import {
  getTargetDivision,
  selectDivision,
  getDivisionType,
  getDivisionLabel,
  getTargetElement,
  updateButtons,
  initializeNavigation,
} from './navigation';

const defaultNavBar = `
<div id="textNavBar" class="textNavBar row is-full-width is-hidden">
  <div class="col-1"></div>
  <div class="col-1"><button type="button" id="prevChaptButton">Previous chapter</button></div>
  <div class="col-2">
    <div class="row">
            <div class="col-7">
                <button id="goToChaptButton">Go to chapter:</button>
            </div>
            <select class="col-5" id="chapterSelect">
            </select>
    </div>
  </div>
  <div class="col-1"><button type="button" id="nextChaptButton">Next chapter</button></div>
  <div class="col-1"><button type="button" id="toggleShowAllButton">Show all</button></div>
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
    <tei-div type="fantasyDivType" n="1" xml:id="c.10" id="c.10" data-origname="div" data-origatts="type n xml:id" data-processed="" class="is-hidden">
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

describe('naviation.initializeNavigation()', () => {
  it('initializes the navBar for a text with only one divsion, so no navigation bar is needed', () => {
    const $body = document.createElement('div');
    $body.innerHTML = defaultNavBar + teiWithUnknownDivtype;
    const $navBar = $body.querySelector('#textNavBar');
    const $text = $body.querySelector('tei-text');
    initializeNavigation($navBar, $text);
    expect($navBar.classList.contains('is-hidden')).toBe(true);
  });
  it('initializes the navBar for a text with multiple sections as divisions', () => {
    const $body = document.createElement('div');
    $body.innerHTML = defaultNavBar + teiWithSections;
    const $navBar = $body.querySelector('#textNavBar');
    const $text = $body.querySelector('tei-text');
    const $prevButton = $navBar.querySelector('#prevChaptButton');
    const $nextButton = $navBar.querySelector('#nextChaptButton');
    const $gotoButton = $navBar.querySelector('#goToChaptButton');
    const $chapterSelect = $navBar.querySelector('#chapterSelect');
    const $showAllButton = $navBar.querySelector('#toggleShowAllButton');
    initializeNavigation($navBar, $text);
    expect($navBar.classList.contains('is-hidden')).toBe(false);
    expect($prevButton.disabled).toBe(true);
    expect($nextButton.disabled).toBe(false);
    expect($gotoButton.innerHTML).toStrictEqual('Go to section');
    expect($showAllButton.innerHTML).toStrictEqual('Show all sections');
    expect($chapterSelect.children.length).toBe(2);
  });
});

describe('navigation.getDivisionType()', () => {
  it('yields "default" when no known text part type is present', () => {
    const $text = document.createElement('div');
    $text.innerHTML = teiWithUnknownDivtype;
    const divType = getDivisionType($text);
    expect(divType).toBe('default');
  });

  it('can identify "chapter" text part type', () => {
    const $text = document.createElement('div');
    $text.innerHTML = teiWithChapters;
    const divType = getDivisionType($text);
    expect(divType).toBe('chapter');
  });

  it('can identify "section" text part type', () => {
    const $text = document.createElement('div');
    $text.innerHTML = teiWithSections;
    const divType = getDivisionType($text);
    expect(divType).toBe('section');
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
    expect($divisions[0].classList.contains('is-hidden')).toBe(true);
    expect($divisions[1].classList.contains('is-hidden')).toBe(false);
  });
});

describe('navigation.getTargetElement()', () => {
  it('returns the desired element', () => {
    const $container = document.createElement('div');
    $container.innerHTML = teiWithSections;
    const result = getTargetElement('w\\.2721', $container);
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
