/* eslint-disable arrow-body-style */
import React from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

interface IOptionCardUsernameSpan {
  type: 'me' | 'otherUser';
  clickOnlyVerified: boolean;
  user?: newnewapi.IUser;
  isBlue: boolean;
}

const OptionCardUsernameSpan: React.FC<IOptionCardUsernameSpan> = ({
  type,
  user,
  clickOnlyVerified,
  isBlue,
}) => {
  // const isMe;

  // if (clickOnlyVerified) return (

  // )

  // return (

  // )
  return null;
};

export default OptionCardUsernameSpan;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SSpanBiddersHighlighted = styled.span<{
  isBlue: boolean;
}>`
  color: ${({ theme, isBlue }) =>
    isBlue ? '#FFFFFF' : theme.colorsThemed.text.secondary};

  a {
    color: inherit !important;
  }
`;
