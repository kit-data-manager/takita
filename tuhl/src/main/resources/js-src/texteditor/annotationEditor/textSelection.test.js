import { removeWhitespaceFromSelectionTextContent } from './textSelection';

describe('removing most whitespace (leading, trailing and whitespaces > 1) from the selection', () => {
  it('deals with leading whitespace', () => {
    const string = ' word';
    const result = removeWhitespaceFromSelectionTextContent(string);
    expect(result).toBe('word');
  });

  it('deals with trailing whitespace', () => {
    const string = 'word ';
    const result = removeWhitespaceFromSelectionTextContent(string);
    expect(result).toBe('word');
  });

  it('deals with duplicated (more than 1) whitespace', () => {
    const string = '      w            o     r' + '     \t\n\rd';
    const result = removeWhitespaceFromSelectionTextContent(string);
    expect(result).toBe('w o r d');
  });
});
