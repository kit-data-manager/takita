import { MRWAnnotation } from './index';

import { mockMRWAnnoData } from '../../examples/mrwAnnoData';
import { cloneDeep } from 'lodash';

describe('MRW annotation functionality', () => {
  let anno;

  beforeEach(() => {
    anno = new MRWAnnotation(mockMRWAnnoData);
  });

  it('instantiates correctly', () => {
    expect(anno).toBeInstanceOf(MRWAnnotation);
  });

  it('extracts MRW type', () => {
    expect(anno.getType()).toBe('mrw (indirect)');
  });

  it('extracts MRW text', () => {
    expect(anno.getText()).toBe('brāhmayā');
  });

  it('deals with purpose "classifying", too', () => {
    const data = cloneDeep(mockMRWAnnoData);
    data.body = data.body.map((b) => {
      if (b.purpose === 'tagging') {
        b.purpose = 'classifying';
      }
      return b;
    });

    const a = new MRWAnnotation(data);
    expect(a.getType()).toBe('mrw (indirect)');
  });
});
