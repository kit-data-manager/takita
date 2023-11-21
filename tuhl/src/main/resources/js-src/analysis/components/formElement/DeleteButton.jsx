import React from 'react';
import { IconButton } from '../button';
import { Icon } from '../icon';

export const DeleteButton = (props) => {
  return (
    <IconButton {...props}>
      <Icon glyph='delete' title={props.title} size={props.size} />
    </IconButton>
  );
};