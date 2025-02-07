import * as bootstrap from 'bootstrap';
/**
 * shows the loading modal/the spinner
 */
function showSpinner() {
  const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('loading'));
  $modal.show();
}

/**
 * hides the loading modal/the spinner
 */
function hideSpinner() {
  const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('loading'));
  $modal.hide();
}

/**
 * wrapper for fetch calls. For the duration of the fetch call a spinner will
 * be displayed, which prevents user interaction.
 * This function is usually used to display a spinner for fetch(); for $ajax() see
 * toogleLoadingModal().
 *
 * @param {String} url to be called
 * @param {Object} config containing the parameters for the fetch call
 * @returns the response or an error
 */
export async function fetchWithSpinner(url, config = {}) {
  showSpinner();
  return fetch(url, config)
    .then((response) => {
      hideSpinner();
      return response;
    })
    .catch((error) => {
      hideSpinner();
      return error;
    });
}

/**
 * Toggle (show/hide) the loading modal (it acts like a spinner during async calls;
 * by default it is a book turning pages).
 * This function is usually used to display a spinner for $ajax(); for fetch() see
 * fetchWithSpinner().
 */
export function toggleLoadingModal() {
  const $modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('loading'));
  $modal.toggle();
}
