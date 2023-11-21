import styled from 'styled-components';

export const StyledTabList = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 10px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--highlight-color);
`;

export const StyledTab = styled.li`
  list-style: none;
  display: inline-block;
`;
