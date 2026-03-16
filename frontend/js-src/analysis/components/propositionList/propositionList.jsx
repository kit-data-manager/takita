import React from 'react';

import { IconButton } from '../button';
import { Icon } from '../icon';
import { Input, Select } from '../formElement';
import { typeEnum, evidenceEnum } from '../../data/models/appstate';
import { StyledProposition, StyledRelationProposition, StyledPropositionList } from './style';

const GenericProposition = ({ proposition, setProposition, ...props }) => {
  const active = proposition.type && proposition.type !== 'not-set';

  const onChangeType = (ev) => {
    ev.preventDefault();
    const p = { ...proposition };
    p.type = ev.target.value;
    setProposition(p);
  };
  const onChangeSubject = (ev) => {
    const p = { ...proposition };
    p.subject = ev.target.value;
    setProposition(p);
  };
  const onChangePredicate = (ev) => {
    const p = { ...proposition };
    p.predicate = ev.target.value;
    setProposition(p);
  };
  const onChangeObject = (ev) => {
    const p = { ...proposition };
    p.value = ev.target.value;
    setProposition(p);
  };
  const onChangeEvidence = (ev) => {
    const p = { ...proposition };
    p.evidence = ev.target.value;
    setProposition(p);
  };
  const onDelete = (ev) => {
    ev.preventDefault();
    setProposition(undefined);
  };

  return (
    <>
      <Select className='proposition-type' value={proposition.type || 'not-set'} onChange={onChangeType}>
        <option value='not-set'>...</option>
        {Object.values(typeEnum).map((t) => (
          <option value={t} key={t}>
            {t}
          </option>
        ))}
      </Select>
      {active && (
        <>
          <Input type='text' className='proposition-subject' value={proposition.subject} onChange={onChangeSubject} />
          <span className='text-slot-A'>{props.textSlotA}</span>
        </>
      )}
      {active && props.textSlotB && (
        <>
          <Input
            type='text'
            className='proposition-predicate'
            value={proposition.predicate}
            onChange={onChangePredicate}
          />
          <span className='text-slot-B'>{props.textSlotB}</span>
        </>
      )}
      {active && (
        <>
          <Input type='text' className='proposition-value' value={proposition.value} onChange={onChangeObject} />
        </>
      )}
      {active && (
        <>
          <Select
            className='proposition-evidence'
            value={proposition.evidence || evidenceEnum.explicit}
            onChange={onChangeEvidence}
          >
            {Object.values(evidenceEnum).map((e) => (
              <option value={e} key={e}>
                {e}
              </option>
            ))}
          </Select>
          <IconButton onClick={onDelete}>
            <Icon glyph='delete' />
          </IconButton>
        </>
      )}
    </>
  );
};

const MetonomyProposition = (props) => {
  // [Subject] stands for [Object]
  return (
    <StyledProposition className='proposition'>
      <GenericProposition textSlotA='stands for' {...props} />
    </StyledProposition>
  );
};

const PossessiveProposition = (props) => {
  // [Subject] possesses [Object]
  return (
    <StyledProposition className='proposition'>
      <GenericProposition textSlotA='possesses' {...props} />
    </StyledProposition>
  );
};

const RelationProposition = (props) => {
  // [Subject] has/have the relation [Predicate] to [Object]
  return (
    <StyledRelationProposition className='proposition'>
      <GenericProposition textSlotA='has/have the relation' textSlotB='to' {...props} />
    </StyledRelationProposition>
  );
};

const ConceptProposition = (props) => {
  // [Subject] is/are [Object]
  return (
    <StyledProposition className='proposition'>
      <GenericProposition textSlotA='is/are' {...props} />
    </StyledProposition>
  );
};

const AttributeProposition = (props) => {
  // [Subject] has/have the attribute [Object]
  return (
    <StyledProposition className='proposition'>
      <GenericProposition textSlotA='has/have attribute' {...props} />
    </StyledProposition>
  );
};

export const Proposition = (props) => {
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

export const PropositionList = ({ _originalData, data, setData }) => {
  const onChange = (idx, value) => {
    const newData = data.changePropositionAt(idx, value);
    setData(newData);
  };

  const onClickNew = (ev) => {
    ev.preventDefault();
    const newData = data.appendNewProposition();
    setData(newData);
  };

  return (
    <>
      <StyledPropositionList className='PropositionList'>
        {data.propositions.map((p, i) => {
          return <Proposition proposition={p} setProposition={(value) => onChange(i, value)} key={i} />;
        })}
      </StyledPropositionList>
      <IconButton onClick={onClickNew}>
        <Icon glyph='plus' />
      </IconButton>
    </>
  );
};
