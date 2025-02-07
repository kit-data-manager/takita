import {
  encodeAnnoId,
  setDisplay,
  toggleBoxIcon,
  toggleButtonState,
  toggleExpand,
  toggleOpacity,
  toggleVisibility,
} from '.';

describe('encoding the id of an annotation', () => {
  it('encodes the id of an annotation twice', () => {
    let annoId = 'https://server.com:9999/wap/test/takita/f0569811c51f';
    const result = encodeAnnoId(annoId);
    expect(result).toBe('https%253A%252F%252Fserver.com%253A9999%252Fwap%252Ftest%252Ftakita%252Ff0569811c51f');
  });
});

describe('adding/removing css classes for box icons', () => {
  it('adds a css class and removes one from an element', () => {
    const $element = document.createElement('div');
    $element.classList.add('toRemove');
    toggleBoxIcon($element, 'toRemove', 'toAdd');
    expect($element.classList.contains('toRemove')).toBe(false);
    expect($element.classList.contains('toAdd')).toBe(true);
  });
});

describe('adding css class to set the opacity of element(s) to zero', () => {
  it('sets the opacity to zero for one element', () => {
    const $element = document.createElement('div');
    toggleOpacity($element);
    expect($element.classList.contains('zeroOpacity')).toBe(true);
  });
  it('sets the opacity to not zero for one element', () => {
    const $element = document.createElement('div');
    $element.classList.add('zeroOpacity');
    toggleOpacity($element);
    expect($element.classList.contains('zeroOpacity')).toBe(false);
  });
  it('toggles the opacity of multiple elements', () => {
    document.body.innerHTML = `<div id="w.1"></div><div id="w.2"></div><div class="zeroOpacity" id="w.3"></div>`;
    const $elements = document.querySelectorAll('div');
    toggleOpacity($elements);
    expect($elements[0].classList.contains('zeroOpacity')).toBe(true);
    expect($elements[1].classList.contains('zeroOpacity')).toBe(true);
    expect($elements[2].classList.contains('zeroOpacity')).toBe(false);
  });
});

describe('showing/hiding an element and activate/deactivate a corresponding button by manipulating css classes', () => {
  let $element;
  let $button;
  let $buttonparent;

  beforeEach(() => {
    $element = document.createElement('div');
    $button = document.createElement('div');
    $buttonparent = document.createElement('div');
    $buttonparent.appendChild($button);
  });
  it('shows an element', () => {
    $element.classList.add('invisible');
    toggleVisibility($element);
    expect($element.classList.contains('invisible')).toBe(false);
  });
  it('hides an element', () => {
    toggleVisibility($element);
    expect($element.classList.contains('invisible')).toBe(true);
  });
  it('shows an element and activates a button', () => {
    $element.classList.add('invisible');
    // mocking element.scrollIntoView
    $element.scrollIntoView = jest.fn();
    toggleVisibility($element, $button);
    expect($element.classList.contains('invisible')).toBe(false);
    expect($buttonparent.classList.contains('active')).toBe(true);
    expect($element.scrollIntoView).toHaveBeenCalled();
  });
  it('hides an element and deactivates a button', () => {
    $button.classList.add('active');
    toggleVisibility($element, $button);
    expect($element.classList.contains('invisible')).toBe(true);
    expect($buttonparent.classList.contains('active')).toBe(false);
  });
});

describe('adding/removing css class to hide/show an element or a list of elements', () => {
  it('hides an element', () => {
    const $element = document.createElement('div');
    setDisplay($element, false);
    expect($element.classList.contains('d-none')).toBe(true);
  });
  it('shows an element', () => {
    const $element = document.createElement('div');
    $element.classList.add('d-none');
    setDisplay($element, true);
    expect($element.classList.contains('d-none')).toBe(false);
  });
  it('hides multiple elements', () => {
    document.body.innerHTML = `<div id="w.1"></div><div id="w.2"></div><div id="w.3"></div>`;
    const $elements = document.querySelectorAll('div');
    setDisplay($elements, false);
    expect($elements[0].classList.contains('d-none')).toBe(true);
    expect($elements[1].classList.contains('d-none')).toBe(true);
    expect($elements[2].classList.contains('d-none')).toBe(true);
  });
  it('shows multiple elements', () => {
    document.body.innerHTML = `
      <div class="d-none" id="w.1"></div>
      <div class="d-none" id="w.2"></div>
      <div class="d-none" id="w.3"></div>`;
    const $elements = document.querySelectorAll('div');
    setDisplay($elements, true);
    expect($elements[0].classList.contains('d-none')).toBe(false);
    expect($elements[1].classList.contains('d-none')).toBe(false);
    expect($elements[2].classList.contains('d-none')).toBe(false);
  });
});

describe('showing/hiding and enabling/disabling a button', () => {
  it('shows and enables a button', () => {
    document.body.innerHTML = `<div class="d-none" id="w.1"></div>`;
    const $button = document.getElementById('w.1');
    $button.disabled = true;
    toggleButtonState($button);
    expect($button.classList.contains('d-none')).toBe(false);
    expect($button.disabled).toBe(false);
  });
  it('hides and disables a button', () => {
    document.body.innerHTML = `<div id="w.1"></div>`;
    const $button = document.getElementById('w.1');
    toggleButtonState($button);
    expect($button.classList.contains('d-none')).toBe(true);
    expect($button.disabled).toBe(true);
  });
});

describe('showing/hiding an element and the corresponding icon', () => {
  it('shows an element and the "arrow to the left" icon', () => {
    document.body.innerHTML = `<div class="collapse" id="w.a"></div><div id="icon" class="bx-chevron-right"></div>`;
    const $element = document.getElementById('w.a');
    const $icon = document.getElementById('icon');
    toggleExpand($element, $icon);
    expect($element.classList.contains('collapse')).toBe(false);
    expect($icon.classList.contains('bx-chevron-right')).toBe(false);
    expect($icon.classList.contains('bx-chevron-down')).toBe(true);
  });
  it('hides an element and display the "arrow to the right" icon', () => {
    document.body.innerHTML = `<div id="w.1"></div><div id="icon" class="bx-chevron-down"></div>`;
    const $element = document.getElementById('w.1');
    const $icon = document.getElementById('icon');
    toggleExpand($element, $icon);
    expect($element.classList.contains('collapse')).toBe(true);
    expect($icon.classList.contains('bx-chevron-right')).toBe(true);
    expect($icon.classList.contains('bx-chevron-down')).toBe(false);
  });
});
