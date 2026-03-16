import React from 'react';

import * as S from './styles';

export const Dropdown = ({ isOpen, header, items }) => {
  // I think we can make this into a controlled component...
  // const [isOpen, setIsOpen] = useState(false);
  const listItems = items.map((item, idx) => {
    const key = item.uri || idx;
    return <S.DropDownItem key={key}>{item}</S.DropDownItem>;
  });

  return (
    <S.DropDownContainer>
      <S.DropDownHeader>{header}</S.DropDownHeader>
      {isOpen && (
        <S.DropDownListContainer>
          <S.DropDownList>{listItems}</S.DropDownList>
        </S.DropDownListContainer>
      )}
    </S.DropDownContainer>
  );
};
