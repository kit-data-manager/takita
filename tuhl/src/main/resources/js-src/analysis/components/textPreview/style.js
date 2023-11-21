import styled from 'styled-components';

const StyledHighlight = styled.span`
  color: var(--highlight-color);
  background: var(--highlight-bg-color);
  padding: 3px 5px;
  border-radius: 5px;
`;

export const StyledDirect = styled(StyledHighlight)`
  color: var(--default-color);
  background-color: var(--mrw-direct-bg-color);
`;
export const StyledImplicit = styled(StyledHighlight)`
  color: var(--default-color);
  background-color: var(--mrw-implicit-bg-color);
`;
export const StyledIndirect = styled(StyledHighlight)`
  color: var(--default-color);
  background-color: var(--mrw-indirect-bg-color);
`;
export const StyledMFlag = styled(StyledHighlight)`
  color: var(--default-color);
  background-color: var(--mrw-mflag-bg-color);
`;

export const StyledRegular = styled.span``;

export const StyledTextPreview = styled.div`
  white-space: pre-wrap;
  background: var(--default-bg-color);
  padding: 1rem;
  border-radius: 15px;
  color: var(--default-color);
`;