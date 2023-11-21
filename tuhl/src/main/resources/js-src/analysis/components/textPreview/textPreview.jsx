import React from 'react';
import { StyledDirect, StyledImplicit, StyledIndirect, StyledMFlag,
  StyledRegular, StyledTextPreview
} from './style';

/**
 * 
 * @param String text original text
 * @param Array mrws array of mrw strings
 * @returns {Array} list of string which are either one of the mrws or text in between. 
 */
const extractMRWs = (text, mrws) => {
  mrws = mrws !== undefined ? mrws : [];
  const sep = '#*';
  const modified = mrws.reduce((mod, mrw) => mod.replaceAll(mrw.text, `${sep}${mrw.text}${sep}`), text);
  return modified.split(sep);
};

const Highlight = (props) => {
  const { type, children } = props;
  const Components = {
    'mrw (direct)': StyledDirect,
    'mrw (indirect)': StyledIndirect,
    'mrw (implicit)': StyledImplicit,
    'mflag': StyledMFlag,
  };
  const Component = Components[type] || StyledIndirect;
  return <Component>{children}</Component>;
};

export const TextPreview = ({ text, mrws }) => {
  mrws = mrws !== undefined ? mrws : [];
  const segments = extractMRWs(text, mrws)
    .map((str, idx) => {
      const currentMRW = mrws.filter(mrw => mrw.text === str).pop();
      if (currentMRW) {
        return <Highlight type={currentMRW.type} key={idx}>{str}</Highlight>;
      }
      return <StyledRegular key={idx}>{str}</StyledRegular>;
  });
  return (
    <StyledTextPreview>
      { segments } 
    </StyledTextPreview>
  );
};