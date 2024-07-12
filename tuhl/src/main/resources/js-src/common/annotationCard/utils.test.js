import { timestampsToISOString } from './utils';

describe('converting timestamps to dates', () => {
  const obj = {
    created: {
      seconds: 1720508617,
      nanos: 0,
    },
    modified: {
      seconds: 1720508617,
      nanos: 0,
    },
  };
  it('converts a timestamps to a date for the "created" field', () => {
    let obj = {
      created: {
        seconds: 1720508617,
        nanos: 0,
      },
    };
    obj = timestampsToISOString(obj);
    expect(obj.created).toStrictEqual('2024-07-09T07:03:37.000Z');
  });
  it('converts a timestamps to a date for the "modified" field', () => {
    let obj = {
      modified: {
        seconds: 1720508617,
        nanos: 0,
      },
    };
    obj = timestampsToISOString(obj);
    expect(obj.modified).toStrictEqual('2024-07-09T07:03:37.000Z');
  });
  it('converts a timestamps to a date for both fields', () => {
    let obj = {
      created: {
        seconds: 1720508617,
        nanos: 0,
      },
      modified: {
        seconds: 1720508617,
        nanos: 0,
      },
    };
    obj = timestampsToISOString(obj);
    expect(obj.modified).toStrictEqual('2024-07-09T07:03:37.000Z');
    expect(obj.created).toStrictEqual('2024-07-09T07:03:37.000Z');
  });
});
