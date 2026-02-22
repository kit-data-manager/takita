import React from 'react';
import { Link } from 'react-router-dom';

import { AbsoluteIconButton } from '../button';
import { LeftAlignedContainer } from '../container';
import Icon from '../icon';
import { H1, TinyText } from '../text';
import { StyledHeader } from './style';

const Methan = (props) => {
  return (
    <AbsoluteIconButton left='3em' top='1.5em'>
      <Icon glyph='methan' size='32' />
    </AbsoluteIconButton>
  );
};

const Header = (props) => {
  const showIcon = props.showIcon !== undefined ? props.showIcon : false;
  const target = props.target || '/';
  return (
    <StyledHeader>
      {showIcon && <Methan />}
      <LeftAlignedContainer>
        <a href={target}>
          <H1>
            Metaphor Analysis Tool
            <TinyText>(β–version)</TinyText>
          </H1>
        </a>
      </LeftAlignedContainer>
      <AbsoluteIconButton
        href='https://ruhr-uni-bochum.sciebo.de/apps/files/?dir=/SFB%201475/5_Glossary%20%26%20Annotation%20Guidelines&fileid=1537725455#pdfviewer'
        label='Annotation Guidelines'
        top='1.5em'
        right='7em'
      >
        <Icon glyph='question' />
      </AbsoluteIconButton>
      <AbsoluteIconButton
        href='mailto:gitlab-incoming+sfb1475-inf-takita-9732-issue-@ruhr-uni-bochum.de'
        label='Feedback'
        top='1.5em'
        right='3em'
      >
        <Icon glyph='feedback' />
      </AbsoluteIconButton>
    </StyledHeader>
  );
};

export default Header;
