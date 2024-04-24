// external modules
import $ from 'jquery';

export function initializeTopbar() {
  // TODO: maybe the following two jQuery functions should be somewhere else
  // from editor.js
  // show the animated book as loading icon whenever an ajax call is running
  $(document)
    .ajaxStart(function () {
      const modal = document.getElementById('loading');
      modal.classList.toggle('show-modal');
    })
    .ajaxStop(function () {
      const modal = document.getElementById('loading');
      modal.classList.toggle('show-modal');
    });

  // adapted from main_page.html - may be exchanged in the future
  $(document).ready(function () {
    let userName = window.TL_VARIABLES.user.name;
    if (userName === 'default') {
      document.getElementById('pseudonymInputModal').classList.toggle('show-modal');
    }
  });

  // adding eventhandlers
  // go home button
  document.getElementById('goHomeButton').addEventListener('click', goHome);

  // adding eventhandler for the pseudonym change in the topbar
  document.getElementById('pseudonymEditButton').addEventListener('click', clickButton);

  // adding eventhandler for pseudonym change to the pseudonym input modal
  document
    .querySelector('#pseudonymInputModal > div:nth-child(1) > form:nth-child(1)')
    .addEventListener('submit', (event) => setPseudonym(event, 'pseudonymInitInput'));
}

// returning to table view of repository data
function goHome() {
  location.href = window.CONTEXTPATH;
}

function clickDe() {
  console.log('click de');
  $.ajax({
    type: 'GET',
    url: window.CONTEXTPATH + 'assistance/lang/de',
    dataType: 'text',
  });
  return true;
}

function clickEn() {
  console.log('click en');
  $.ajax({
    type: 'GET',
    url: window.CONTEXTPATH + 'assistance/lang/en',
    dataType: 'text',
  });

  return true;
}

function getHelp() {
  location.href = window.CONTEXTPATH + 'assistance/help';
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
    // TODO: this looks suspiciously like it would break with different CONTEXTPATHs...
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
