import { toggleSidebar } from './sidebar';

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

  it('expands text elements', () => {
    toggleSidebar($sidebar);
    const allExpanded = [...$sidebar.querySelectorAll('.features-item-text')].every(($elem) => {
      return !$elem.classList.contains('annocollapse');
    });
    expect(allExpanded).toBe(true);
  });
});

describe('in an expanded sidebar', () => {
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
