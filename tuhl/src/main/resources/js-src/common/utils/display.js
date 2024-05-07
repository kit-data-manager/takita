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
 * Set opacity of one or more HTML element(s) to make them (in-)visible without
 * affecting the page flow.
 * @param {Element | NodeList} $selection
 * @param {Boolean} isHidden
 */
export function setZeroOpacity($selection, isHidden) {
  const $elements = $selection instanceof HTMLElement ? [$selection] : $selection;
  if (isHidden) {
    $elements.forEach((element) => element.classList.add('zeroOpacity'));
  } else {
    $elements.forEach((element) => element.classList.remove('zeroOpacity'));
  }
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
      // TODO: Maybe make this more robust, in cases where scrolling is not available (like during testing)?
      $element.scrollIntoView();
    }
  } else {
    if ($button) {
      $button.parentElement.classList.remove('active');
    }
  }
}

/**
 * Set visibility of HTML element or NodeList by adding/removing a CSS class.
 * @param {Element | NodeList} $selection affected HTML element(s)
 * @param {Boolean} isVisible whether the element(s) should be visible
 */
export function setVisibility($selection, isVisible) {
  const $elements = $selection instanceof HTMLElement ? [$selection] : $selection;
  if (isVisible) {
    $elements.forEach((element) => element.classList.remove('is-hidden'));
  } else {
    $elements.forEach((element) => element.classList.add('is-hidden'));
  }
}

/**
 * Toggle the state (disabled, enabled) of a button and hiding/showing it
 *
 * @param {Element} $button
 */
export function toggleButtonState($button) {
  toggleVisibility($button);
  const buttonWasDisabled = $button.disabled;
  if (buttonWasDisabled) {
    $button.disabled = false;
  } else {
    $button.disabled = true;
  }
}

/**
 * Expand/collapse an element by showing/hiding it and displaying the correct
 * boxIcons
 *
 * @param {Element} $element affected HTML element
 */
export function toggleExpand($element) {
  toggleVisibility($element);
  toggleBoxIcon($element, 'bx-chevron-down', 'bx-chevron-right');
}
