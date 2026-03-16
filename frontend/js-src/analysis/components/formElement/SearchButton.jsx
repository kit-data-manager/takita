import React from 'react';
import { IconButton } from '../button';
import { Icon } from '../icon';

export const SearchButton = (props) => {
  return (
    <IconButton {...props}>
      <Icon glyph='search' />
    </IconButton>
  );
};
