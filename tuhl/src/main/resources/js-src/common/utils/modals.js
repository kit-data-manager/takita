function showSpinner() {
  const spinner = document.querySelector('#loading');
  spinner.classList.add('show-modal');
}

function hideSpinner() {
  const spinner = document.querySelector('#loading');
  spinner.classList.remove('show-modal');
}

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
