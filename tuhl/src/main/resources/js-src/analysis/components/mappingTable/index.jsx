import React from 'react';

import { DeleteButton } from '../formElement';
import { IconButton } from '../button';
import { Icon } from '../icon';
import { stepEnum } from '../../data/models/appstate';
//import { StyledControlSlot, StyledVerticalHeader, StyledMappingTable, StyledHighlightedCell, StyledFixedCell } from './style';
import * as S from './style';

/**
 * UI element to create and remove table columns during
 * open mapping.
 */
const MappingHeaderSlot = (props) => {
  return (
    <th>
      <S.ControlSlot>
        <IconButton onClick={props.onClickBack}>
          <Icon glyph='view-back' size={16} />
          <Icon glyph='plus' size={16} />
        </IconButton>
        <IconButton onClick={props.onClickDelete}>
          <Icon glyph='delete' size={16} />
        </IconButton>
        <IconButton onClick={props.onClickForward}>
          <Icon glyph='plus' size={16} />
          <Icon glyph='view-forward' size={16} />
        </IconButton>
      </S.ControlSlot>
    </th>
  );
};

/**
 * UI element to switch source and target slot
 * of an (open) mapping.
 */
const ControlCell = (props) => {
  return (
    <td>
      <S.ControlSlot className='ControlCell'>
        <IconButton onClick={props.onClick}>
          <Icon glyph='down-caret' size={24} />
          <Icon glyph='up-caret' size={24} />
        </IconButton>
      </S.ControlSlot>
    </td>
  );
};

/* Input which can still be filled out. This includes _all_ slots
 * during open mapping, and all still empty slots during complete
 * mapping.
 */
const ActiveCell = (props) => {
  return (
    <S.ActiveCell>
      <div>{props.children}</div>
    </S.ActiveCell>
  );
};

/* Cell which can not be edited but is otherwise unstyled. */
const FixedCell = (props) => {
  return (
    <S.FixedCell>
      <div>{props.text}</div>
    </S.FixedCell>
  );
};

/* Slot which has been set during open mapping and which can no longer
 * be changed during complete mapping. */
const FixedCompleteCell = (props) => {
  return (
    <S.FixedCompleteCell>
      <div>{props.text}</div>
    </S.FixedCompleteCell>
  );
};

/* Slot which has been set during complete mapping and is marked as such,
 * but can still be changed during open mapping.
 */
const HighlightedCell = (props) => {
  return (
    <S.HighlightedCell>
      <div>{props.children}</div>
    </S.HighlightedCell>
  );
};

/* Helper to generate a suitable text slot. */
const Slot = ({ item, idx, domain, onChange, open, readOnly }) => {
  // If the slot should be readonly, there are no inputs and also no styling.
  if (readOnly) {
    return <FixedCell text={item.value} />;
  }
  // During open mapping, all inputs are active, but it should be visible if they have been filled during
  // open or complete mapping.
  if (open && item.step !== stepEnum.complete) {
    return (
      <ActiveCell>
        <input autoFocus value={item.value} onChange={(ev) => onChange(ev, idx, domain, stepEnum.open)} />
      </ActiveCell>
    );
  }
  if (open && item.step === stepEnum.complete) {
    return (
      <HighlightedCell>
        <input value={item.value} onChange={(ev) => onChange(ev, idx, domain, stepEnum.open)} />
      </HighlightedCell>
    );
  }
  // During complete mapping, only step==complete and empty slots are active.
  if (item.step === stepEnum.complete || !item.value) {
    return (
      <ActiveCell>
        <input value={item.value} onChange={(ev) => onChange(ev, idx, domain, stepEnum.complete)} />
      </ActiveCell>
    );
  }
  if (item.step === stepEnum.complete || item.value) {
    return <FixedCompleteCell text={item.value} />;
  }
  // Else, render a read-only text slot.
  return <FixedCell text={item.value} />;
};

/**
 * MappingTable - a table with corresponding text slots from a source and a target domain, respectively.
 *
 * @param {Object} props - should contain (analysis) data, setData, and a boolean whether we are in open mapping or not.
 * @returns {JSX} - description of the component
 */
export const MappingTable = ({ data, open, setData, tableIdx, readOnly }) => {
  // Ensure that we have at least one empty mapping.
  const mappings = data.getMappingTableAt(tableIdx);

  /**
   * The following callbacks are available for all inputs during
   * open_mapping, and for previously empty inputs during complete
   * mapping.
   */
  const onChangeInput = (ev, idx, domain, step) => {
    const newState = data.changeMappingAt(tableIdx, idx, domain, step, ev.target.value);
    setData(newState);
  };

  /**
   * Note: all these callbacks are only available via the respective buttons
   * when we are rendering an "open" mapping, since only during this step
   * are we allowed to change the table structure.
   */
  const onClickBack = (ev, idx) => {
    ev.preventDefault();
    const newState = data.insertMappingBefore(tableIdx, idx);
    setData(newState);
  };
  const onClickDelete = (ev, idx) => {
    ev.preventDefault();
    const newState = data.deleteMappingAt(tableIdx, idx);
    setData(newState);
  };
  const onClickForward = (ev, idx) => {
    ev.preventDefault();
    const newState = data.insertMappingAfter(tableIdx, idx);
    setData(newState);
  };
  const onClickUpDown = (ev, idx) => {
    ev.preventDefault();
    const newState = data.swapMappingAt(tableIdx, idx);
    setData(newState);
  };

  const onClickDeleteTable = (ev) => {
    ev.preventDefault();
    const newState = data.deleteMappingTableAt(tableIdx);
    setData(newState);
  };

  const heads = mappings.map((m, i) => {
    if (open) {
      return (
        <MappingHeaderSlot
          mapping={m}
          idx={i}
          key={i}
          onClickBack={(ev) => onClickBack(ev, i)}
          onClickDelete={(ev) => onClickDelete(ev, i)}
          onClickForward={(ev) => onClickForward(ev, i)}
        />
      );
    }
    return <th key={`empty-${i}`}>&nbsp;</th>;
  });
  const targets = mappings
    .map((m) => m.target)
    .map((t, i) => (
      <Slot
        key={`target-${i}`}
        item={t}
        idx={i}
        domain='target'
        onChange={onChangeInput}
        open={open}
        readOnly={readOnly}
      />
    ));
  const sources = mappings
    .map((m) => m.source)
    .map((s, i) => (
      <Slot
        key={`source-${i}`}
        item={s}
        idx={i}
        domain='source'
        onChange={onChangeInput}
        open={open}
        readOnly={readOnly}
      />
    ));
  const controlCells = mappings.map((m, i) => {
    if (open) {
      return <ControlCell key={`control-${i}`} onClick={(ev) => onClickUpDown(ev, i)} />;
    }
    return <td key={`empty-${i}`}>&nbsp;</td>;
  });

  return (
    <S.MappingTable>
      <thead>
        <tr>
          <th className='empty-header-slot'>{open ? <DeleteButton size={24} onClick={onClickDeleteTable} /> : ' '}</th>
          {heads}
        </tr>
      </thead>
      <tbody>
        <tr className='mapping-target'>
          <S.VerticalHeader className='vertical-heading'>Target</S.VerticalHeader>
          {targets}
        </tr>
        <tr className='mapping-control'>
          <S.VerticalHeader className='vertical-heading empty-header-slot'>&nbsp;</S.VerticalHeader>
          {controlCells}
        </tr>
        <tr className='mapping-source'>
          <S.VerticalHeader className='vertical-heading'>Source</S.VerticalHeader>
          {sources}
        </tr>
      </tbody>
    </S.MappingTable>
  );
};
