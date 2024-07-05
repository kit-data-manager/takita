/**
 * shows the loading modal/the spinner
 */
function showSpinner() {
  const spinner = document.querySelector('#loading');
  spinner.classList.add('show-modal');
}

/**
 * hides the loading modal/the spinner
 */
function hideSpinner() {
  const spinner = document.querySelector('#loading');
  spinner.classList.remove('show-modal');
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
  const modal = document.getElementById('loading');
  modal.classList.toggle('show-modal');
}
