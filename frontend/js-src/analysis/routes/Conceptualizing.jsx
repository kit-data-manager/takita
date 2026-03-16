import React from 'react';
import { useOutletContext } from 'react-router-dom';

//import ConceptualizingList from '../components/conceptualizingList';
import { H3 } from '../components/text';
import { SummaryBox } from '../components/summaryBox';
import { CommentField } from '../components/commentField';

const Conceptualizing = () => {
  const [currentAnalysis, setCurrentAnalysis] = useOutletContext();

  const handleChangeComment = (ev, value) => {
    ev.preventDefault();
    const updated = currentAnalysis.changeTertiaComment(value);
    setCurrentAnalysis(updated);
  };

  return (
    <div className='Conceptualizing'>
      <SummaryBox analysis={currentAnalysis} showText showTranslation showPropositions showComments showMappings />
      <H3>Conceptualizing</H3>
      <p className='note'>
        <i>
          Note: It has turned out that while sometimes it is very easy to find a tertium (&quot;one source and target
          slot contain identical words&quot;), in other cases it is very hard or even impossible (e.g. when the metaphor
          can not get resolved, but only expressed in terms of another, maybe more fundamental, metaphor). In addition,
          in the future we might want to analyse the presence (or absence) of such a &quot;more fundamental&quot;
          metaphor. That is why we figured that this dedicated analysis step might prove useful.
        </i>
      </p>
      <H3>Tertia / Conceptual Metaphors</H3>
      <CommentField
        value={currentAnalysis.getTertiaComment()}
        onChange={handleChangeComment}
        placeholder='Write down what you would like to record with regard to tertia'
      />
    </div>
  );
};

export default Conceptualizing;
