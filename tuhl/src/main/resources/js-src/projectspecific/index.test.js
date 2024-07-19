import { initializeCRC1475Specifics } from '.';

describe('initializing CRC1475 specific variables', () => {
  it('initializes CRC1475 specific variables', () => {
    initializeCRC1475Specifics();
    expect(window.MRW_ANNOS).toStrictEqual([]);
  });
});
