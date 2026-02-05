/**
 * Called by getPossibleClasses() hook. It returns the classes specific to a project (linked
 * to classes assigned in drawAnnos() function).
 * Note: to have these classes do smth, the css has to be written (see editor_text.css). css for
 * 'backgroundOne', 'backgroundTwo', 'underline', 'underlineSecond' and 'defaulthighlight'
 * is available.
 * TODO: Implement this function for your project
 *
 * @returns {[String]} holding all classes that can be assigned/removed
 */
export function getSpecificClasses() {
  // TODO: Customise the following array
  return ['backgroundOne', 'backgroundTwo', 'underline', 'underlineSecond'];
}

/**
 * assigns css-classes to an element.
 * TODO: Customize the cases to achieve custom highlighting of different annotations.
 * This is linked to classes to be removed in removeStyles() function.
 *
 * @param {Element} $element to be highlihgted/assigned a css class
 * @param {Object} annotation the annotation
 * @param {Integer} index of the target in the targets(svg) array of the annotation. Used to
 * determine if the targetted $element is the last entry in the array
 * @param {Boolean} alreadyHighlighted true, if any target/word is already highlighted as another
 * annotation targets the same word
 * false, if none of the targets/words of the annotation is highlighted
 */
export function assignStyle($element, annotation, index, alreadyHighlighted) {
  const annotationType = getTypeOfAnnotation(annotation);
  // different highlights for different annotation types
  switch (annotationType) {
    case 'underline':
      // if a word is not highlighted add the "metaphor" class, if it is
      // already highlighted add "metaphorSecond"
      if (!alreadyHighlighted) {
        $element.classList.add('underline');
      } else {
        $element.classList.add('underlineSecond');
      }

      // if a word is followed only by whitespace add the "whitespaceAfter" class
      // unless its the last word of the target.
      // TODO: this doesn't work for overlapping annotations. The "whitespaceAfter" class will
      // be assigned even if the word is the last target for one annotation as the word is part of multiple
      // annotations and it might be the last target of one annotation but not the other one
      // This is needed to create overlapping boxshadows.
      // check if nextSibling is null first
      if ($element.nextSibling !== null) {
        if ($element.nextSibling.textContent.trim() === '' && !(index === annotation.svg.length - 1)) {
          $element.classList.add('whitespaceAfter');
        }
      }
      break;
    case 'backgroundOne':
      $element.classList.add('backgroundOne');
      break;
    case 'backgroundTwo':
      $element.classList.add('backgroundTwo');
      break;
    default:
      $element.classList.add('defaulthighlight');
  }
}

/**
 * gets the type of an annotation based on custom logic.
 * Implement your logic here. You can access the complete annotation
 * and decide about the type based on that. For example you can use
 * the value of a body or the presence of a body with a specific purpose.
 * The type you assign here, will be used in assignStyle() above to assign
 * CSS classes. In the default configuration the type is the same as the
 * CSS class, but it doesn't have to be.
 *
 * @param {Object} annotation complete annotation
 * @returns {String} type of an annotation
 */
export function getTypeOfAnnotation(annotation) {
  let type = 'defaulthighlight';
  if (annotation.tags.length > 0) {
    type = 'backgroundOne';
  }
  if (annotation.textcards) {
    annotation.textcards.forEach((textcard) => {
      if (textcard.purpose) {
        switch (textcard.purpose) {
          case 'commenting':
            type = 'underline';
            break;
          case 'classifying':
            type = 'backgroundTwo';
            break;
        }
      }
    });
  }
  return type;
}

/**
 * check if any target of an annotation is already highlighted
 *
 * @param {[String]}} targets holds all targets of an annotation
 * @returns {Boolean} true, if any target/word is already highlighted as another
 * annotation targets the same word
 * false, if none of the targets/words of the annotation is highlighted
 */
export function checkIsATargetAlreadyHighlighted(selectors) {
  const alreadyHighlighted = selectors.some((selector) => {
    switch (selector.type) {
      case 'XPathSelector': {
        const values = selector.value instanceof Array ? selector.value : [selector.value];
        return values.some((value) => {
          const targetXmlId = value.split('"')[1];
          if (document.getElementById(targetXmlId).classList.contains('underline')) {
            return true;
          } else {
            return false;
          }
        });
      }
      case 'TextQuoteSelector':
        console.warn('Implement textQuoteSelector highlighting pls');
        break;
    }
  });
  return alreadyHighlighted;
}

/**
 * custom highlighting function. It is used as the highlightAnnotationFunction() in
 * highlight/target.js
 *
 * @param {Object} annotation to have its target highlighted
 */
export function customHighlighting(annotation) {
  // check if any target has the class "underline" and
  // therefore, is already highlighted
  const alreadyHighlighted = checkIsATargetAlreadyHighlighted(annotation.svg);
  // adding classes to highlight annotations
  annotation.svg.forEach((selector, index) => {
    switch (selector.type) {
      case 'XPathSelector': {
        const values = selector.value instanceof Array ? selector.value : [selector.value];
        values.forEach((value) => {
          const targetXmlId = value.split('"')[1];
          const targetElement = document.getElementById(targetXmlId);
          targetElement.classList.add('selected');
          assignStyle(targetElement, annotation, index, alreadyHighlighted);
        });

        break;
      }
      case 'TextQuoteSelector':
        console.warn('Implement textQuoteSelector highlighting pls');
        break;
    }
  });
}
