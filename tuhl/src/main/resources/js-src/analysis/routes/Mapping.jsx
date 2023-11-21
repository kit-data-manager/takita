import React from 'react';
import { useOutletContext } from 'react-router-dom';

import { H3 } from '../components/text';
import { MappingTable } from '../components/mappingTable';
import { SummaryBox } from '../components/summaryBox';
import { NewButton } from '../components/formElement';

const Mapping = (props) => {
  const { open } = props;
  const cls = open ? 'Mapping openmapping' : 'Mapping completemapping';
  const [currentAppState, setCurrentAppState] = useOutletContext();

  const onAddTable = (ev) => {
    ev.preventDefault();
    const updated = currentAppState.appendMappingTable();
    setCurrentAppState(updated);
  };

  const tables = currentAppState
    .getMappingTables()
    .map((table, tableIdx) => {
      return (
        <MappingTable
          data={currentAppState}
          setData={setCurrentAppState}
          open={open}
          key={tableIdx}
          tableIdx={tableIdx}
        />
      );
    });

  return (
    <div className={cls}>
      <SummaryBox analysis={currentAppState} showText showTranslation showPropositions showComments />
      <H3>{ open ? 'Open Mapping' : 'Complete Mapping' }</H3>
      <div className='multi-mapping-container'>
        { tables }
      </div>
      { open && <NewButton onClick={onAddTable} style={{marginTop: '20px'}} />}
    </div>
  );
};

export default Mapping;