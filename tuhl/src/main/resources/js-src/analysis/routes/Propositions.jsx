import React from 'react';
import { useOutletContext } from 'react-router-dom';

import { H3 } from '../components/text';
import { PropositionList } from '../components/propositionList';
import { SummaryBox } from '../components/summaryBox';

const Propositions = () => {
  const [currentAppState, setCurrentAppState] = useOutletContext();

  return (
    <div className='Propositions'>
      <SummaryBox analysis={currentAppState} showText showTranslation showComments />
      <H3>Propositions</H3>
      <PropositionList  data={currentAppState} setData={setCurrentAppState} />
    </div>
  );
};

export default Propositions;
