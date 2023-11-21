import styled from 'styled-components';

export const StyledButton = styled.button`
  font-weight: 600;
  color: var(--default-color);
  background: var(--default-bg-color);
  border: ${props => (props.border ? '1px solid var(--default-border-color);' : undefined)};
  border-radius: 5px;
  padding: 6px 12px;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: ${props => (props.disabled ? '0.6' : '1')};
  line-height: 1.2;
  transition: box-shadow 0.2s ease-in-out;

  .icon:not(:first-child):not(:last-child) {
    margin-right: 4px;
  }

  &:hover {
    color: var(--highlight-color);
    background: var(--highlight-bg-color);
  }

  &:focus {
    //box-shadow: 0 0 0 2px var(--default-bg-color), 0 0 0 4px var(--highlight-color);
    //transition: box-shadow 0.2s ease-in-out;
  }

  &:active {
    //box-shadow: 0 0 0 2px var(--default-bg-color), 0 0 0 4px var(--highlight-color);
    //transition: box-shadow 0.2s ease-in-out;
  }
`;

export const StyledIconButton = styled(StyledButton)`
  box-sizing: border-box;
  padding: 2px;

  svg {
    vertical-align: middle;
  }
`;

export const StyledAbsoluteIconButton = styled(StyledIconButton)`
  position: absolute;
  top: ${props => props.top || undefined};
  left: ${props => props.left || undefined};
  right: ${props => props.right || undefined};
`;

export const StyledPrimaryButton = styled(StyledButton)`
  background: var(--primary-bg-color);
  border: 1px solid var(--primary-border-color);
  color: var(--primary-color);

  &:hover {
    
  }
  &:focus {

  }
  &:active {

  }
`;

export const StyledSecondaryButton = styled(StyledButton)`
  background: var(--secondary-bg-color);
  border: 1px solid var(--secondary-border-color);
  color: var(--secondary-color);
`;

export const StyledOutlineButton = styled(StyledButton)`
  background: transparent;
  border: 1px solid var(--default-bg-color);
  transition: box-shadow 0.2s ease-in-out;
`;

export const StyledPrimaryOutlineButton = styled(StyledOutlineButton)`
  background: transparent;
  border: 1px solid var(--primary-border-color);
  color: var(--primary-bg-color);
`;