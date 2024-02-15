import React from 'react';
import { useOutletContext } from 'react-router-dom';

import { searchForConcept, storeSearchAnalytics } from '../data/api';

import { AddButton } from '../components/formElement';
import { H3 } from '../components/text';
import { LinkingContainer } from '../components/linking';
import { SummaryBox } from '../components/summaryBox';

const style = { color: 'blue' };

const Linking = () => {
  const [currentAppState, setCurrentAppState] = useOutletContext();

  const addLinkingContainer = (ev) => {
    ev.preventDefault();
    const updated = currentAppState.appendNewLinking();
    setCurrentAppState(updated);
  };

  const deleteLinkingContainer = (ev, idx) => {
    ev.preventDefault();
    const updated = currentAppState.changeLinkingAt(idx, null);
    setCurrentAppState(updated);
  };

  const updateLinkingContainer = (ev, idx, data) => {
    ev.preventDefault();
    const updated = currentAppState.changeLinkingAt(idx, data);
    setCurrentAppState(updated);
  };
  const l = currentAppState.getLinkings();
  const linkingContainers = l.map((l, idx) => {
    return (
      <LinkingContainer
        linking={l}
        key={idx}
        onChange={(ev, data) => updateLinkingContainer(ev, idx, data)}
        onDelete={(ev) => deleteLinkingContainer(ev, idx)}
        searchFunction={searchForConcept}
        loggingFunction={(query, selectedURI, selectedRank) =>
          storeSearchAnalytics(query, selectedURI, selectedRank, currentAppState.getId())
        }
      />
    );
  });

  // loggingFunktion={(query, selectedURI, selectedRank) => storeSearchAnalytics(query, selectedURI, selectedRank, currentAppState.getId())}
  return (
    <div className='Linking'>
      <SummaryBox analysis={currentAppState} showText showTranslation showPropositions showComments showMappings />
      <H3>Linking</H3>

      {linkingContainers}

      <AddButton onClick={addLinkingContainer} title='Add linking block' />

      <p className='note' style={{ margin: '15px 0' }}>
        <i>
          Note: The Concept Hierarchy as our point of reference is a major working area right now. A preliminary glance
          at the hierarchy is available at{' '}
          <a style={style} target='_blank' rel='noreferrer' href='https://w3id.org/MoRe-SFB1475/CT/'>
            https://w3id.org/MoRe-SFB1475/CT/
          </a>
          . If you want to propose changes to the hierarchy, please{' '}
          <a
            style={style}
            target='_blank'
            rel='noreferrer'
            href='https://gitlab.ruhr-uni-bochum.de/sfb-1475/tram/-/issues/new'
          >
            submit a TRAM Ticket
          </a>
          .
        </i>
      </p>
    </div>
  );
};

export default Linking;
