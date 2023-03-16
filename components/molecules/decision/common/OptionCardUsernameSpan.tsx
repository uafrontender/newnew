import React from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import { useAppSelector } from '../../../../redux-store/store';
import DisplayName from '../../../DisplayName';

interface IOptionCardUsernameSpan {
  // String used for own user case only, when we want "I", "me" or "my"
  user: newnewapi.IUser | string | undefined | null;
  isBlue: boolean;
}

const OptionCardUsernameSpan: React.FC<IOptionCardUsernameSpan> = ({
  user,
  isBlue,
}) => {
  const currentUser = useAppSelector((state) => state.user);

  if (typeof user === 'string') {
    return (
      <SContainer>
        <SHighlightedDisplayName
          user={typeof user === 'string' ? currentUser.userData : user}
          href={
            currentUser.userData?.options?.isCreator
              ? '/profile/my-posts'
              : '/profile'
          }
          altName={user}
          inverted={isBlue}
          isBlue={isBlue}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </SContainer>
    );
  }

  if (user?.options?.isVerified) {
    return (
      <SContainer>
        <SHighlightedDisplayName
          user={user}
          href={`/${user?.username}`}
          inverted={isBlue}
          isBlue={isBlue}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </SContainer>
    );
  }
  // No navigation for non verified other users
  return (
    <SContainer>
      <SRegularDisplayName
        user={user}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    </SContainer>
  );
};

export default OptionCardUsernameSpan;

const SContainer = styled.div`
  display: inline-flex;
`;

const SHighlightedDisplayName = styled(DisplayName)<{
  isBlue: boolean;
}>`
  color: ${({ theme, isBlue }) =>
    isBlue ? '#FFFFFF' : theme.colorsThemed.text.secondary};

  cursor: pointer;
`;

const SRegularDisplayName = styled(DisplayName)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
