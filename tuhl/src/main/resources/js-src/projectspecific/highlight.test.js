import { assignStyle, checkIsATargetAlreadyHighlighted, crc1475Highlighting } from './highlight';

describe('getting the selected text of an annotation and storing it in a window.VARIABLE', () => {
  it('checks the target of an annotation where one word is already highlgighted', () => {
    document.body.innerHTML = `
    <div id="text"><div id="w.1"></div><div id="w.2"></div><div id="w.3" class="underline"></div></div>`;
    // wrapping the ids in " to match the ids created by tAkita
    const targets = ['"w.1"', '"w.2"', '"w.3"'];
    const alreadyHighlighted = checkIsATargetAlreadyHighlighted(targets);
    expect(alreadyHighlighted).toBe(true);
  });

  it('checks the target of an annotation where nothing highlgighted', () => {
    document.body.innerHTML = `
    <div id="text"><div id="w.1"></div><div id="w.2"></div><div id="w.3"></div></div>`;
    // wrapping the ids in " to match the ids created by tAkita
    const targets = ['"w.1"', '"w.2"', '"w.3"'];
    const alreadyHighlighted = checkIsATargetAlreadyHighlighted(targets);
    expect(alreadyHighlighted).toBe(false);
  });
});

describe('assigning css clasess for highlighting to an element to highlight it', () => {
  describe('highlighting metaphor annotations', () => {
    it('assigns a css class to an element, holding no css class relevant for highlighting already', () => {
      document.body.innerHTML = `
          <div id="text"><div id="w.1"></div><div id="w.2"></div> <div id="w.3"></div></div>`;
      const $ele = document.getElementById('w.2');
      assignStyle($ele, { color: '#000021', svg: [1, 2] }, 0, false);
      expect($ele.classList.contains('underline')).toBe(true);
      expect($ele.classList.contains('underlineSecond')).toBe(false);
    });

    it('assigns a css class to an element, holding one css class relevant for highlighting already', () => {
      document.body.innerHTML = `
      <div id="text"><div id="w.1"></div><div id="w.2" class="underline"></div> <div id="w.3"></div></div>`;
      const $ele = document.getElementById('w.2');
      assignStyle($ele, { color: '#000021', svg: [1, 2] }, 0, true);
      expect($ele.classList.contains('underline')).toBe(true);
      expect($ele.classList.contains('underlineSecond')).toBe(true);
    });

    it('assigns a css class to an element, which is not followed by whitespace', () => {
      document.body.innerHTML = `
            <div id="text"><div id="w.1"></div><div id="w.2"></div>asd<div id="w.3"></div></div>`;
      const $ele = document.getElementById('w.2');
      assignStyle($ele, { color: '#000021', svg: [1, 2] }, 0, false);
      expect($ele.classList.contains('whitespaceAfter')).toBe(false);
    });

    it('assigns a css class to an element, which is not followed by whitespace', () => {
      document.body.innerHTML = `
      <div id="text"><div id="w.1"></div><div id="w.2" class="underline"></div>asd<div id="w.3"></div></div>`;
      const $ele = document.getElementById('w.2');
      assignStyle($ele, { color: '#000021', svg: [1, 2] }, 0, true);
      expect($ele.classList.contains('whitespaceAfter')).toBe(false);
    });

    it('assigns a css class to an element, which is the last element and thereby not followed by whitespace', () => {
      document.body.innerHTML = `
        <div id="text"><div id="w.1"></div><div id="w.2" class="underline"></div>asd<div id="w.3"></div></div>`;
      const $ele = document.getElementById('text');
      assignStyle($ele, { color: '#000021', svg: [1, 2] }, 0, true);
      expect($ele.classList.contains('whitespaceAfter')).toBe(false);
    });
  });

  describe('highlighting mrw annotaitons', () => {
    it('assigns a css class to an element for single target annotations', () => {
      document.body.innerHTML = `
      <div id="text"><div id="w.1"></div><div id="w.2" class="underline"></div><div id="w.3"></div></div>`;
      const $ele = document.getElementById('w.2');
      assignStyle($ele, { color: '#000011', svg: [1, 2] }, 0, true);
      expect($ele.classList.contains('backgroundOne')).toBe(true);
    });

    it('assigns a css class to an element for single target annotations', () => {
      document.body.innerHTML = `
        <div id="text"><div id="w.1"></div><div id="w.2" class="underline"></div><div id="w.3"></div></div>`;
      const $ele = document.getElementById('w.2');
      assignStyle($ele, { color: '#000012', svg: [1, 2] }, 0, true);
      expect($ele.classList.contains('backgroundOne')).toBe(true);
    });

    it('assigns a css class to an element for single target annotations', () => {
      document.body.innerHTML = `
        <div id="text"><div id="w.1"></div><div id="w.2" class="underline"></div><div id="w.3"></div></div>`;
      const $ele = document.getElementById('w.2');
      assignStyle($ele, { color: '#000013', svg: [1, 2] }, 0, true);
      expect($ele.classList.contains('backgroundOne')).toBe(true);
    });

    it('assigns a css class to an element for single target annotations', () => {
      document.body.innerHTML = `
      <div id="text"><div id="w.1"></div><div id="w.2" class="underline"></div><div id="w.3"></div></div>`;
      const $ele = document.getElementById('w.2');
      assignStyle($ele, { color: '#000014', svg: [1, 2] }, 0, true);
      expect($ele.classList.contains('backgroundTwo')).toBe(true);
    });

    it('assigns a css class to an element for single target annotations', () => {
      document.body.innerHTML = `
      <div id="text"><div id="w.1"></div><div id="w.2" class="underline"></div><div id="w.3"></div></div>`;
      const $ele = document.getElementById('w.2');
      assignStyle($ele, { color: '#000014', svg: [1, 2] }, 0, true);
      expect($ele.classList.contains('backgroundTwo')).toBe(true);
    });
  });

  describe('default highlight', () => {
    it('assigns a css class to an element for single target annotations', () => {
      document.body.innerHTML = `
      <div id="text"><div id="w.1"></div><div id="w.2" class="underline"></div><div id="w.3"></div></div>`;
      const $ele = document.getElementById('w.2');
      assignStyle($ele, { color: '#000232', svg: [1, 2] }, 0, true);
      expect($ele.classList.contains('defaulthighlight')).toBe(true);
    });
  });
});

describe('highlighting words targetted by an annotation for CRC1475', () => {
  it('assigns a default highlight as the annotation has no color', () => {
    document.body.innerHTML = `
      <div id="text"><div id="w.1"></div><div id="w.2" class="underline"></div><div id="w.3"></div></div>`;
    // wrapping the ids in " to match the ids created by tAkita
    crc1475Highlighting({ svg: ['"w.1"', '"w.2"', '"w.3"'] });
    const $ele1 = document.getElementById('w.1');
    const $ele2 = document.getElementById('w.2');
    const $ele3 = document.getElementById('w.3');
    expect($ele1.classList.contains('defaulthighlight')).toBe(true);
    expect($ele2.classList.contains('defaulthighlight')).toBe(true);
    expect($ele3.classList.contains('defaulthighlight')).toBe(true);
  });
  it("assigns a default highlight as the annotations color doesn't fit the available colors", () => {
    document.body.innerHTML = `
      <div id="text"><div id="w.1"></div><div id="w.2" class="underline"></div><div id="w.3"></div></div>`;
    // wrapping the ids in " to match the ids created by tAkita
    crc1475Highlighting({ color: '#000232', svg: ['"w.1"', '"w.2"', '"w.3"'] });
    const $ele1 = document.getElementById('w.1');
    const $ele2 = document.getElementById('w.2');
    const $ele3 = document.getElementById('w.3');
    expect($ele1.classList.contains('defaulthighlight')).toBe(true);
    expect($ele2.classList.contains('defaulthighlight')).toBe(true);
    expect($ele3.classList.contains('defaulthighlight')).toBe(true);
  });
});
