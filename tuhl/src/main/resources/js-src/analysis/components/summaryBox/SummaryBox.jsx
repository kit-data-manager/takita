import React from 'react';
import { Collapsible } from '../collapsible';
import { Comment } from '../comment';
import { HighlightEditor } from '../highlightEditor';
import { PropositionListPreview } from '../propositionPreview';
import { TextPreview } from '../textPreview';
import { MappingTable } from '../mappingTable';

import * as S from './style';


const SummaryBox = (props) => {
  const { analysis, showText, showTranslation, showPropositions, showComments, showMappings } = props;

  const Text = (
    <TextPreview
      mrws={analysis?.mrws}
      text={analysis?.getText ? analysis.getText() : 'no text preview available'}
    />
  );
  const Translation = <HighlightEditor text={analysis?.auxiliaryText} readOnly />;
 
  const Propositions =  <PropositionListPreview data={analysis} />;

  const Comments = <Comment text={analysis?.getComment && analysis.getComment() ? analysis.getComment() : 'no comments'} />;

  const Mappings = analysis
    ?.getMappingTables()
    .map((table, tableIdx) => {
      return (
        <MappingTable
          data={analysis}
          setData={() => {}}
          open={false}
          readOnly={true}
          key={tableIdx}
          tableIdx={tableIdx}
        />
      );
    });

  return (
    <S.SummaryBox className='SummaryBox'>
      { showText && <Collapsible headerText='Text' body={Text} startCollapsed /> }
      { showTranslation && <Collapsible headerText='Translation' body={Translation} startCollapsed /> }
      { showPropositions && <Collapsible headerText='Propositions' body={Propositions} startCollapsed /> }
      { showMappings && <Collapsible headerText='Mappings' body={Mappings} startCollapsed /> }
      { showComments && <Collapsible headerText='Comments' body={Comments} startCollapsed /> }
    </S.SummaryBox>
  );
};

export default SummaryBox;