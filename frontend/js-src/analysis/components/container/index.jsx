import React from 'react';
import styled from 'styled-components';

export const Container = ({ children, ...props }) => {
  return <StyledContainer {...props}>{children}</StyledContainer>;
};

export const LeftAlignedContainer = ({ children, ...props }) => {
  return <LeftAligned {...props}>{children}</LeftAligned>;
};

const StyledContainer = styled.div`
  position: relative;
  max-width: ${(props) => props.maxWidth || 'var(--max-content-width)'};
  margin: 0 auto;
`;

const LeftAligned = styled(StyledContainer)`
  margin: 0 auto 0 15px;
`;
