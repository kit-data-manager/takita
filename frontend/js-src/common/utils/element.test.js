import { createOption } from './elements';

describe('creating a an option element', () => {
  it('creates an option element with the value "test"', () => {
    const $option = createOption('test');
    expect($option.value).toBe('test');
    expect($option.innerHTML).toBe('test');
  });
});
