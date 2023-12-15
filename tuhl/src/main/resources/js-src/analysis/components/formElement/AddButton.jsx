import React from 'react';
import { IconButton } from '../button';
import { Icon } from '../icon';

export const AddButton = (props) => {
  return (
    <IconButton {...props}>
      <Icon glyph='new' size={props.size || 32} title={props.title} />
    </IconButton>
  );
};
