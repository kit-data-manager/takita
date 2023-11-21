import React from 'react';
import { StyledInput, StyledLabel } from './style';

export const Input = (props) => {
  return (
    <StyledLabel htmlFor={props.name} {...props}>
      {props.children}
      <StyledInput
        id={props.id}
        name={props.name}
        type={props.inputType}
        defaultValue={props.defaultValue}
        value={props.value}
        placeholder={props.placeholder}
        onChange={props.onChange}
        autoFocus={props.autoFocus}
        disabled={props.disabled}
      />
    </StyledLabel>
  );
};