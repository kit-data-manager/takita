import React from 'react';

import * as S from './style';

const Comment = ({ text }) => {
  return (
    <S.Comment className='Comment'>
      {text}
    </S.Comment>
  );
};

export default Comment;