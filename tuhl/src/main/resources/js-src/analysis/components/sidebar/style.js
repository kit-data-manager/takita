import styled from 'styled-components';

const StyledSidebarHeader = styled.div`
  font-size: 1.2rem;
  text-transform: uppercase;
  line-height: 1.8rem;
  color: white;
  margin-bottom: 1.3rem;
  white-space: nowrap;
`;

const StyledSidebarItem = styled.li`
  display: flex;
  align-items: center;
  position: relative;
  padding: 0.5rem 0.9rem;
  margin-bottom: 1.1rem;
  color: var(--sidebar-color);
  cursor: pointer;
  transition: 0.5s ease;

  &:hover {
    color: var(--highlight-color);
  }
`;

const StyledSidebarSection = styled.ul`
  padding-top: 1rem;
  border-bottom: 1px solid var(--sidebar-color);
  list-style: none;
`;

const StyledSideBar = styled.div`
  padding-left: 10px;
  padding-top: 1rem;
  height: 100%;
  background-color: var(--sidebar-bg-color);
  transition: all 0.5s ease;
  overflow-y: scroll;
  z-index: 5;
`;

const ToggleExpand = styled.span`
  color: white;
  cursor: pointer;
  display: block;
  margin: 0 1rem 0 auto;
  width: fit-content;
`;

export { StyledSideBar, StyledSidebarHeader, StyledSidebarItem, StyledSidebarSection, ToggleExpand };
