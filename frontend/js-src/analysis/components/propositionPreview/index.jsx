import React from 'react';

import { typeEnum } from '../../data/models/appstate';
import { StyledPropositionListPreview, StyledPropositionPreview, StyledPropositionPreviewSlot } from './style';

const GenericPropositionPreview = (props) => {
  return (
    <>
      <StyledPropositionPreviewSlot>{props.proposition.subject} </StyledPropositionPreviewSlot>
      <span className='text-slot-A'>{props.textSlotA}</span>
      {props.textSlotB && (
        <>
          <StyledPropositionPreviewSlot> {props.proposition.predicate} </StyledPropositionPreviewSlot>
          <span className='text-slot-B'>{props.textSlotB}</span>
        </>
      )}
      <StyledPropositionPreviewSlot> {props.proposition.value}</StyledPropositionPreviewSlot>.
    </>
  );
};

const MetonomyProposition = (props) => {
  // [Subject] stands for [Object]
  return (
    <StyledPropositionPreview className='proposition preview'>
      <GenericPropositionPreview textSlotA='stands for' {...props} />
    </StyledPropositionPreview>
  );
};

const PossessiveProposition = (props) => {
  // [Subject] possesses [Object]
  return (
    <StyledPropositionPreview className='proposition preview'>
      <GenericPropositionPreview textSlotA='possesses' {...props} />
    </StyledPropositionPreview>
  );
};

const RelationProposition = (props) => {
  // [Subject] has/have the relation [Predicate] to [Object]
  return (
    <StyledPropositionPreview className='proposition preview'>
      <GenericPropositionPreview textSlotA='has/have the relation' textSlotB='to' {...props} />
    </StyledPropositionPreview>
  );
};

const ConceptProposition = (props) => {
  // [Subject] is/are [Object]
  return (
    <StyledPropositionPreview className='proposition preview'>
      <GenericPropositionPreview textSlotA='is/are' {...props} />
    </StyledPropositionPreview>
  );
};

const AttributeProposition = (props) => {
  // [Subject] has/have the attribute [Object]
  return (
    <StyledPropositionPreview className='proposition preview'>
      <GenericPropositionPreview textSlotA='has/have attribute' {...props} />
    </StyledPropositionPreview>
  );
};

export const PropositionPreview = (props) => {
  switch (props.proposition.type) {
    case typeEnum.relation:
      return <RelationProposition {...props} />;
    case typeEnum.attribute:
      return <AttributeProposition {...props} />;
    case typeEnum.concept:
      return <ConceptProposition {...props} />;
    case typeEnum.metonymy:
      return <MetonomyProposition {...props} />;
    case typeEnum.possessive:
      return <PossessiveProposition {...props} />;
    default:
      return <ConceptProposition {...props} />;
  }
};

export const PropositionListPreview = ({ data }) => {
  const propositions = data.propositions.map((p, i) => <PropositionPreview proposition={p} key={i} />);
  return <StyledPropositionListPreview className='PropositionPreview'>{propositions}</StyledPropositionListPreview>;
};
