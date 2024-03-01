// toggle for book and annotation overwiew
// can be used for all divs / cards
export function toggleOverview(divId) {
  let classDomTokens = document.getElementById(divId).classList;
  let buttonElement = document.getElementById(divId + 'Button');
  if (classDomTokens.contains('is-hidden')) {
    classDomTokens.remove('is-hidden');
    if (buttonElement) {
      buttonElement.parentElement.classList.add('active');
      document.getElementById(divId).scrollIntoView();
    }
  } else {
    classDomTokens.add('is-hidden');
    if (buttonElement) {
      buttonElement.parentElement.classList.remove('active');
    }
  }
}
