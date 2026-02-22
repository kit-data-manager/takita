import React from 'react';
import { cloneDeep } from 'lodash';

import { ConceptQuickSearch } from '../conceptSearch';
import { LinkedConcepts } from './LinkedConcepts';
import * as S from './styles';

export const LinkingBlock = ({ links, onChange, searchFunction, loggingFunction }) => {
  const handleDeleteLink = (ev, link) => {
    const updated = cloneDeep(links).filter((l) => l.uri !== link.uri);
    onChange(ev, updated);
  };

  const handleAddConcept = (ev, concept) => {
    // Make sure to not insert duplicates.
    if (links.filter((l) => l.uri === concept.uri).length === 0) {
      const updated = cloneDeep(links);
      updated.push(concept);
      onChange(ev, updated);
    } else {
      console.log('concept is already linked');
      ev.preventDefault();
      return;
    }
  };

  return (
    <S.LinkingBlock>
      <ConceptQuickSearch onAdd={handleAddConcept} searchFunction={searchFunction} loggingFunction={loggingFunction} />
      <LinkedConcepts concepts={links} onDelete={handleDeleteLink} />
    </S.LinkingBlock>
  );
};
