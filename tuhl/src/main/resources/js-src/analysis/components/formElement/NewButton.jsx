import React from 'react';
import { IconButton } from '../button';
import { Icon } from '../icon';

export const NewButton = (props) => {
  return (
    <IconButton {...props}>
      <Icon glyph='plus' title={props.title} />
    </IconButton>
  );
};
