import React from 'react';
import styled from 'styled-components';

export const Container = ({ children, ...props }) => {
  return <StyledContainer {...props}>{children}</StyledContainer>;
};

const StyledContainer = styled.div`
  position: relative;
  max-width: ${(props) => props.maxWidth || 'var(--max-content-width)'};
  margin: 0 auto;
`;
