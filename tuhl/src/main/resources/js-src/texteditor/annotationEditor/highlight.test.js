import '../../common/utils/metadataeditor';
import { fillMetaDataEditorTable } from '../../common/utils';
import { checkIsTargetCompatible, makeTargetsCompatible } from '.';
import { mockAnnoJson } from './examples/annoJsonData';
import { drawAnnos, removeStyles } from './highlight';
import * as highlight from './highlight';

const innerHtml =
  '<body><div id="table"></div><div id="TEI"><tei-lg><tei-l>' +
  '<tei-w xml:id="w.121" class="mrw mflag metaphor metaphorSecond defaulthighlight" id="w.121">Blessed</tei-w> ' +
  '<tei-w xml:id="w.122" id="w.122">[is]</tei-w> <tei-w xml:id="w.123" id="w.123">the</tei-w> ' +
  '<tei-w xml:id="w.124" id="w.124">man</tei-w> <tei-w xml:id="w.125" id="w.125">that</tei-w> ' +
  '<tei-w xml:id="w.126" id="w.126">walketh</tei-w> <tei-w xml:id="w.127" id="w.127">not</tei-w> ' +
  '<tei-w xml:id="w.128" id="w.128">in</tei-w> <tei-w xml:id="w.129" id="w.129">the</tei-w> ' +
  '<tei-w xml:id="w.130" id="w.130">counsel</tei-w> <tei-w xml:id="w.131" id="w.131">of</tei-w> ' +
  '<tei-w xml:id="w.132" id="w.132">the</tei-w> ' +
  '<tei-w xml:id="w.99990" id="w.99990">ungodly</tei-w>' +
  '<tei-pc xml:id="pc.1" id="pc.1">,</tei-pc></tei-l> ' +
  '<tei-l><tei-w xml:id="w.133" id="w.133">nor</tei-w> <tei-w xml:id="w.134" id="w.134">standeth</tei-w> ' +
  '<tei-w xml:id="w.135" id="w.135">in</tei-w> <tei-w xml:id="w.136" id="w.136">the</tei-w> ' +
  '<tei-w xml:id="w.137" id="w.137">way</tei-w> <tei-w xml:id="w.138" id="w.138">of</tei-w> ' +
  '<tei-w xml:id="w.139" id="w.139">sinners,</tei-w> ' +
  '<tei-w xml:id="w.140" id="w.140">nor</tei-w> ' +
  '<tei-w xml:id="w.141" id="w.141">sitteth</tei-w> ' +
  '<tei-w xml:id="w.142" id="w.142">in</tei-w> ' +
  '<tei-w xml:id="w.143" id="w.143">the</tei-w> <tei-w xml:id="w.99991" id="w.99991">seat</tei-w> ' +
  '<tei-w xml:id="w.144" id="w.144">of</tei-w> <tei-w xml:id="w.145" id="w.145">the</tei-w> ' +
  '<tei-w xml:id="w.146" id="w.146">scornful</tei-w><tei-pc xml:id="pc.2" id="pc.2">.</tei-pc>' +
  '</tei-l></tei-lg></div><body>';

describe('checking if a target is compatible with tAkita', () => {
  it('checks compatible annotations that are part of the annoJson and have a substring selector', () => {
    const annotation = {
      svg: ['substring(id("w.206"),  2,  4)', 'id("w.207")', 'id("w.208")', 'id("w.209")'],
    };
    const result = checkIsTargetCompatible(annotation);
    expect(result).toBe(true);
  });

  it('checks incompatible annotations that are part of the annoJson and have a substring selector', () => {
    const annotation = {
      svg: ['concat(substring(id("w.206"), 2, 4), " ", id("w.207"), " ", id("w.208"), " ", id("w.209"), " ")'],
    };
    const result = checkIsTargetCompatible(annotation);
    expect(result).toBe(false);
  });

  it('checks compatible annotations that are part of the annoJson and have a multiple id selectors', () => {
    const annotation = {
      svg: ['id("w.131")', 'id("w.132")', 'id("w.99990")', 'id("pc.1")'],
    };
    const result = checkIsTargetCompatible(annotation);
    expect(result).toBe(true);
  });

  it('checks incompatible annotations that are part of the annoJson and have a multiple id selectors', () => {
    const annotation = {
      svg: ['id("w.1") | id("w.2") | id("w.3") | id("w.4") | id("w.5")'],
    };
    const result = checkIsTargetCompatible(annotation);
    expect(result).toBe(false);
  });

  it('checks the compatible globaly selected annotation having a substring selector', () => {
    const annotation = {
      targets: [
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: {
            xPath: 'substring(id("w.206"),  2,  4)',
          },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: {
            xPath: 'id("w.207")',
          },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: {
            xPath: 'id("w.208")',
          },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: {
            xPath: 'id("w.209")',
          },
        },
      ],
    };
    const result = checkIsTargetCompatible(annotation);
    expect(result).toBe(true);
  });

  it('checks the incompatible globaly selected annotation having a substring selector', () => {
    const annotation = {
      targets: [
        {
          type: 'TEXT',
          linkToResource: '8c458d2443b0',
          selector: {
            xPath: 'concat(substring(id("w.206"), 2, 4), " ", id("w.207"), " ", id("w.208"), " ", id("w.209"), " ")',
          },
        },
      ],
    };
    const result = checkIsTargetCompatible(annotation);
    expect(result).toBe(false);
  });

  it('checks the compatible globaly selected annotation having multiple id selectors', () => {
    const annotation = {
      targets: [
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: {
            xPath: 'id("w.131")',
          },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: {
            xPath: 'id("w.132")',
          },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: {
            xPath: 'id("w.99990")',
          },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: {
            xPath: 'id("pc.1")',
          },
        },
      ],
    };
    const result = checkIsTargetCompatible(annotation);
    expect(result).toBe(true);
  });

  it('checks the incompatible globaly selected annotation having multiple id selectors', () => {
    const annotation = {
      targets: [
        {
          type: 'TEXT',
          linkToResource: '8c458d2443b0',
          selector: {
            xPath: 'id("w.131") | id("w.132") | id("w.99990") | id("pc.1")',
          },
        },
      ],
    };
    const result = checkIsTargetCompatible(annotation);
    expect(result).toBe(false);
  });
});

describe('making a target compatible to tAkita', () => {
  it('makes incompatible annotations that are part of the annoJson and have a substring selector compatible', () => {
    const annotation = {
      svg: ['concat(substring(id("w.206"), 2, 4), " ", id("w.207"), " ", id("w.208"), " ", id("w.209"), " ")'],
    };
    const result = makeTargetsCompatible(annotation);
    expect(result).toStrictEqual(['substring(id("w.206"),  2,  4)', 'id("w.207")', 'id("w.208")', 'id("w.209")']);
  });

  it('makes incompatible annotations that are part of the annoJson and have a multiple id selectors compatible', () => {
    const annotation = {
      svg: ['id("w.1") | id("w.2") | id("w.3") | id("pc.1")'],
    };
    const result = makeTargetsCompatible(annotation);
    expect(result).toStrictEqual(['id("w.1")', 'id("w.2")', 'id("w.3")', 'id("pc.1")']);
  });

  it('makes the incompatible globaly selected annotation having a substring selector compatible', () => {
    const annotation = {
      targets: [
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: {
            xPath: 'concat(substring(id("w.206"), 2, 4), " ", id("w.207"), " ", id("w.208"), " ", id("w.209"), " ")',
          },
        },
      ],
    };
    const result = makeTargetsCompatible(annotation);
    expect(result).toStrictEqual([
      {
        type: 'TEXT',
        linkToResource: 'Book_of_Psalms.xml',
        selector: {
          xPath: 'substring(id("w.206"),  2,  4)',
        },
      },
      {
        type: 'TEXT',
        linkToResource: 'Book_of_Psalms.xml',
        selector: {
          xPath: 'id("w.207")',
        },
      },
      {
        type: 'TEXT',
        linkToResource: 'Book_of_Psalms.xml',
        selector: {
          xPath: 'id("w.208")',
        },
      },
      {
        type: 'TEXT',
        linkToResource: 'Book_of_Psalms.xml',
        selector: {
          xPath: 'id("w.209")',
        },
      },
    ]);
  });

  it('makes the incompatible globaly selected annotation having multiple id selectors compatible', () => {
    const annotation = {
      targets: [
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: {
            xPath: 'id("w.131") | id("w.132") | id("w.99990") | id("pc.1")',
          },
        },
      ],
    };
    const result = makeTargetsCompatible(annotation);
    expect(result).toStrictEqual([
      {
        type: 'TEXT',
        linkToResource: 'Book_of_Psalms.xml',
        selector: {
          xPath: 'id("w.131")',
        },
      },
      {
        type: 'TEXT',
        linkToResource: 'Book_of_Psalms.xml',
        selector: {
          xPath: 'id("w.132")',
        },
      },
      {
        type: 'TEXT',
        linkToResource: 'Book_of_Psalms.xml',
        selector: {
          xPath: 'id("w.99990")',
        },
      },
      {
        type: 'TEXT',
        linkToResource: 'Book_of_Psalms.xml',
        selector: {
          xPath: 'id("pc.1")',
        },
      },
    ]);
  });
});

describe('removing styles from target', () => {
  it('removes all the relevant css classes from the target of the annotations', () => {
    // set up our document body
    document.body.innerHTML = innerHtml;
    // remove all styling/highlighting
    removeStyles(document.getElementById('TEI'));

    const eleWithoutClasses = document.getElementById('w.121');

    // check if removeStyles() works
    expect(eleWithoutClasses.classList.length).toBe(0);
  });
});

describe('drawing the annotations', () => {
  it('assigns the proper css-classes (highlights) to the targets of the annoatations', () => {
    // set up our document body
    document.body.innerHTML = innerHtml;

    drawAnnos(mockAnnoJson);

    const eleW132 = document.getElementById('w.132');
    const eleW99990 = document.getElementById('w.99990');
    const elePC1 = document.getElementById('pc.1');
    const eleW139 = document.getElementById('w.139');
    const eleW140 = document.getElementById('w.140');
    const eleW141 = document.getElementById('w.141');
    const eleW142 = document.getElementById('w.142');
    const eleW143 = document.getElementById('w.143');

    // check if drawAnnos() works
    expect(eleW132.classList).toMatchObject({
      0: 'metaphor',
      1: 'whitespaceAfter',
    });
    expect(eleW99990.classList).toMatchObject({
      0: 'mrw',
      1: 'metaphor',
    });
    expect(elePC1.classList).toMatchObject({
      0: 'metaphor',
      1: 'whitespaceAfter',
    });
    expect(eleW139.classList).toMatchObject({
      0: 'metaphor',
      1: 'whitespaceAfter',
    });
    expect(eleW140.classList).toMatchObject({
      0: 'mrw',
      1: 'metaphor',
      2: 'whitespaceAfter',
      3: 'metaphorSecond',
    });
    expect(eleW141.classList).toMatchObject({
      0: 'metaphor',
      1: 'metaphorSecond',
      2: 'whitespaceAfter',
    });
    expect(eleW142.classList).toMatchObject({
      0: 'metaphorSecond',
      1: 'whitespaceAfter',
    });
    expect(eleW143.classList).toMatchObject({
      0: 'metaphorSecond',
    });
  });
});

// can this be called integration test?
// doesnt work bc of the mockup
describe('updating the display', () => {
  it.skip('fetches the data, removes old styles and applies new highighting', () => {
    // set up our document body
    document.body.innerHTML = innerHtml;
    jest.mock('./highlight');
    const annoJson = highlight.updateDisplay();
    const eleWithoutClasses = document.getElementById('w.121');
    const eleW132 = document.getElementById('w.132');
    const eleW99990 = document.getElementById('w.99990');
    const elePC1 = document.getElementById('pc.1');
    const eleW139 = document.getElementById('w.139');
    const eleW140 = document.getElementById('w.140');
    const eleW141 = document.getElementById('w.141');
    const eleW142 = document.getElementById('w.142');
    const eleW143 = document.getElementById('w.143');

    // check if setting the global ANNOJSON and returning the annoJson works
    expect(window.ANNOJSON).toStrictEqual(annoJson);
    // check if removeStyles() works
    expect(eleWithoutClasses.classList.length).toBe(0);
    // check if drawAnnos() works
    expect(eleW132.classList).toMatchObject({
      0: 'metaphor',
      1: 'whitespaceAfter',
    });
    expect(eleW99990.classList).toMatchObject({
      0: 'mrw',
      1: 'metaphor',
    });
    expect(elePC1.classList).toMatchObject({
      0: 'metaphor',
      1: 'whitespaceAfter',
    });
    expect(eleW139.classList).toMatchObject({
      0: 'metaphor',
      1: 'whitespaceAfter',
    });
    expect(eleW140.classList).toMatchObject({
      0: 'mrw',
      1: 'metaphor',
      2: 'whitespaceAfter',
      3: 'metaphorSecond',
    });
    expect(eleW141.classList).toMatchObject({
      0: 'metaphor',
      1: 'metaphorSecond',
      2: 'whitespaceAfter',
    });
    expect(eleW142.classList).toMatchObject({
      0: 'metaphorSecond',
      1: 'whitespaceAfter',
    });
    expect(eleW143.classList).toMatchObject({
      0: 'metaphorSecond',
    });
  });
});
