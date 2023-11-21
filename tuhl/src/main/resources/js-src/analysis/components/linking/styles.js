import styled from 'styled-components';


export const LinkingContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  padding: 10px;
  background: var(--default-bg-color);
  border: 1px solid var(--default-border-color);
  box-sizing: border-box;
`;

const MappingRow = styled.div`
  display: grid;
  gap: 10px;
`;

export const TermMappingRow = styled(MappingRow)`
  grid-template-columns: 1fr 80px 1fr;
  justify-items: center;
  align-items: baseline;
`;

export const ConceptMappingRow = styled(MappingRow)`
  grid-template-columns: 1fr 80px 1fr;
`;

export const ButtonRow = styled.div`
  margin-top: 15px;
`;

export const LinkingBlock = styled.div`
  background-color: var(--page-bg-color);
  padding-bottom: 10px;
`;

export const MappingDelimiter = styled.span`
  font-style: italic;
`;

export const LinkedConcepts = styled.ul`
  list-style: none;
  padding: 0 15px;
`;

export const LinkedConceptItem = styled.li`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 15px;
  align-items: center;
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0;
  }

  & button {
    align-self: start;
  }
`;

export const ConceptA = styled.a`
  text-decoration: underline;
  text-decoration-style: dotted;

  &:hover {
    text-decoration: underline;
  }
`;