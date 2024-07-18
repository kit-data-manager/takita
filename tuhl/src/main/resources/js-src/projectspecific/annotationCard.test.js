import { addLinkToAnalysisTool, changeLabel, updateLinkingTextcard } from './annotationCard';
import * as data from './data';

describe('changing a label to be used in the horizontal annotationCrd', () => {
  it('assigns a label based on a given string', () => {
    const labelA = changeLabel('tagging');
    const labelB = changeLabel('linking');
    const labelC = changeLabel('classifying');
    const labelD = changeLabel('describing');
    const labelE = changeLabel('identifying');
    const labelF = changeLabel('assessing');
    const labelG = changeLabel('commenting');

    const labelDefault = changeLabel('purpose');
    expect(labelA).toStrictEqual('Tag: ');
    expect(labelB).toStrictEqual('Linked mrw-annotation: ');
    expect(labelC).toStrictEqual('Classification: ');
    expect(labelD).toStrictEqual('Selected text: ');
    expect(labelE).toStrictEqual('Label: ');
    expect(labelF).toStrictEqual('Analysis: ');
    expect(labelG).toStrictEqual('Comment: ');
    expect(labelDefault).toStrictEqual('purpose: ');
  });
});

describe('adding a button to an element', () => {
  it('adds an enabled button and a link to a given element', () => {
    const $ele = document.createElement('div');
    const data = { color: 'METAPHOR', textCards: [{ purpose: 'linking' }] };
    const $result = addLinkToAnalysisTool(data, $ele);

    expect($result.childElementCount).toStrictEqual(1);
    expect($result.querySelector('input').disabled).toBe(false);
  });
  it('adds a disabled button and a link to a given element', () => {
    const $ele = document.createElement('div');
    const data = { color: 'METAPHOR', textCards: [{ purpose: 'tagging' }, { purpose: 'analyzing' }] };
    const $result = addLinkToAnalysisTool(data, $ele);

    expect($result.childElementCount).toStrictEqual(1);
    expect($result.querySelector('input').disabled).toBe(true);
  });
  it("doesn't add anything to a given element", () => {
    const $ele = document.createElement('div');
    const data = { color: 'MRW', textCards: [{ purpose: 'tagging' }, { purpose: 'analyzing' }] };
    const $result = addLinkToAnalysisTool(data, $ele);

    expect($result.childElementCount).toStrictEqual(0);
  });
});

describe('replacing a value of an object', () => {
  beforeAll(() => {
    jest.spyOn(data, 'getMRWAnnoSelectedText').mockReturnValue('Replacement');
  });

  it('replaces the value of an object after fetching another annotation', async () => {
    let resource = { value: 'annoId', purpose: 'linking' };
    resource = await updateLinkingTextcard(null, resource);
    expect(resource.value).toStrictEqual('Replacement');
  });

  it("doesn't replace the value of an object after fetching another annotation as the object has a wrong purpose", async () => {
    let resource = { value: 'annoId', purpose: 'analyzing' };
    resource = await updateLinkingTextcard(null, resource);
    expect(resource.value).toStrictEqual('annoId');
  });
});
