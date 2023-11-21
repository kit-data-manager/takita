import React from 'react';
import { useOutletContext } from 'react-router-dom';

import { HighlightEditor } from '../components/highlightEditor';
import { H3 } from '../components/text';
import { SummaryBox } from '../components/summaryBox';

const AuxiliaryText = (_props) => {
  const [currentAppState, setCurrentAppState] = useOutletContext();

  const onChangeText = (_content, _delta, _source, editor) => {
    const textDelta = editor.getContents();
    const updated = currentAppState.updateAuxText(textDelta);
    setCurrentAppState(updated);
  };

  return (
    <div className='AuxiliaryText'>
      { true && <SummaryBox analysis={currentAppState} showText showComments /> }
      <H3>Auxiliary Translation</H3>
      <HighlightEditor text={currentAppState.auxiliaryText} setText={onChangeText} />
    </div>
  );
};

export default AuxiliaryText;