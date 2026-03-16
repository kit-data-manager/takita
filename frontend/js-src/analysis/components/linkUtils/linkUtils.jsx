import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const A = styled.a`
  display: flex;
  align-items: center;
  flex: none;
`;

export const StyledLink = styled(NavLink)`
  display: flex;
  flex: none;
  align-items: center;

  &.active.navigation {
    background-color: var(--highlight-bg-color);
    color: var(--highlight-color);
  }
`;

export const wrapLink = (Component, props) => {
  const { href, to, target, children, disabled, isNav, ...rest } = props;

  const button = (
    <Component disabled={disabled} {...rest}>
      {children}
    </Component>
  );

  if (href) {
    return (
      <A href={href} rel={!target ? 'noopener noreferrer' : undefined} target={target || '_blank'}>
        {button}
      </A>
    );
  }
  if (to) {
    return (
      <StyledLink to={to} end className={isNav ? 'navigation' : ''}>
        {button}
      </StyledLink>
    );
  }
  return button;
};
