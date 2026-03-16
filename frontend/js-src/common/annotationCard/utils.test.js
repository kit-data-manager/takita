import { timestampsToISOString } from './utils';

describe('converting timestamps to dates', () => {
  it('converts a timestamps to a date for the "created" field', () => {
    let obj = {
      created: 1720508617,
    };
    obj = timestampsToISOString(obj);
    expect(obj.created).toStrictEqual('2024-07-09T07:03:37.000Z');
  });
  it('converts a timestamps to a date for the "modified" field', () => {
    let obj = {
      modified: 1720508617,
    };
    obj = timestampsToISOString(obj);
    expect(obj.modified).toStrictEqual('2024-07-09T07:03:37.000Z');
  });
  it('converts a timestamps to a date for both fields', () => {
    let obj = {
      created: 1720508617,
      modified: 1720508617,
    };
    obj = timestampsToISOString(obj);
    expect(obj.modified).toStrictEqual('2024-07-09T07:03:37.000Z');
    expect(obj.created).toStrictEqual('2024-07-09T07:03:37.000Z');
  });
});
