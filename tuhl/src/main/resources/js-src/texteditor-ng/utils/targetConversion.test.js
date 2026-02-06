import { checkIsTargetCompatible, makeTargetsCompatible, convertXPath } from './targetConversion';

describe('checking if a target is compatible with tAkita', () => {
  it('checks compatible annotations that are part of the annoJson and have a substring selector', () => {
    const annotation = {
      targets: [
        {
          selector: {
            type: 'XPathSelector',
            value: ['substring(id("w.206"),  2,  4)', 'id("w.207")', 'id("w.208")', 'id("w.209")'],
          },
        },
      ],
    };
    const result = checkIsTargetCompatible(annotation);
    expect(result).toBe(true);
  });

  it('checks incompatible annotations that are part of the annoJson and have a substring selector', () => {
    const annotation = {
      targets: [
        {
          selector: {
            type: 'XPathSelector',
            value: ['concat(substring(id("w.206"), 2, 4), " ", id("w.207"), " ", id("w.208"), " ", id("w.209"), " ")'],
          },
        },
      ],
    };
    const result = checkIsTargetCompatible(annotation);
    expect(result).toBe(false);
  });

  it('checks compatible annotations that are part of the annoJson and have a multiple id selectors', () => {
    const annotation = {
      targets: [
        {
          selector: {
            type: 'XPathSelector',
            value: ['id("w.131")', 'id("w.132")', 'id("w.99990")', 'id("pc.1")'],
          },
        },
      ],
    };
    const result = checkIsTargetCompatible(annotation);
    expect(result).toBe(true);
  });

  it('checks incompatible annotations that are part of the annoJson and have a multiple id selectors', () => {
    const annotation = {
      targets: [
        {
          selector: {
            type: 'XPathSelector',
            value: ['id("w.1") | id("w.2") | id("w.3") | id("w.4") | id("w.5")'],
          },
        },
      ],
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
          selector: { type: 'XPathSelector', value: 'substring(id("w.206"),  2,  4)' },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: { type: 'XPathSelector', value: 'id("w.207")' },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: { type: 'XPathSelector', value: 'id("w.208")' },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: { type: 'XPathSelector', value: 'id("w.209")' },
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
            type: 'XPathSelector',
            value: 'concat(substring(id("w.206"), 2, 4), " ", id("w.207"), " ", id("w.208"), " ", id("w.209"), " ")',
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
          selector: { type: 'XPathSelector', value: 'id("w.131")' },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: { type: 'XPathSelector', value: 'id("w.132")' },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: { type: 'XPathSelector', value: 'id("w.99990")' },
        },
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: { type: 'XPathSelector', value: 'id("pc.1")' },
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
          selector: { type: 'XPathSelector', value: 'id("w.131") | id("w.132") | id("w.99990") | id("pc.1")' },
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
      targets: [
        {
          selector: {
            type: 'XPathSelector',
            value: ['concat(substring(id("w.206"), 2, 4), " ", id("w.207"), " ", id("w.208"), " ", id("w.209"), " ")'],
          },
        },
      ],
    };
    const result = makeTargetsCompatible(annotation);
    expect(result[0].selector.value).toStrictEqual([
      'substring(id("w.206"),  2,  4)',
      'id("w.207")',
      'id("w.208")',
      'id("w.209")',
    ]);
  });

  it('makes incompatible annotations that are part of the annoJson and have a multiple id selectors compatible', () => {
    const annotation = {
      targets: [
        {
          selector: {
            type: 'XPathSelector',
            value: ['id("w.1") | id("w.2") | id("w.3") | id("pc.1")'],
          },
        },
      ],
    };
    const result = makeTargetsCompatible(annotation);
    expect(result[0].selector.value).toStrictEqual(['id("w.1")', 'id("w.2")', 'id("w.3")', 'id("pc.1")']);
  });

  it('makes the incompatible globaly selected annotation having a substring selector compatible', () => {
    const annotation = {
      targets: [
        {
          type: 'TEXT',
          linkToResource: 'Book_of_Psalms.xml',
          selector: {
            type: 'XPathSelector',
            value: 'concat(substring(id("w.206"), 2, 4), " ", id("w.207"), " ", id("w.208"), " ", id("w.209"), " ")',
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
          type: 'XPathSelector',
          value: ['substring(id("w.206"),  2,  4)', 'id("w.207")', 'id("w.208")', 'id("w.209")'],
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
            type: 'XPathSelector',
            value: 'id("w.131") | id("w.132") | id("w.99990") | id("pc.1")',
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
          type: 'XPathSelector',
          value: ['id("w.131")', 'id("w.132")', 'id("w.99990")', 'id("pc.1")'],
        },
      },
    ]);
  });
});

// TODO: adapt the folling tests after the leading/trailing whitespace was removed
describe('converting long xPath to an array of xPaths', () => {
  it('converts a long xPath only including ids (old xPaths not using id()-function)', () => {
    const longXPath = '//*[@xml:id="w.121"] | //*[@xml:id="w.122"]';
    const result = convertXPath(longXPath);
    expect(result).toStrictEqual(['//*[@xml:id="w.121"]', '//*[@xml:id="w.122"]']);
  });
  it('converts a long xPath only including ids (new xPaths using id()-function)', () => {
    const longXPath = 'id("w.121") | id("w.122")';
    const result = convertXPath(longXPath);
    expect(result).toStrictEqual(['id("w.121")', 'id("w.122")']);
  });
  it('converts a long xPath including substrings (old xPaths not using id()-function)', () => {
    const longXPath = 'concat(//*[@xml:id="w.75"], //*[@xml:id="pc.12"], "   ", substring(//*[@xml:id="w.76"], 1, 5))';
    const result = convertXPath(longXPath);
    expect(result).toStrictEqual([
      '//*[@xml:id="w.75"]',
      '//*[@xml:id="pc.12"]',
      'substring(//*[@xml:id="w.76"],  1,  5)',
    ]);
  });
  it('converts a long xPath including substrings (new xPaths using id()-function)', () => {
    const longXPath = 'concat(id("w.75"), id("pc.12"), "   ", substring(id("w.76"), 1, 5))';
    const result = convertXPath(longXPath);
    expect(result).toStrictEqual(['id("w.75")', 'id("pc.12")', 'substring(id("w.76"),  1,  5)']);
  });
});
