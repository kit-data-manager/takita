import {
  extractAuxText,
  extractTertiaComment,
  findMatchingBracket,
  processAuxText,
  processTertiaComment,
  sanitize,
  splitInserts,
} from './sanitizing';

describe('finding matching bracket', () => {
  it('finds simple match', () => {
    const s = 'this [is] simple';
    const r = findMatchingBracket(s, 5);
    expect(r).toBe(8);
  });

  it('finds different characters', () => {
    const s = 'this {is} simple';
    const r = findMatchingBracket(s, 5, '{', '}');
    expect(r).toBe(8);
  });

  it('finds match at the end', () => {
    const s = 'this [is]';
    const r = findMatchingBracket(s, 5);
    expect(r).toBe(8);
  });

  it('finds immediate match', () => {
    const s = 'this [] is simple';
    const r = findMatchingBracket(s, 5);
    expect(r).toBe(6);
  });

  it('deals with nested matches', () => {
    const s = 'this [is [more] or] less simple';
    const r = findMatchingBracket(s, 5);
    expect(r).toBe(18);
  });
});

describe('extractAuxText', () => {
  it('extracts text from beginning (where it normally is)', () => {
    const string =
      '{"auxiliaryText":{"ops":[{"insert":"Hello, this is not tricky.\\\\n"}]},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":""}';
    const { before, auxText, after } = extractAuxText(string);
    expect(before).toBe('{"auxiliaryText":');
    expect(auxText).toBe('{"ops":[{"insert":"Hello, this is not tricky.\\\\n"}]}');
    expect(after).toBe(
      ',"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":""}',
    );
  });

  it('extracts aux text also if it is in the middle of the analysis string', () => {
    const string =
      '{"propositions":[],"auxiliaryText":{"ops":[{"insert":"Hello, this is not tricky.\\\\n"}]},"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":""}';
    const { before, auxText, after } = extractAuxText(string);
    expect(before).toBe('{"propositions":[],"auxiliaryText":');
    expect(auxText).toBe('{"ops":[{"insert":"Hello, this is not tricky.\\\\n"}]}');
    expect(after).toBe(
      ',"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":""}',
    );
  });
});

describe('extractTertiaComment', () => {
  it('extracts text from end (where it normally is', () => {
    const string =
      '{"auxiliaryText":{},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":"This is not problematic.\\n"}';
    const { before, tertiaComment, after } = extractTertiaComment(string);
    expect(before).toBe(
      '{"auxiliaryText":{},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":',
    );
    expect(tertiaComment).toBe('"This is not problematic.\\n"');
    expect(after).toBe('}');
  });

  it('extracts tertiaComment even if it is in the middle of the string', () => {
    const string =
      '{"auxiliaryText":{},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"tertiaComment":"This is not problematic.\\n","linkings":[{"source":"","source_link":[],"target":"","target_link":[]}]}';
    const { before, tertiaComment, after } = extractTertiaComment(string);
    expect(before).toBe(
      '{"auxiliaryText":{},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"tertiaComment":',
    );
    expect(tertiaComment).toBe('"This is not problematic.\\n"');
    expect(after).toBe(',"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}]}');
  });
});

describe('sanitize strings', () => {
  it('deals with "empty" JSON string values', () => {
    const s = '""';
    const r = sanitize(s);
    expect(r).toBe(s);
  });

  it('leaves unproblematic strings untouched', () => {
    const s = '"This is simple."';
    const r = sanitize(s);
    expect(r).toBe(s);
  });

  it('leaves correctly escaped strings untouched', () => {
    const s = '"Hello, this is \\"not\\" tricky.\\n"';
    const r = sanitize(s);
    expect(r).toBe(s);
  });

  it('fixes incorrect newline escapes', () => {
    const s = '"This is tricky.\\\n"';
    const r = sanitize(s);
    expect(r).toBe('"This is tricky.\\n"');
  });

  it('fixes unescaped quotes', () => {
    const s = '"This "is" tricky."';
    const r = sanitize(s);
    expect(r).toBe('"This \\"is\\" tricky."');
  });

  it('fixes complex faulty strings', () => {
    const s = '"This "is" "very"\\\ntricky.\\\n"';
    const r = sanitize(s);
    expect(r).toBe('"This \\"is\\" \\"very\\"\\ntricky.\\n"');
  });

  it('fixes isolated faulty newlines', () => {
    const s = '"\\\n"';
    const r = sanitize(s);
    expect(r).toBe('"\\n"');
  });
});

describe('splitInserts', () => {
  it('can deal with empty auxiliaryText', () => {
    const s = '{}';
    const r = splitInserts(s);
    expect(r).toEqual([{ text: '{}', startIdx: 0, endIdx: 2, type: 'non-insert' }]);
  });

  it.skip('deals with weird chinese text newlines (maybe just a relict of some manual tinkering with WAPS data?)', () => {
    const s =
      '{"ops":[{"insert":"Reckon the "},{"attributes":{"mrw-direct":true},"insert":"boundaries "},{"insert":"of "},{"attributes":{"mrw-indirect":true},"insert":"glory and disgrace"},{"insert":"\\\n"}]}';
    const r = splitInserts(s);
    console.log(r);
  });
});

describe('processAuxText', () => {
  it('can deal with empty auxiliaryText', () => {
    const s =
      '{"auxiliaryText":{},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":""}';
    const r = processAuxText(s);
    expect(r).toBe(s);
  });

  it.skip('deals with weird chinese text newlines (maybe just a relict of some manual tinkering with WAPS data?)', () => {
    const s =
      '{"auxiliaryText":{"ops":[{"insert":"Reckon the "},{"attributes":{"mrw-direct":true},"insert":"boundaries "},{"insert":"of "},{"attributes":{"mrw-indirect":true},"insert":"glory and disgrace"},{"insert":"\\\n"}]},"propositions":[{"evidence":"explicit","predicate":"","subject":"glory and disgrace","type":"possessive","value":"boundaries"},{"evidence":"world knowledge","predicate":"","subject":"places","type":"possessive","value":"boundaries"}],"mappings":[[{"source":{"value":"see","step":"complete"},"target":{"value":"reckon","step":"open"}},{"source":{"value":"place","step":"complete"},"target":{"value":"glory and disgrace","step":"open"}},{"source":{"value":"have boundaries","step":"open"},"target":{"value":"have limits","step":"complete"}}]],"linkings":[{"source":"place","source_link":["https://w3id.org/MoRe-SFB1475/CT/concepts/3366264262"],"target":"glory","target_link":["https://w3id.org/MoRe-SFB1475/CT/concepts/2711160260"]}],"tertiaComment":""}';
    const r = processAuxText(s);
    console.log(r);
    const j = JSON.parse(r);
    console.log(j.auxiliaryText.ops);
  });
});

describe('processTertiaComment', () => {
  it('deals with unproblematic text', () => {
    const s =
      '{"auxiliaryText":{},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":"This is not problematic.\\n"}';
    const r = processTertiaComment(s);
    expect(() => JSON.parse(r)).not.toThrow();
    expect(r).toBe(s);
  });

  it('deals with faulty newline escaping', () => {
    const s =
      '{"auxiliaryText":{},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":"This is problematic.\\\\\n"}';
    const r = processTertiaComment(s);
    expect(() => JSON.parse(r)).not.toThrow();
  });

  it('deals with faulty text', () => {
    const s =
      '{"auxiliaryText":{},"propositions":[],"mappings":[[{"source":{"value":"","step":null},"target":{"value":"","step":null}}]],"linkings":[{"source":"","source_link":[],"target":"","target_link":[]}],"tertiaComment":"This "is" problematic.\\\\\n"}';
    const r = processTertiaComment(s);
    expect(() => JSON.parse(r)).not.toThrow();
  });
});
