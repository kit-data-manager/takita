import * as data from '../texteditor-ng/data/annotations';
import { createNewDescribingBody, getMRWAnnoSelectedText, updateTargetAndBodyData } from './data';

describe('updating a body and a target with two consecutive fetch calls', () => {
  it('successfully updates', async () => {
    const targetUpdateResonse = {
      textCards: [{ purpose: 'describing', id: 'bodyId' }],
      created: {
        seconds: 1720508617,
        nanos: 0,
      },
      creators: 'targetUpdateResponse.creators',
      modified: {
        seconds: 1720508617,
        nanos: 0,
      },
      value: '',
    };
    jest.spyOn(data, 'updateTargetData').mockReturnValue(targetUpdateResonse);
    jest.spyOn(data, 'updateBodyData').mockReturnValue('body updated');

    const [result1, result2] = await updateTargetAndBodyData({ id: 'annoId' }, 'xpath', 'new');
    expect(result1).toStrictEqual(targetUpdateResonse);
    expect(result2).toStrictEqual('body updated');
  });
  it('fails the update, because the return of a fetch call was wrong', async () => {
    const targetUpdateResonse = {
      value: '',
    };
    jest.spyOn(data, 'updateTargetData').mockReturnValue(targetUpdateResonse);
    jest.spyOn(data, 'updateBodyData').mockReturnValue('body updated');
    let result = false;
    try {
      await updateTargetAndBodyData({ id: 'annoId' }, 'xpath', 'new');
    } catch (e) {
      result = true;
    }
    expect(result).toBe(true);
  });
  it('fails the update, because the fetch call failed', async () => {
    const targetUpdateResonse = new Error();
    jest.spyOn(data, 'updateTargetData').mockReturnValue(targetUpdateResonse);
    jest.spyOn(data, 'updateBodyData').mockReturnValue('body updated');
    let result = false;
    try {
      await updateTargetAndBodyData({ id: 'annoId' }, 'xpath', 'new');
    } catch (e) {
      result = true;
    }
    expect(result).toBe(true);
  });
});

describe('creating a new body during a target update', () => {
  it('creates a new body', () => {
    const targetUpdateResonse = {
      textCards: [{ purpose: 'describing', id: 'bodyId' }],
      created: {
        seconds: 1720508617,
        nanos: 0,
      },
      creators: 'targetUpdateResponse.creators',
      modified: {
        seconds: 1720508617,
        nanos: 0,
      },
      value: '',
    };
    const result = createNewDescribingBody(targetUpdateResonse, 'new Text');
    expect(result).toStrictEqual({
      created: '2024-07-09T07:03:37.000Z',
      creators: 'targetUpdateResponse.creators',
      id: 'bodyId',
      modified: '2024-07-09T07:03:37.000Z',
      purpose: 'describing',
      value: 'new Text',
    });
  });
  it('fails to create a new body', () => {
    const targetUpdateResonse = {
      textCards: [{ purpose: 'tagging', id: 'bodyId' }],
      created: {
        seconds: 1720508617,
        nanos: 0,
      },
      creators: 'targetUpdateResponse.creators',
      modified: {
        seconds: 1720508617,
        nanos: 0,
      },
      value: '',
    };

    let functionHasFailed = false;
    try {
      createNewDescribingBody(targetUpdateResonse, 'new Text');
    } catch (e) {
      functionHasFailed = true;
    }
    expect(functionHasFailed).toBe(true);
  });
});

describe('getting the value of a specific body from a fetched annotation', () => {
  it('succeeds', async () => {
    jest.spyOn(data, 'getAnnotationData').mockReturnValue({
      textCards: [{ purpose: 'describing', value: 'text' }],
    });
    const result = await getMRWAnnoSelectedText('anno');
    expect(result).toStrictEqual('text');
  });

  it('fails as the specific body is missing', async () => {
    jest.spyOn(data, 'getAnnotationData').mockReturnValue({
      textCards: [{ purpose: 'tagging', value: 'text' }],
    });
    const result = await getMRWAnnoSelectedText('anno');
    expect(result).toBe(undefined);
  });

  it('fails as the fetch call failed', async () => {
    jest.spyOn(data, 'getAnnotationData').mockReturnValue(new Error());
    const result = await getMRWAnnoSelectedText('anno');
    expect(result).toBe(undefined);
  });
});
