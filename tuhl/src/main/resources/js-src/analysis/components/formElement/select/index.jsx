import React from 'react';
import Icon from '../../icon';
import { StyledSelect, Container, IconContainer } from './style';

export const Select = (props) => (
  <Container>
    <StyledSelect {...props} />
    <IconContainer>
      <Icon glyph={'down-caret'} size={20} />
    </IconContainer>
  </Container>
);
