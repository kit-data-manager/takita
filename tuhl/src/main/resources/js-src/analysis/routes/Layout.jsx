import React from "react";
import { Outlet } from "react-router-dom";
import styled from 'styled-components';


const Layout = () => {
  return (
    <>
      <StyledLayout className='metaphor-analysis-tool'>
        <Outlet />
      </StyledLayout>
    </>
  );
};

export const StyledLayout = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  display: flex;
  background-color: var(--main-bg-color);

  .Sidebar {
    transition: width 0.5s ease;
    width: 5rem;
    flex-shrink: 0;
    overflow-x: hidden;
  }
  .Sidebar.expanded {
    width: 20rem;
  }
  .Sidebar.collapsed .category-header {
    opacity: 0;
  }
  .analysis-content {
    height: 100%;
    overflow-y: auto;
    position: relative;
    flex: 1 1 auto;
  }
  .main-content-area {
    padding: 10px;
  }
`;

export default Layout;
