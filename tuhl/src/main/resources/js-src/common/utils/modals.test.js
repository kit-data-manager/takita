import { fetchWithSpinner, toggleLoadingModal } from './modals';

afterEach(() => {
  fetch.mockClear();
});
describe('displaying a spinner during a fetch call', () => {
  // mocking fetch
  global.fetch = jest.fn(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('foo');
      }, 200);
    });
  });
  it('shows a spinner when a fetch call is started and hides it on successfull fetch', async () => {
    //document.body.innerHTML = `<div id="#loading"></div>`;
    const $element = document.createElement('div');
    $element.id = 'loading';
    document.body.appendChild($element);
    const $modal = document.getElementById('loading');
    fetchWithSpinner();
    const spinnerAtStart = $modal.classList.contains('show-modal');
    expect(spinnerAtStart).toBe(true);
  });
  it('shows a spinner when a fetch call is started and hides it on failed fetch', async () => {
    const $element = document.createElement('div');
    $element.id = 'loading';
    document.body.appendChild($element);
    const $modal = document.getElementById('loading');
    await fetchWithSpinner();
    const spinnerAtEnd = $modal.classList.contains('show-modal');
    expect(spinnerAtEnd).toBe(false);
  });
});

describe('displaying a spinner', () => {
  it('shows a spinner', () => {
    const $element = document.createElement('div');
    $element.id = 'loading';
    document.body.appendChild($element);
    const $modal = document.getElementById('loading');
    toggleLoadingModal();
    expect($modal.classList.contains('show-modal')).toBe(true);
  });
  it('hides a spinner', async () => {
    const $element = document.createElement('div');
    $element.id = 'loading';
    $element.classList.add('show-modal');
    document.body.appendChild($element);
    const $modal = document.getElementById('loading');
    toggleLoadingModal();
    expect($modal.classList.contains('show-modal')).toBe(false);
  });
});
