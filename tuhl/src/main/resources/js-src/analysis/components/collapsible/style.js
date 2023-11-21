import styled from 'styled-components';

export const CollapsibleHeader = styled.div`
  position: relative;
  cursor: pointer;
  padding: 10px 15px;

  &:hover {
    background-color: var(--page-bg-color);
  }
`;

export const CollapsibleToggle = styled.div`
  position: absolute;
  top: 3px;
  right: 10px;
`;

export const CollapsibleHeaderText = styled.h4`

`;

export const CollapsibleBody = styled.div`
  max-height: 50vh;
  overflow-y: auto;
  transition: all .3s ease-in-out;

  & > div {
    padding: 10px 15px;
  }
`;

export const Collapsible = styled.div`
  
  background-color: var(--default-bg-color);

  &.collapsed ${CollapsibleBody} {
    max-height: 0;
    padding: 0;
    overflow-y: hidden;
  }
`;