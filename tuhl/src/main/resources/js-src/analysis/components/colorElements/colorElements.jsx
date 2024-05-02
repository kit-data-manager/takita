import React from 'react';
import * as S from './style';

export const ColorCircle = ({ color, width, height }) => {
  return <S.ColorCircle color={color} width={width} height={height} />;
};

export const ColorBar = ({ borderRadius, color, height, width }) => {
  return <S.ColorBar borderRadius={borderRadius} color={color} height={height} width={width} />;
};
