import React, { useState } from 'react';

import { useOutsideClick } from '../../hooks';
import { Dropdown } from '../dropdown';
import { Input, NewButton, SearchButton } from '../formElement';
import * as S from './styles';


const QuickSearchHeader = ({queryValue, onChangeQuery, onSubmit}) => {
  return (
    <S.QuickSearchHeader>
      <Input
        placeholder='search for concepts'
        onChange={onChangeQuery}
        value={queryValue}
      />
      <SearchButton role='button' type='submit' onClick={ev => onSubmit(ev)} />
    </S.QuickSearchHeader>
  );
};

const QuickSearchResultItem = ({ item, linkItem }) => {
  return (
    <S.QuickSearchResultItem className='QuickSearchResultItem'>
      <span>
        <b>{item.prefLabel}</b>&nbsp;
        ({ item.parentLabel })&nbsp;
      </span>
      <NewButton onClick={ev => linkItem(ev, item)} size={24} />
    </S.QuickSearchResultItem>
  );
};


export const ConceptQuickSearch = ({ onAdd, searchFunction, loggingFunction }) => {
  const [queryValue, setQueryValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  if (!searchFunction) {
    throw new Error('ConceptQuickSearch can not work without searchFunction');
  }
  if (!onAdd) {
    throw new Error('ConceptQuickSearch can not work without onAdd');
  }
  if (!loggingFunction) {
    loggingFunction = (query, selectedURI, selectedRank, annoURI) => {
      if (!query) { return; }
      const msg = `Logging the following search data:
      query: ${query}
      selectedURI: ${selectedURI}
      selectedRank: ${selectedRank}
      anno: ${annoURI}
      `;
      console.log(msg);
    };
  }

  const clearSearchResults = (ev, shouldGetLogged) => {
    if (shouldGetLogged) {
      loggingFunction(queryValue, null, null);
    }
    setSearchResults([]);
  };
  const ref = useOutsideClick(ev => clearSearchResults(ev, true));

  const onChangeQuery = (ev) => {
    ev.preventDefault();
    setQueryValue(ev.target.value);
  };

  const handleSearch = async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (queryValue) {
      const results = await searchFunction(queryValue);
      //console.log(results);
      setSearchResults(results);
    }
    else {
      setSearchResults([]);
    }
  };

  const handleAddItem = (ev, item, rank) => {
    ev.preventDefault();
    ev.stopPropagation();
    loggingFunction(queryValue, item.getUri(), rank);
    onAdd(ev, item);
    clearSearchResults();
  };

  const dropdownItems = searchResults.map((item, idx) => {
    return (
      <QuickSearchResultItem item={item} linkItem={(ev, item) => handleAddItem(ev, item, idx)} /> 
    );
  });

  return (
    <S.QuickSearch
      onKeyDown={(ev) => { if (ev.key === 'Escape') { clearSearchResults(ev, true); }}}
      ref={ref}
    >
      <Dropdown
        header={<QuickSearchHeader queryValue={queryValue} onChangeQuery={onChangeQuery} onSubmit={handleSearch} />}
        isOpen={searchResults.length !== 0}
        items={dropdownItems}
      />
    </S.QuickSearch>
  );
};