import { useRef, useEffect } from 'react';

/**
 * Hook to do stuff whenever a click happens _outside_ of the component
 * which makes use of it.
 */
const useOutsideClick = (handler) => {
  const ref = useRef();

  useEffect(() => {
    // Add an event handler for click events
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };
    document.addEventListener('click', handleClick);

    // Remove it again on unmount.
    return () => document.removeEventListener('click', handleClick);
  }, [ref, handler]);

  return ref;
};

export { useOutsideClick };
