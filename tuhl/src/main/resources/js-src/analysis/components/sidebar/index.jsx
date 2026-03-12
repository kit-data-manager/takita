import React, { useState } from 'react';
import { wrapLink } from '../linkUtils';
import { StyledSideBar, StyledSidebarHeader, StyledSidebarItem, StyledSidebarSection, ToggleExpand } from './style';

/**
 * AnalysisSidebar
 *
 * Render a sidebar with various sections, each containing
 * a number of SidebarLinks. It expects a segments prop with
 * the following structure:
 * [
 *  {
 *    label: "Section Label",
 *    routes: [
 *      {
 *        label: "Label of first item",
 *        route: <either a route or a callback to trigger on click>,
 *      }
 *    ]
 *  }
 * ]
 *
 * @param {*} props - should at least contain segments
 * @returns React Component
 */
const AnalysisSidebar = (props) => {
  const [expanded, setExpanded] = useState(true);

  const expButton = (
    <ToggleExpand className='toggle-expand' onClick={(ev) => setExpanded(true)}>
      ▶
    </ToggleExpand>
  );
  const colButton = (
    <ToggleExpand className='toggle-expand' onClick={(ev) => setExpanded(false)}>
      ◀
    </ToggleExpand>
  );
  let classes = ['anno-side-bar', 'Sidebar'];
  classes.push(expanded ? 'expanded' : 'collapsed');
  const cls = classes.join(' ');

  const segments = props.segments || [];
  const sections = segments.map((seg) => {
    const items = seg.routes.map(({ label, route, nav, icon }, idx) => {
      const visibleLabel = expanded || !icon ? label : icon;
      if (typeof route === 'function') {
        return <SidebarLink label={visibleLabel} onClick={route} key={idx} />;
      } else {
        const cls = nav === true ? 'navigation' : '';
        return <SidebarLink label={visibleLabel} to={route} key={idx} className={cls} isNav={nav} />;
      }
    });
    return (
      <SidebarSection label={seg.label} key={seg.label}>
        {items}
      </SidebarSection>
    );
  });

  return (
    <Sidebar cls={cls} toggleExpanded={expanded ? colButton : expButton}>
      {sections}
    </Sidebar>
  );
};

const SidebarHeader = (props) => {
  return <StyledSidebarHeader className='category-header'>{props.children}</StyledSidebarHeader>;
};

const SidebarItem = ({ label, ...rest }) => {
  return <StyledSidebarItem {...rest}>{label}</StyledSidebarItem>;
};

const SidebarLink = (props) => wrapLink(SidebarItem, props);

const SidebarSection = ({ label, children }) => {
  return (
    <StyledSidebarSection className='features-list'>
      {label && <SidebarHeader>{label}</SidebarHeader>}
      {children}
    </StyledSidebarSection>
  );
};

const Sidebar = (props) => {
  return (
    <StyledSideBar className={props.cls}>
      {props.toggleExpanded}
      {props.children}
    </StyledSideBar>
  );
};

export { AnalysisSidebar, Sidebar, SidebarSection, SidebarHeader, SidebarItem };
