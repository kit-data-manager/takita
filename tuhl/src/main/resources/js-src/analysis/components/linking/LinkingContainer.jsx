import React from 'react';
import { cloneDeep } from 'lodash';

import { DeleteButton, Input } from '../formElement';
import { LinkingBlock } from './LinkingBlock';
import * as S from './styles';


const LinkingContainer = ({ linking, onChange, onDelete, searchFunction, loggingFunction }) => {

  const onChangeSource = (ev) => {
    const updated = cloneDeep(linking);
    updated.source = ev.target.value;
    onChange(ev, updated);
  };
  const onChangeTarget = (ev) => {
    const updated = cloneDeep(linking);
    updated.target = ev.target.value;
    onChange(ev, updated);
  };

  const onChangeSourceLinkings = (ev, newLinkings) => {
    const updated = cloneDeep(linking);
    updated.source_link = newLinkings;
    onChange(ev, updated);
  };

  const onChangeTargetLinkings = (ev, newLinkings) => {
    const updated = cloneDeep(linking);
    updated.target_link = newLinkings;
    onChange(ev, updated);
  };

  return (
    <S.LinkingContainer className='LinkingContainer'>
      <S.TermMappingRow>
        <Input
          value={linking.target}
          onChange={onChangeTarget}
          placeholder='target term'
        />
        <S.MappingDelimiter>is like</S.MappingDelimiter>
        <Input
          value={linking.source}
          onChange={onChangeSource}
          placeholder='source term'
        />
      </S.TermMappingRow>
      <S.ConceptMappingRow>
        <LinkingBlock
          links={linking.target_link}
          onChange={onChangeTargetLinkings}
          searchFunction={searchFunction}
          loggingFunction={loggingFunction}
        />
        <S.MappingDelimiter>&nbsp;</S.MappingDelimiter>
        <LinkingBlock
          links={linking.source_link}
          onChange={onChangeSourceLinkings}
          searchFunction={searchFunction}
          loggingFunction={loggingFunction}
        />
      </S.ConceptMappingRow>
      <S.ButtonRow className='button-row'>
        <DeleteButton onClick={onDelete} title='Delete this linking block' />
      </S.ButtonRow>
    </S.LinkingContainer>
  );
};

export { LinkingContainer };