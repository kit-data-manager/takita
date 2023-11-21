import React from "react";
import { StyledH1, StyledH2, StyledH3, StyledTinyText } from "./style";

const wrapText = (Component, props) => {
  const { children, ...rest } = props;
  return (
    <Component {...rest}>
      {children}
    </Component>
  );
};

export const TinyText = (props) => wrapText(StyledTinyText, props);
export const H1 = (props) => wrapText(StyledH1, props);
export const H2 = (props) => wrapText(StyledH2, props);
export const H3 = (props) => wrapText(StyledH3, props);
