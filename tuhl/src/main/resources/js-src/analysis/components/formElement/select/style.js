import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const IconContainer = styled.div`
  position: absolute;
  z-index: 1;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  color: var(--default-color);
`;

export const StyledSelect = styled.select`
  padding: 8px 40px 8px 16px;
  border: none;
  border: 1px solid var(--default-border-color);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: none;
  background: var(--default-bg-color);
  background-image: none;
  -webkit-appearance: none;
  font-weight: 400;
  font-size: 14px;
  color: var(--default-color);
  text-align: center;
  text-align-last: center;
  option {
    text-align: left;
  }
  &:hover {
    cursor: pointer;
    background: var(--default-bg-color);
  }
  &:focus {
    box-shadow:
      0 0 0 2px var(--default-bg-color),
      0 0 0 4px var(--default-border-color);
    transition: box-shadow 0.2s ease-in-out;
  }
  &:active {
    box-shadow:
      0 0 0 2px var(--default-bg-color),
      0 0 0 4px var(--default-border-color);
    transition: box-shadow 0.2s ease-in-out;
  }
`;
