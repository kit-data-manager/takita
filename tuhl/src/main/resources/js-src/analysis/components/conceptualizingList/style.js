import styled from 'styled-components';


export const StyledConceptualizingList = styled.ul`
  margin-top: 1rem;
`;

export const StyledConceptualization = styled.li`
  display: grid;
  grid-template-columns: 1fr 1fr 48px;
  gap: 10px;
  padding-bottom: 10px;

  button {
    height: fit-content;
    width: fit-content;
    align-self: center;
  }
`;

export const StyledTertium = styled(StyledConceptualization)`
  grid-template-columns: 1fr 48px;
`;