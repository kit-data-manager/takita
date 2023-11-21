import React from 'react';
import { DeleteButton } from '../formElement';
import * as S from './styles';


export const LinkedConcepts = ({ concepts, onDelete }) => {
  const _concepts = concepts || [];
  const rows = _concepts.map(c => {
    return (
      <S.LinkedConceptItem key={c.uri}>
        <span>
          <S.ConceptA href={c.uri} target='_blank' rel='noreferrer' title='Open Concept in Skosmos'>{ c.prefLabel }</S.ConceptA>&nbsp;
          <i>({c.parentLabel})</i>
        </span>
        <DeleteButton onClick={ev => onDelete(ev, c)} title='Unlink this concept' />
      </S.LinkedConceptItem>
    );
  });

  return (
    <S.LinkedConcepts className='LinkedConcepts'>
      { rows }
    </S.LinkedConcepts>
  );
};