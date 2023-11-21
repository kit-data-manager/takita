import React from 'react';
import * as S from './style';

export const CommentField = (props) => {
  const { value, onChange, placeholder } = props;

  return (
    <S.CommentField>
      <S.CommentFieldTextarea
        value={value} onChange={(ev) => onChange(ev, ev.target.value)} placeholder={placeholder}
      />
    </S.CommentField>
  );
};