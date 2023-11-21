import styled from 'styled-components';

export const ControlSlot = styled.div`
  display: flex;
  justify-content: center;
  overflow: hidden;

  & button:active,
  & button:focus {
    box-shadow: none !important;
  }
`;

/**
 * A normal table cell, ready to be edited.
 */
export const ActiveCell = styled.td`
  background-color: white;

  & input {
    background-color: inherit;
  }
`;

/**
 * A table cell which can not be edited but is
 * otherwise not styled.
 */
export const FixedCell = styled.td`
  background-color: white;
`;

/**
 * Cell which is highlighted because it was filled
 * during a different step, but which can still be
 * edited.
 */
export const HighlightedCell = styled.td`
  background-color: rgb(242, 218, 240);

  & input {
    background-color: inherit;
  }
`;

/**
 * Table cell which can not be edited because it
 * was already filled during an earlier step.
 */
export const FixedCompleteCell = styled.td`
  background-color: beige;
  font-size: 0.8333rem;
  text-align: left;

  & input {
    background-color: inherit;
  }
`;

export const VerticalHeader = styled.th`
  font-weight: bold;
`;

export const MappingTable = styled.table`
  margin-top: 15px;
  background-color: var(--default-bg-color);
  border-collapse: collapse;
  border: 1px solid var(--default-border-color);

  th.vertical-heading {
    text-align: left;
  }

  td {
    /* text-align: center; */
  }

  th.vertical-heading,
  td {
    border: 1px solid var(--default-border-color);
    padding: 5px 10px;
  }
`;