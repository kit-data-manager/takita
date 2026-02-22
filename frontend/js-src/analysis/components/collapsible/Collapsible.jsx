import React, { useState } from 'react';
import Icon from '../icon';

import * as S from './style';

const Collapsible = ({ headerText, body, startCollapsed }) => {
  const [collapsed, setCollapsed] = useState(startCollapsed);

  const toggleCollapsed = (_ev) => {
    setCollapsed(!collapsed);
  };

  return (
    <S.Collapsible className={collapsed ? 'Collapsible collapsed' : 'Collapsible extended'}>
      <S.CollapsibleHeader className='CollapsibleHeader' onClick={toggleCollapsed}>
        <S.CollapsibleHeaderText>{headerText}</S.CollapsibleHeaderText>
        <S.CollapsibleToggle>
          <Icon glyph={collapsed ? 'down-caret' : 'up-caret'} />
        </S.CollapsibleToggle>
      </S.CollapsibleHeader>

      <S.CollapsibleBody className='CollapsibleBody'>
        <div>{body}</div>
      </S.CollapsibleBody>
    </S.Collapsible>
  );
};

export default Collapsible;
