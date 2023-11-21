import { wrapLink } from "../linkUtils";
import {
  StyledAbsoluteIconButton,
  StyledIconButton,
  StyledButton,
  StyledOutlineButton,
  StyledPrimaryButton,
  StyledPrimaryOutlineButton,
  StyledSecondaryButton,
} from './style';

export const AbsoluteIconButton = (props) => wrapLink(StyledAbsoluteIconButton, props);

export const Button = (props) => wrapLink(StyledButton, props);

export const IconButton = (props) => wrapLink(StyledIconButton, props);

export const PrimaryButton = (props) => wrapLink(StyledPrimaryButton, props);

export const PrimaryOutlineButton = (props) => wrapLink(StyledPrimaryOutlineButton, props);

export const OutlineButton = (props) => wrapLink(StyledOutlineButton, props);

export const SecondaryButton = (props) => wrapLink(StyledSecondaryButton, props);
