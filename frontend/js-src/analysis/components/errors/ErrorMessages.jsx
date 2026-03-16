import React from 'react';
import { MessageBox } from '../messageBox';
import * as S from './style';

export const ErrorMessages = ({ messages, className }) => {
  return (
    <S.ErrorMessages className={className}>
      <h2 className='error-heading'>Ooops!</h2>
      <p className='error-generic-text'>
        Sorry, something unexpected has happened. More details below: <br />
      </p>
      <MessageBox messages={messages} readOnly />
    </S.ErrorMessages>
  );
};
