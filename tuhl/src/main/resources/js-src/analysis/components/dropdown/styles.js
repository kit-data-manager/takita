import styled from 'styled-components';

export const DropDownContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  position: relative;
`;

export const DropDownHeader = styled.div`
  margin-bottom: 0.8rem;
  padding: 0.4rem 0;
  background-color: var(--default-bg-color);
  color: #444;
`;

export const DropDownListContainer = styled.div`
  position: absolute;
  right: 0;
  top: 50px;
  z-index: 999;
`;

export const DropDownList = styled.ul`
  padding: 0 5px 0 1rem;
  margin: 0;
  background: var(--default-bg-color);
  border: 2px solid var(--default-border-color);
  box-sizing: border-box;

  max-height: 305px;
  overflow-y: auto;

  margin-left: auto;
  width: max-content;
  max-width: 250px;

  @media (min-width: 1200px) {
    min-width: 300px;
    max-width: 500px;
  }

  &:first-child {
    padding-top: 0rem;
  }
`;

export const DropDownItem = styled.li`
  list-style: none;
  margin-bottom: 0.5rem;
  position: relative;
`;
