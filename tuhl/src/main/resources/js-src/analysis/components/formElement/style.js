import styled, { css } from 'styled-components';
import { FlexRow } from '../flex';

export const StyledLabel = styled.label`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 0px;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: -0.4px;
  color: var(--default-color);
  position: relative;

  a {
    text-decoration: underline;
  }

  &:hover > input,
  &:hover > textarea {
    border-color: ${props =>
      props.disabled ? 'var(--default-border-color)' : 'var(--default-border-color)'};
  }
  &:hover > input:focus,
  &:hover > textarea:focus {
    border-color: ${props =>
      props.disabled ? 'var(--default-bg-color' : 'var(--default-bg-color)'};
  }
`;

export const StyledPrefixLabel = styled.label`
  display: flex;
  width: 100%;
  margin-top: 4px;
  font-size: 14px;
  font-weight: 400;
  color: var(--default-color);
  white-space: nowrap;
  text-overflow: ellipsis;
  > input {
    margin-left: 2px;
  }
  &:hover > input {
    border-color: ${props =>
      props.disabled ? 'var(--default-border-color)' : 'var(--default-border-color)'};
  }
`;

export const StyledInput = styled.input`
  flex: 1 0 auto;
  background: ${props =>
    props.disabled ? 'var(--default-bg-color)' : 'var(--default-bg-color)'};
  font-weight: 400;
  width: 100%;
  font-size: 14px;
  border: 2px solid
    ${props =>
      props.disabled ? 'var(--default-border-color)' : 'var(--default-border-color)'};
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 2px;
  box-shadow: none;
  ${props =>
    props.type === 'checkbox' &&
    css`
      flex: initial;
      width: initial;
      margin-right: 0.5em;
    `} &::placeholder {
    color: 'var(--default-color)';
  }
  &::-webkit-input-placeholder {
    color: 'var(--default-color)';
  }
  &:-moz-placeholder {
    color: 'var(--default-color)';
  }
  &:-ms-input-placeholder {
    color: 'var(--default-color)';
  }
  &:focus {
    border-color: 'var(--default-border-color)';
  }
  &[type='file'] {
    position: absolute;
    left: -9999px;
    top: -9999px;
    visibility: hidden;
  }
`;

export const StyledHiddenInput = styled.input`
  visibility: hidden;
  width: 0;
  height: 0;
`;

export const StyledCheckboxWrapper = styled(FlexRow)`
  color: var(--default-color);
  display: flex;
  align-items: ${props => props.align};
  line-height: 1.4;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  &:hover {
    color: ${({ theme, disabled }) =>
      disabled ? 'var(--default-color)' : 'var(--default-color)'};
  }
  > div {
    margin-left: -6px;
    margin-right: 6px;
  }
  > a {
    text-decoration: none;
    color: var(--default-color);
    font-weight: 600;
    border-bottom: 2px solid transparent;
    position: relative;
    padding-bottom: 0px;
    &:hover {
      border-bottom: 2px solid var(--default-border-color);
      padding-bottom: 2px;
    }
  }
`;

export const InputOverlay = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: var(--default-color);
  background-color: var(--default-bg-color);
  opacity: 0.6;
  padding: 8px;
  border-radius: ${props =>
    props.type === 'user' ? `${props.size}px` : '8px'};
  opacity: ${props => (props.visible ? '1' : '0')};
  &:hover {
    opacity: 1;
    + img,
    + div {
      opacity: 0.25;
    }
  }
  &:hover div {
  }
`;
