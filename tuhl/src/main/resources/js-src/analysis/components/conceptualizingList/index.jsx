import React from 'react';
//import { Tertium as TertiumModel } from '../../models/linking';
import { IconButton } from '../button';
import { Icon } from '../icon';
import { Input } from '../formElement';

import { StyledTertium, StyledConceptualizingList } from './style';

export const Tertium = ({linking, setLinking}) => {
  const onChangeTertium = (ev) => {
    ev.preventDefault();
    const l = { ...linking };
    l.tertium = ev.target.value;
    setLinking(l);
  };
  const onChangeTertiumLink = (ev) => {
    ev.preventDefault();
    const l = { ...linking };
    l.tertium_link = ev.target.value;
    setLinking(l);
  };
  const onDelete = (ev) => {
    ev.preventDefault();
    setLinking(undefined);
  };

  return (
    <StyledTertium>
      <div className='linking-tertium'>
        <label>
          <Input type='text' className='linking-tertium-input' value={linking.tertium} onChange={onChangeTertium}>Tertium</Input>
          <Input type='text' className='linking-tertium-link-input' value={linking.tertium_link} onChange={onChangeTertiumLink} placeholder="concept URI" />
        </label>
      </div>
      <IconButton onClick={onDelete}>
        <Icon glyph='delete' />
      </IconButton>
    </StyledTertium>
  );
};

const ConceptualizingList = ({ originalData, data, setData }) => {

  const onClickNewTertium = (ev) => {
    ev.preventDefault();
    //const t = new TertiumModel();
    const newData = { ...data };
    newData.tertia.push(t);
    setData(newData);
  };

  const onChangeTertium = (idx, value) => {
    const newData = { ...data };
    if (value === undefined) {
      newData.tertia.splice(idx, 1);
    }
    else {
      newData.tertia[idx] = value;
    }
    setData(newData);
  };

  return (
    <div className='ConceptualizingList'>
      <StyledConceptualizingList className='tertia'>
          {
            data.tertia && data.tertia.map((t, i) => {
              return <Tertium linking={t} setLinking={(value) => onChangeTertium(i, value)} key={i} />;
            })
          }
      </StyledConceptualizingList>
      <IconButton onClick={onClickNewTertium}>
        <Icon glyph='plus' />
      </IconButton>
  </div>);
};

// export default ConceptualizingList;