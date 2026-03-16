import styled from 'styled-components';

export const ColorCircle = styled.span`
  display: inline-block;
  width: ${(props) => (props.width ? `${props.width}` : '10px')};
  height: ${(props) => (props.height ? `${props.height}` : '10px')};
  border-radius: ${(props) => (props.borderRadius ? `${props.borderRadius}` : '25px')};
  background-color: ${(props) => (props.color ? `${props.color}` : 'lightgrey')};
  color: white;
`;

export const ColorBar = styled(ColorCircle)`
  border-radius: ${(props) => (props.borderRadius ? `${props.borderRadius}` : '0')};
`;
