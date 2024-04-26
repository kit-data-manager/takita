import { fetchWithSpinner } from '../utils/modals';

/**
 * Initialize topbar inputs and make sure that users input their pseudonym if
 * they haven't already.
 * @param {Element} $topbar HTML element where the inputs/buttons are located
 * @param {Element} $pseudonymModal HTML element which allows users to input their pseudonym
 * @param {String} userName available for calling code in `window.TL_VARIABLES.user.name`
 */
export function initializeTopbar($topbar, $pseudonymModal, userName) {
  /* Show pseudonym modal if userName is not yet set. */
  if (userName === 'default') {
    $pseudonymModal.classList.add('show-modal');
  }

  /* Add event handlers for all the buttons and inputs. */
  // go home button
  $topbar.querySelector('#goHomeButton').addEventListener('click', goHome);
  // pseudonym input in the topbar
  $topbar.querySelector('#pseudonymEditButton').addEventListener('click', clickButton);

  // pseudonym input in the pseudonym modal
  $pseudonymModal
    .querySelector('div:nth-child(1) > form:nth-child(1)')
    .addEventListener('submit', (event) => setPseudonym(event, 'pseudonymInitInput'));
}

// returning to table view of repository data
function goHome() {
  location.href = window.CONTEXTPATH;
}

function clickButton() {
  let button = document.getElementById('editButton');
  let input = document.getElementById('pseudonymInput');
  let edit = window.TL_VARIABLES.buttons.edit;
  let ok = window.TL_VARIABLES.buttons.ok;
  if (button.classList.contains('bx-edit')) {
    button.classList.remove('bx-edit');
    button.classList.add('bx-check');
    input.disabled = false;
  } else {
    button.classList.remove('bx-check');
    button.classList.add('bx-edit');
    input.disabled = true;
    // the "event" argument is the default event triggered by the click on "#editButton"
    setPseudonym(event, 'pseudonymInput');
  }
}

function setPseudonym(event, pseudonymForm) {
  // prevent the default reload of the page on submit-events
  event.preventDefault();
  let input = $('#' + pseudonymForm).val();
  // $('#pseudonymInput').val();
  $.ajax({
    type: 'GET',
    url: '../assistance/' + input,
    dataType: 'text',
    success: function (responseData) {
      console.log('Response from succesfull pseudonym update: ', responseData);
      //location.href = '?lang=' + responseData;
      // reload the page with the new pseudonym
      location.reload();
    },
    error: function (responseData) {
      console.error(responseData);
    },
  });
}
