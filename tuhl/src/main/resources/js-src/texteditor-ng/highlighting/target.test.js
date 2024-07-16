import { defaultHighlighting, removeStyles, highlightSelectedAnnotationsTarget, updateDisplay } from '.';
import * as data from '../data/annotations';

describe('removing all css classes relevant for highlighting a target', () => {
  it('removes relevant classes from an element with only one child', () => {
    const $parent = document.createElement('div');
    $parent.innerHTML = `<div id="childA" class="a b c"></div>`;
    const relevantClasses = ['a', 'b'];
    const $element = $parent.querySelector('#childA');
    removeStyles($parent, relevantClasses);

    expect($element.classList.contains('a')).toBe(false);
    expect($element.classList.contains('b')).toBe(false);
    expect($element.classList.contains('c')).toBe(true);
  });

  it('removes relevant classes from an element with multiple children', () => {
    const $parent = document.createElement('div');
    $parent.innerHTML = `<div id="childA" class="a b c"></div><div id="childB" class="a d e"></div>`;
    const relevantClasses = ['a', 'b'];
    const $childA = $parent.querySelector('#childA');
    const $childB = $parent.querySelector('#childB');
    removeStyles($parent, relevantClasses);

    expect($childA.classList.contains('a')).toBe(false);
    expect($childA.classList.contains('b')).toBe(false);
    expect($childA.classList.contains('c')).toBe(true);

    expect($childB.classList.contains('a')).toBe(false);
    expect($childB.classList.contains('d')).toBe(true);
    expect($childB.classList.contains('e')).toBe(true);
  });
});

describe('highlighting elements targeted by an annotation in the default way', () => {
  it('assigns the "defaulthighlight" class to elements targeted by an annotation', () => {
    document.body.innerHTML = `<div id="w.1"></div><div id="w.2"></div><div id="w.3"></div>`;
    const annotation = { svg: ['id("w.1")', 'id("w.2")'] };
    const $element1 = document.getElementById('w.1');
    const $element2 = document.getElementById('w.2');
    const $element3 = document.getElementById('w.3');

    defaultHighlighting(annotation);

    expect($element1.classList.contains('defaulthighlight')).toBe(true);
    expect($element2.classList.contains('defaulthighlight')).toBe(true);
    expect($element3.classList.contains('defaulthighlight')).toBe(false);
  });
});

describe('highlighting elements targeted by an annotation, which got selected by a user', () => {
  it('assigns the "selected" class to elements targeted by an annotation, which got selected by a user', () => {
    document.body.innerHTML = `
    <div id="text"><div id="w.1"></div><div id="w.2"></div><div id="w.3"  class="selected"></div></div>`;
    const $text = document.getElementById('text');
    const annotation = {
      targets: [
        {
          selector: {
            xPath: 'id("w.1")',
          },
        },
        {
          selector: {
            xPath: 'id("w.2")',
          },
        },
      ],
    };
    const $element1 = document.getElementById('w.1');
    const $element2 = document.getElementById('w.2');
    const $element3 = document.getElementById('w.3');

    highlightSelectedAnnotationsTarget(annotation, $text);

    expect($element1.classList.contains('selected')).toBe(true);
    expect($element2.classList.contains('selected')).toBe(true);
    expect($element3.classList.contains('selected')).toBe(false);
  });
});

describe('updating the display by rendering the current annotations', () => {
  beforeEach(() => {
    window.ANNOJSON = undefined;
    jest.clearAllMocks();
  });
  it('successfully updates the display and store the current annotations in a variable', async () => {
    document.body.innerHTML = `<div id="table"></div><div id="TEI"><div id="w.1"></div><div id="w.2"></div><div id="w.3"></div>
      <div id="w.4"></div><div id="w.5" class="defaulthighlight"></div></div>`;
    const mockAnnoJson = [
      { id: '1', svg: ['id("w.1")', 'id("w.2")'], color: 'none' },
      { id: '2', svg: ['id("w.3")', 'id("w.4")'], color: 'none' },
    ];
    // mocking an inner funciton call, which does a network request, to be called successfully
    // and return the data
    jest.spyOn(data, 'getAllAnnotationsData').mockReturnValue(mockAnnoJson);

    await updateDisplay({});
    expect(window.ANNOJSON).toStrictEqual(mockAnnoJson);
    expect(document.getElementById('w.1').classList.contains('defaulthighlight')).toBe(true);
    expect(document.getElementById('w.2').classList.contains('defaulthighlight')).toBe(true);
    expect(document.getElementById('w.3').classList.contains('defaulthighlight')).toBe(true);
    expect(document.getElementById('w.4').classList.contains('defaulthighlight')).toBe(true);
    expect(document.getElementById('w.5').classList.contains('defaulthighlight')).toBe(false);
  });
  it('fails on updating the display', () => {
    // mocking an inner funciton call, which does a network request, to be called unsuccessfully
    // and to throw an error, which gets handled
    jest.spyOn(data, 'getAllAnnotationsData').mockReturnValue(new Error());
    updateDisplay({});
    expect(window.ANNOJSON).toStrictEqual(undefined);
  });
});
