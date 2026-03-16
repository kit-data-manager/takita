import React from 'react';
import styled from 'styled-components';

const FilterBar = ({ filterText, onFilter, onClear }) => {
  return (
    <FilterContainer>
      <TextField
        id='search'
        type='text'
        placeholder='filter analyses'
        aria-label='Filter Input'
        value={filterText}
        onChange={onFilter}
      />
      <ClearButton type='button' onClick={onClear}>
        X
      </ClearButton>
    </FilterContainer>
  );
};

export default FilterBar;

const TextField = styled.input`
  height: 32px;
  width: 200px;
  border-radius: 3px;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid #bbb;
  padding: 0 32px 0 16px;

  &:hover {
    cursor: pointer;
  }
`;

const ClearButton = styled.button`
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  height: 34px;
  width: 32px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FilterContainer = styled.header`
  position: relative;
  display: flex;
  flex: 1 1 auto;
  box-sizing: border-box;
  align-items: center;
  padding: 4px 16px 4px 24px;
  width: 100%;
  justify-content: flex-end;
  flex-wrap: wrap;
  min-height: 52px;
`;
