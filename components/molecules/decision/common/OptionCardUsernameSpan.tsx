import React from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import { useUserData } from '../../../../contexts/userDataContext';
import DisplayName from '../../../atoms/DisplayName';
import { useAppState } from '../../../../contexts/appStateContext';

interface IOptionCardUsernameSpan {
  // String used for own user case only, when we want "I", "me" or "my"
  user: newnewapi.IUser | string | undefined | null;
  isBlue: boolean;
}

const OptionCardUsernameSpan: React.FC<IOptionCardUsernameSpan> = ({
  user,
  isBlue,
}) => {
  const { userData } = useUserData();
  const { userIsCreator } = useAppState();

  if (!user) {
    return null;
  }

  if (typeof user === 'string') {
    return (
      // TODO: Should it have hover effect?
      <SHighlightedDisplayName
        user={userData}
        href={userIsCreator ? '/profile/my-posts' : '/profile'}
        altName={user}
        inverted={isBlue}
        isBlue={isBlue}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    );
  }

  if (user?.options?.isVerified) {
    return (
      // TODO: Should it have hover effect?
      <SHighlightedDisplayName
        user={user}
        href={`/${user?.username}`}
        inverted={isBlue}
        isBlue={isBlue}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    );
  }

  // No navigation for non verified other users
  return (
    <SRegularDisplayName
      user={user}
      onClick={(e) => {
        e.stopPropagation();
      }}
    />
  );
};

export default OptionCardUsernameSpan;

const SHighlightedDisplayName = styled(DisplayName)<{
  isBlue: boolean;
}>`
  color: ${({ theme, isBlue }) =>
    isBlue ? '#FFFFFF' : theme.colorsThemed.text.secondary};

  cursor: pointer;
`;

const SRegularDisplayName = styled(DisplayName)`
  max-width: 100%;
  color: #909aad;
`;
