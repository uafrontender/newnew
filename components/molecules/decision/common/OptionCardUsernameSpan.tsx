/* eslint-disable arrow-body-style */
import React from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import Link from 'next/link';

import { useAppSelector } from '../../../../redux-store/store';
import getDisplayname from '../../../../utils/getDisplayname';

import InlineSvg from '../../../atoms/InlineSVG';

import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';
import VerificationCheckmarkInverted from '../../../../public/images/svg/icons/filled/VerificationInverted.svg';

interface IOptionCardUsernameSpan {
  type: 'me' | 'otherUser';
  user?: newnewapi.IUser;
  usernameText?: string;
  isBlue: boolean;
}

const OptionCardUsernameSpan: React.FC<IOptionCardUsernameSpan> = ({
  type,
  user,
  usernameText,
  isBlue,
}) => {
  const userData = useAppSelector((state) => state.user?.userData);

  if (type === 'me' && !usernameText) {
    console.error('usernameText must be provided');
    return null;
  }
  if (type === 'otherUser' && !user) {
    console.error('user must be provided');
    return null;
  }

  // Render link to MyProfile
  if (type === 'me') {
    return (
      <Link href={`/profile${userData?.options?.isCreator ? '/my-posts' : ''}`}>
        <SSpanUserHighlighted
          isBlue={isBlue}
          className='spanHighlighted'
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={{
            cursor: 'pointer',
          }}
        >
          {usernameText}
          {userData?.options?.isVerified ? (
            <SInlineSvgVerificationIcon
              svg={
                !isBlue ? VerificationCheckmark : VerificationCheckmarkInverted
              }
              width='14px'
              height='14px'
              fill='none'
            />
          ) : null}
        </SSpanUserHighlighted>
      </Link>
    );
  }

  if (user?.options?.isVerified)
    return (
      <Link href={`/${user?.username}`}>
        <SSpanUserHighlighted
          isBlue={isBlue}
          className='spanHighlighted'
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={{
            cursor: 'pointer',
          }}
        >
          {getDisplayname(user)}
          {user?.options?.isVerified ? (
            <SInlineSvgVerificationIcon
              svg={
                !isBlue ? VerificationCheckmark : VerificationCheckmarkInverted
              }
              width='14px'
              height='14px'
              fill='none'
            />
          ) : null}
        </SSpanUserHighlighted>
      </Link>
    );

  return (
    <SSpanUserRegular
      className='spanHighlighted'
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={{
        cursor: 'default',
      }}
    >
      {getDisplayname(user)}
    </SSpanUserRegular>
  );
};

export default OptionCardUsernameSpan;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SSpanUserHighlighted = styled.span<{
  isBlue: boolean;
}>`
  color: ${({ theme, isBlue }) =>
    isBlue ? '#FFFFFF' : theme.colorsThemed.text.secondary};

  a {
    color: inherit !important;
  }
`;

const SSpanUserRegular = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SInlineSvgVerificationIcon = styled(InlineSvg)`
  display: inline-flex;
  margin-left: 3px;

  position: relative;
  top: 3px;
`;
