import { parseAnalysisString, sanitizeSearchQuery } from './utils';

describe('parsing analysis string with auxiliaryText', () => {
  it('deals with well-formed input', () => {
    const string = '{"auxiliaryText":{"ops":[{"insert":"Hello, this is not tricky.\\\\n"}]},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":""}';
    const result = parseAnalysisString(string);
    expect(result).toBeDefined();
    expect(result.auxiliaryText.ops[0].insert).toBe('Hello, this is not tricky.\\n');
  });

  it('deals with superfluous escape characters for newlines', () => {
    const string = '{"auxiliaryText":{"ops":[{"insert":"this is a bit tricky.\\\\\n"}]},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":""}';
    const result = parseAnalysisString(string);
    expect(result.auxiliaryText.ops[0].insert).toBe('this is a bit tricky.\\n');
  });

  it('deals with unescaped quotation marks', () => {
    const string = '{"auxiliaryText":{"ops":[{"insert":"this is a "bit" tricky."}]},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":""}';
    const result = parseAnalysisString(string);
    expect(result.auxiliaryText.ops[0].insert).toBe('this is a "bit" tricky.');
  });

  it.skip('deals with weird chinese text newlines (maybe just a relict of some manual tinkering with WAPS data?)', () => {
    const string = "{\"auxiliaryText\":{\"ops\":[{\"insert\":\"Reckon the \"},{\"attributes\":{\"mrw-direct\":true},\"insert\":\"boundaries \"},{\"insert\":\"of \"},{\"attributes\":{\"mrw-indirect\":true},\"insert\":\"glory and disgrace\"},{\"insert\":\"\\\n\"}]},\"propositions\":[{\"evidence\":\"explicit\",\"predicate\":\"\",\"subject\":\"glory and disgrace\",\"type\":\"possessive\",\"value\":\"boundaries\"},{\"evidence\":\"world knowledge\",\"predicate\":\"\",\"subject\":\"places\",\"type\":\"possessive\",\"value\":\"boundaries\"}],\"mappings\":[[{\"source\":{\"value\":\"see\",\"step\":\"complete\"},\"target\":{\"value\":\"reckon\",\"step\":\"open\"}},{\"source\":{\"value\":\"place\",\"step\":\"complete\"},\"target\":{\"value\":\"glory and disgrace\",\"step\":\"open\"}},{\"source\":{\"value\":\"have boundaries\",\"step\":\"open\"},\"target\":{\"value\":\"have limits\",\"step\":\"complete\"}}]],\"linkings\":[{\"source\":\"place\",\"source_link\":[\"https://w3id.org/MoRe-SFB1475/CT/concepts/3366264262\"],\"target\":\"glory\",\"target_link\":[\"https://w3id.org/MoRe-SFB1475/CT/concepts/2711160260\"]}],\"tertiaComment\":\"\"}";
    const result = parseAnalysisString(string);
    console.log(result.auxiliaryText.ops);
    expect(result.auxiliaryText.ops[4].insert).toBe('\\n');
  });
});

describe('parsing analysis string with tertiaComment', () => {
  it('deals with well-formed input', () => {
    const string = '{"auxiliaryText":{},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":"This is not problematic.\\n"}';
    const result = parseAnalysisString(string);
    expect(result.tertiaComment).toBe('This is not problematic.\n');
  });

  it('deals with superfluous escape characters for newlines', () => {
    const string = '{"auxiliaryText":{},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":"This is problematic.\\\\\n"}';
    const result = parseAnalysisString(string);
    expect(result.tertiaComment).toBe('This is problematic.\\n');
  });

  it('deals with unescaped quotation marks', () => {
    const string = '{"auxiliaryText":{},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":"This is "problematic"."}';
    const result = parseAnalysisString(string);
    expect(result.tertiaComment).toBe('This is "problematic".');
  });
});

describe('sanitizing search query terms', () => {
  it('leaves regular text untouched', () => {
    const s = 'Dog';
    const r = sanitizeSearchQuery(s);
    expect(r).toBe(s);
  });

  it('leaves hyphens untouched', () => {
    const s = 'hyphen-term';
    const r = sanitizeSearchQuery(s);
    expect(r).toBe(s);
  });

  it('keeps non-latin letters', () => {
    const s = 'αβγ';
    const r = sanitizeSearchQuery(s);
    expect(r).toBe(s);
  });

  it('removes special characters', () => {
    const s = 'ab;c()d:';
    const r = sanitizeSearchQuery(s);
    expect(r).toBe('abcd');
  });
});
