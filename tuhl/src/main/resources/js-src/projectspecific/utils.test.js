import { getColorHexFromEnumEntry, getColorNameFromEnumEntry } from './utils';

describe('retrieving hex values based on a string, which is stored in an array', () => {
  it('retrieves hex values of colors', () => {
    const testEnum = ['default', 'MRW_DIRECT', 'MRW_INDIRECT', 'MRW_IMPLICIT', 'MFLAG', 'METAPHOR'];
    const result = testEnum.map((entry) => {
      return getColorHexFromEnumEntry(entry);
    });
    expect(result).toStrictEqual(['#89f099', '#000011', '#000012', '#000013', '#000014', '#000021']);
  });
});

describe('retrieving string values based on a string, which is stored in an array', () => {
  it('retrieves string values of color names', () => {
    const testEnum = ['default', 'MRW_DIRECT', 'MRW_INDIRECT', 'MRW_IMPLICIT', 'MFLAG', 'METAPHOR'];
    const result = testEnum.map((entry) => {
      return getColorNameFromEnumEntry(entry);
    });
    expect(result).toStrictEqual(['Default', 'mrw (direct)', 'mrw (indirect)', 'mrw (implicit)', 'mflag', 'metaphor']);
  });
});
