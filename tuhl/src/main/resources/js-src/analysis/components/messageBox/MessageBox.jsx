import React from 'react';
import { cloneDeep } from 'lodash';
import Icon from '../icon';

import * as S from './style';


const Message = ({ text, type }) => {
  switch (type) {
    case 'success':
      return <S.SuccessMessage>{text}</S.SuccessMessage>;
    case 'error':
      return <S.ErrorMessage>{text}</S.ErrorMessage>;
    case 'obsolete':
      return <S.ObsoleteMessage>{text}</S.ObsoleteMessage>;
    case 'regular':
      return <S.Message>{text}</S.Message>;
    default:
      return <S.Message>{text}</S.Message>;
  }
};

const MessageBox = ({ messages, onClear, readOnly }) => {
  const _messages = cloneDeep(messages);
  const msgList = _messages
    .reverse()
    .map((msg, idx) => {
      try {
        const { text, type, uid } = msg;
        if (idx === 0) {
          return <Message key={uid} text={text} type={type} />;
        }
        return <Message key={uid} text={text} type={'obsolete'} />;
      }
      catch {
        console.warn('invalid message received:');
        console.warn(msg);
        return undefined;
      }
    }).filter(msg => msg !== undefined); 

  return (
    <>
    { msgList.length !== 0 &&
    <S.MessageBox readOnly>
      { !readOnly &&
      <S.CloseButton onClick={onClear}>
        <Icon glyph='view-close' title='close' />
      </S.CloseButton>
      }
      { msgList }
    </S.MessageBox>
    }
    </>
  );
};

export default MessageBox;