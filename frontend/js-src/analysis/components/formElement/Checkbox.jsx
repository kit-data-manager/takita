import React from 'react';
import { Icon } from '../icon';
import { StyledCheckboxWrapper, StyledHiddenInput, StyledLabel } from './style';

export const Checkbox = (props) => {
  return (
    <StyledLabel>
      <StyledCheckboxWrapper
        disabled={props.disabled || false}
        align={props.align || 'center'}
        data-cy={props.dataCy ? `${props.dataCy}-${props.checked ? 'checked' : 'unchecked'}` : null}
      >
        {props.checked ? <Icon glyph='checkmark' /> : <Icon glyph='checkbox' />}
        <StyledHiddenInput
          type='checkbox'
          id={props.id}
          checked={props.checked}
          disabled={props.disabled || false}
          onChange={props.onChange}
          data-cy={props.dataCy}
        />
        {props.children}
      </StyledCheckboxWrapper>
    </StyledLabel>
  );
};
