import styled from 'styled-components';

export const StyledProposition = styled.li`
  /* [Subject] some text [Object] */
  display: grid;
  grid-template-columns: 140px 1fr 100px 1fr 140px auto;
  gap: 10px;
  padding-bottom: 10px;

  & .text-slot-A,
  & .text-slot-B {
    align-self: center;
    justify-self: center;
  }
`;

export const StyledRelationProposition = styled(StyledProposition)`
  /* [Subject] has/have relation [Predicate] to [Object] */
  grid-template-columns: 140px 1fr 100px 1fr 30px 1fr 140px auto;
`;

export const StyledPropositionList = styled.ul`
  margin-top: 1rem;
`;
