import styled from 'styled-components';

export const Message = styled.p`
  color: black;
`;

export const SuccessMessage = styled(Message)`
  color: green;
`;

export const ErrorMessage = styled(Message)`
  color: red;
`;

export const ObsoleteMessage = styled(Message)`
  color: var(--placeholder-color);
  font-weight: 300;
`;

export const MessageBox = styled.div`
  position: relative;
  padding-top: 15px;
  margin-bottom: 10px;
  padding-left: 15px;
  border: 1px solid #ccc;
  padding-bottom: 10px;
  box-sizing: border-box;
  background-color: ${props => props.readOnly ? 'var(--error-bg-color)' : 'inherit'};
`;

export const CloseButton = styled.div`
  position: absolute;
  right: 4px;
  top: 8px;
  cursor: pointer;
`;