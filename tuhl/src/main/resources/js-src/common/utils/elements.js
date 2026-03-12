/**
 * Create <option> Element with a specific label and value.
 * @param {String} label what is used both as label and value of the option
 * @returns {HTMLElement} a <option> element
 */
export function createOption(label) {
  const option = document.createElement('option');
  option.value = label;
  const text = document.createTextNode(label);
  option.appendChild(text);
  return option;
}
