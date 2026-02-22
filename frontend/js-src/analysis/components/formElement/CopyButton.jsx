import React from 'react';

import { IconButton } from '../button';
import { Icon } from '../icon';

export const CopyButton = ({ value }) => {
  const handleClick = async (ev) => {
    ev.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      console.log(`"${value}" copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <IconButton title='Copy URL to clipboard' onClick={handleClick}>
      <Icon glyph='copy' />
    </IconButton>
  );
};
