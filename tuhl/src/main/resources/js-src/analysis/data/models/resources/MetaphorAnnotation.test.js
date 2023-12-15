import { MetaphorAnnotation } from './MetaphorAnnotation';
import { mockMetaphorAnnoData } from '../../examples/metaphorAnnoData';

import { cloneDeep } from 'lodash';

describe('metaphor annotation without existing analysis', () => {
  let data;

  beforeEach(() => {
    data = { ...mockMetaphorAnnoData };
    // Remove the body containing the analysis.
    data.body = data.body.filter((b) => b.purpose !== 'assessing');
  });

  it('creates an empty analysis if there is none', () => {
    let anno;

    expect(() => {
      anno = new MetaphorAnnotation(data);
    }).not.toThrow();
  });

  it('does handle requests for concept URIs', () => {
    const anno = new MetaphorAnnotation(data);
    expect(anno.getConceptURIs()).toEqual([]);
  });
});

describe('metaphor annotation functionality', () => {
  let anno;

  beforeEach(async () => {
    anno = new MetaphorAnnotation(mockMetaphorAnnoData);
  });

  test('extract MRW URIs', () => {
    const expected = ['http://localhost:8889/wap/philipp/takita/4e44c8bc-84ce-4b4b-9ef8-320c579d8470'];
    expect(anno.getMRWURIs()).toEqual(expected);
  });

  test('extract concept URIs', () => {
    const expected = [
      'https://w3id.org/MoRe-SFB1475/CT/concepts/3083523343',
      'https://w3id.org/MoRe-SFB1475/CT/concepts/1520345177',
      'https://w3id.org/MoRe-SFB1475/CT/concepts/1356392694',
      'https://w3id.org/MoRe-SFB1475/CT/concepts/3401688171',
      'https://w3id.org/MoRe-SFB1475/CT/concepts/3765332836',
      'https://w3id.org/MoRe-SFB1475/CT/concepts/803141091',
    ];
    expect(anno.getConceptURIs()).toEqual(expected);
  });

  test('extract document id', () => {
    expect(anno.getDocumentId()).toBe('d63ec633-8c1c-4fcf-9f65-94cd6d5401a7');
  });

  test('extract comment', () => {
    expect(anno.getComment()).toBe('Just a dummy');
  });

  test('extract annotation label', () => {
    expect(anno.getAnnotationLabel()).toBe('Book_of_Psalms1684151988148');
  });

  test('filter out empty linking urls', () => {
    anno.analysis.linkings = [
      {
        source: 'foo',
        source_link: [null, 'https://example.com', null],
        target: 'bar',
        target_link: ['https://example.com', null],
      },
    ];

    const conceptURIS = anno.getConceptURIs();
    expect(conceptURIS.length).toBe(2);
    expect(conceptURIS).toEqual(['https://example.com', 'https://example.com']);
  });

  test('extract metaphor text', () => {
    expect(anno.getText()).toBe('Blessed [is] the man that walketh not in the counsel of the ungodly');
  });

  it('can extract propositions', () => {
    const props = [{ evidence: 'explicit', predicate: '', subject: 'god', type: 'attribute', value: 'forgiving' }];
    expect(anno.getPropositions()).toEqual(props);
  });

  it('extracts linkings', () => {
    const linkings = [
      {
        source: 'Hirte',
        source_link: ['https://w3id.org/MoRe-SFB1475/CT/concepts/3083523343'],
        target: 'Gott',
        target_link: ['https://w3id.org/MoRe-SFB1475/CT/concepts/1520345177'],
      },
      {
        source: 'sheep',
        source_link: ['https://w3id.org/MoRe-SFB1475/CT/concepts/1356392694'],
        target: 'believer',
        target_link: ['https://w3id.org/MoRe-SFB1475/CT/concepts/3401688171'],
      },
      {
        source: 'Gnu',
        source_link: [],
        target: 'Penguin',
        target_link: [
          'https://w3id.org/MoRe-SFB1475/CT/concepts/3765332836',
          'https://w3id.org/MoRe-SFB1475/CT/concepts/803141091',
        ],
      },
    ];
    expect(anno.getLinkings()).toEqual(linkings);
  });
});

describe('metaphor annotation with only a single target object', () => {
  let anno;

  beforeEach(async () => {
    const data = cloneDeep(mockMetaphorAnnoData);
    data.target = data.target[0];
    anno = new MetaphorAnnotation(mockMetaphorAnnoData);
  });

  it('can extract the document id', () => {
    expect(anno.getDocumentId()).toBe('d63ec633-8c1c-4fcf-9f65-94cd6d5401a7');
  });

  it('extracts linkings', () => {
    const linkings = [
      {
        source: 'Hirte',
        source_link: ['https://w3id.org/MoRe-SFB1475/CT/concepts/3083523343'],
        target: 'Gott',
        target_link: ['https://w3id.org/MoRe-SFB1475/CT/concepts/1520345177'],
      },
      {
        source: 'sheep',
        source_link: ['https://w3id.org/MoRe-SFB1475/CT/concepts/1356392694'],
        target: 'believer',
        target_link: ['https://w3id.org/MoRe-SFB1475/CT/concepts/3401688171'],
      },
      {
        source: 'Gnu',
        source_link: [],
        target: 'Penguin',
        target_link: [
          'https://w3id.org/MoRe-SFB1475/CT/concepts/3765332836',
          'https://w3id.org/MoRe-SFB1475/CT/concepts/803141091',
        ],
      },
    ];
    expect(anno.getLinkings()).toEqual(linkings);
  });
});
