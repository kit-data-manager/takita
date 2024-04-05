// internal modules
import { annotateSelectedText } from './editor';

// will not work as I can't get the selection out of the browser
describe.skip('integration: getting xPath from selection', () => {
  it('deals with single word selection', () => {
    const selection = {};
    const result = annotateSelectedText(selection);
    expect(result).toBe('xpath');
  });
  it('deals with single word selection including a linebreak in the word', () => {
    const selection = {};
    const result = annotateSelectedText(selection);
    expect(result).toBe('xpath');
  });
  it('deals with single word selection of nested (choice) elements', () => {
    const selection = {};
    const result = annotateSelectedText(selection);
    expect(result).toBe('xpath');
  });
  it('deals with multi word selection', () => {
    const selection = {};
    const result = annotateSelectedText(selection);
    expect(result).toBe('xpath');
  });
  it('deals with multi word selection including substrings', () => {
    const selection = {};
    const result = annotateSelectedText(selection);
    expect(result).toBe('xpath');
  });
});
