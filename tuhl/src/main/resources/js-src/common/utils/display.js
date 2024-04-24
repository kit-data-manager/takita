/**
 * Switch between two different icons by changing CSS classes.
 * @param {Element} $element the element which contains the icons
 * @param {String} iconA CSS class to display first icon
 * @param {String} iconB CSS class to display second icon
 */
export function toggleBoxIcon($element, iconA, iconB) {
  $element.classList.toggle(iconA);
  $element.classList.toggle(iconB);
}

/**
 * Toggle opacity of one or more HTML element(s) to make them invisible without
 * affecting the page flow.
 *
 * @param {Element | NodeList} $selection the HTML element(s) which should get toggled
 */
export function toggleOpacity($selection) {
  const $elements = $selection instanceof HTMLElement ? [$selection] : $selection;
  $elements.forEach((element) => element.classList.toggle('zeroOpacity'));
}

/**
 * Toggle visibility of an HTML element, and optionally
 * designate the responsible button as active.
 *
 * @param {Element} $element the HTML element (probably some div) which should get toggled
 * @param {Element} [$button] the button element which should appear "active" state if element was made visible
 */
export function toggleVisibility($element, $button) {
  // let buttonElement = document.getElementById(divId + 'Button');
  const elementWasHidden = $element.classList.contains('is-hidden');
  $element.classList.toggle('is-hidden');
  if (elementWasHidden) {
    if ($button) {
      $button.parentElement.classList.add('active');
      // Maybe make this more robust, in cases where scrolling is not available (like during testing)?
      $element.scrollIntoView();
    }
  } else {
    if ($button) {
      $button.parentElement.classList.remove('active');
    }
  }
}
