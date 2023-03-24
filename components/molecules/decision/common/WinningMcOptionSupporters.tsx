import React, { useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

import { useAppSelector } from '../../../../redux-store/store';
import { formatNumber } from '../../../../utils/format';
import DisplayName from '../../../DisplayName';

interface IWinningMcOptionCreator {
  postCreator: newnewapi.IUser;
  winningOption: newnewapi.MultipleChoice.IOption;
}

const WinningMcOptionSupporters: React.FC<IWinningMcOptionCreator> = React.memo(
  ({ postCreator, winningOption }) => {
    const { t } = useTranslation('page-Post');
    const user = useAppSelector((state) => state.user);

    const userToRender = useMemo(() => {
      if (user.loggedIn && !user.userData?.userUuid) {
        return null;
      }

      // If I supported the option show me
      if (winningOption.isSupportedByMe) {
        return 'me';
      }

      // If whitelisted user supported the option, show them
      if (winningOption.whitelistSupporter) {
        return winningOption.whitelistSupporter;
      }

      // If the option created by post creator then return first voter
      // TODO: if user is deleted, only 'voted' is shown
      if (winningOption.creator?.uuid === postCreator?.uuid) {
        return winningOption.firstVoter;
      }

      // For custom options show it's creator
      return winningOption.creator;
    }, [
      winningOption.whitelistSupporter,
      winningOption.creator,
      winningOption.firstVoter,
      user.loggedIn,
      user.userData?.userUuid,
      winningOption.isSupportedByMe,
      postCreator?.uuid,
    ]);

    const href: string | undefined = useMemo(() => {
      if (userToRender === 'me') {
        return '/profile';
      }

      if (
        userToRender?.options?.isVerified ||
        userToRender?.uuid === winningOption.whitelistSupporter?.uuid
      ) {
        return `/${userToRender?.username}`;
      }

      return undefined;
    }, [userToRender, winningOption.whitelistSupporter?.uuid]);

    const avatarSrc: string = useMemo(() => {
      if (userToRender === 'me') {
        return user.userData?.avatarUrl ?? '';
      }

      return userToRender?.avatarUrl ?? '';
    }, [userToRender, user.userData?.avatarUrl]);

    return (
      <SWinningBidCreator>
        <SCreator>
          {href ? (
            <Link href={href}>
              <SCreatorImage src={avatarSrc} />
            </Link>
          ) : (
            <SCreatorImage src={avatarSrc} />
          )}

          <SWinningBidCreatorText>
            <SDisplayName
              user={userToRender === 'me' ? user.userData : userToRender}
              href={href}
              altName={
                // eslint-disable-next-line no-nested-ternary
                userToRender === 'me'
                  ? winningOption.supporterCount &&
                    winningOption.supporterCount > 1
                    ? t('me')
                    : t('I')
                  : undefined
              }
              withLink={!!href}
            />
            {winningOption.supporterCount &&
            winningOption.supporterCount > 1 ? (
              <>
                {` & `}
                {formatNumber(winningOption.supporterCount - 1, true)}&nbsp;
                {winningOption.supporterCount - 1 > 1
                  ? t('mcPostSuccess.others')
                  : t('mcPostSuccess.other')}
              </>
            ) : null}
            &nbsp;
            {t('mcPostSuccess.voted')}
          </SWinningBidCreatorText>
        </SCreator>
      </SWinningBidCreator>
    );
  }
);

export default WinningMcOptionSupporters;

const SCreator = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 24px;

  vertical-align: middle;
`;

const SCreatorImage = styled.img`
  display: inline-block;

  width: 24px;
  height: 24px;

  border-radius: 50%;

  margin-right: 4px;
`;

const SWinningBidCreator = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;

  margin-top: 32px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;

    flex-direction: row;
    justify-content: space-between;
  }
`;

const SWinningBidCreatorText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: pre;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;

  ${({ theme }) => theme.media.laptop} {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
  }
`;

const SDisplayName = styled(DisplayName)<{ withLink: boolean }>`
  cursor: ${({ withLink }) => (withLink ? 'pointer' : undefined)};

  color: ${({ theme, withLink }) =>
    withLink ? theme.colorsThemed.text.secondary : undefined};

  &:hover {
    color: ${({ theme, withLink }) =>
      withLink ? theme.colorsThemed.text.primary : undefined};
  }
`;