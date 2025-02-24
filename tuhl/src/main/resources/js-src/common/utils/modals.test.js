// external modules
import * as bootstrap from 'bootstrap';
// internal modules
import { fetchWithSpinner, toggleLoadingModal } from './modals';

afterEach(() => {
  fetch.mockClear();
});
describe('displaying a spinner during a fetch call', () => {
  beforeEach(() => {
    document.body.innerHTML = `
    <div class="modal" tabindex="-1" role="dialog" id="loading" data-bs-backdrop="static">
        <div class="modal-dialog modal-sm" role="document">
            <div class="modal-content">
                <div class="modal-body text-center">
                    <i class='bx bxs-dog bx-tada bx-lg'></i>
                    <span>... loading ...</span>
                </div>
            </div>
        </div>
    </div>
    `;
  });

  // mocking fetch
  global.fetch = jest.fn(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('foo');
      }, 200);
    });
  });
  it('shows a spinner when a fetch call is started and hides it on successfull fetch', async () => {
    const $modal = document.getElementById('loading');
    fetchWithSpinner();
    const spinnerAtStart = $modal.classList.contains('show');
    expect(spinnerAtStart).toBe(true);
  });
  it('shows a spinner when a fetch call is started and hides it on failed fetch', async () => {
    const $modal = document.getElementById('loading');
    await fetchWithSpinner();
    const spinnerAtEnd = $modal.classList.contains('show');
    expect(spinnerAtEnd).toBe(false);
  });
});

describe('displaying a spinner', () => {
  beforeEach(() => {
    document.body.innerHTML = `
    <div class="modal" tabindex="-1" role="dialog" id="loading" data-bs-backdrop="static">
        <div class="modal-dialog modal-sm" role="document">
            <div class="modal-content">
                <div class="modal-body text-center">
                    <i class='bx bxs-dog bx-tada bx-lg'></i>
                    <span>... loading ...</span>
                </div>
            </div>
        </div>
    </div>
    `;
  });
  it('shows a spinner', () => {
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('loading'));
    toggleLoadingModal();
    expect($modal._element.classList.contains('show')).toBe(true);
  });
  it('hides a spinner', async () => {
    const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('loading'));
    $modal.toggle();
    toggleLoadingModal();
    expect($modal._element.classList.contains('show')).toBe(false);
  });
});
