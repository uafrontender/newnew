import { newnewapi } from 'newnew-api';
import React, { useCallback, useMemo, useState, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import Router from 'next/router';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import UserAvatar from '../UserAvatar';
import InlineSvg from '../../atoms/InlineSVG';
import Button from '../../atoms/Button';
import UserEllipseMenu from '../profile/UserEllipseMenu';
import ReportModal, { ReportData } from '../ReportModal';
import BlockUserModalProfile from '../profile/BlockUserModalProfile';

import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import { reportUser } from '../../../api/endpoints/report';
import { useGetBlockedUsers } from '../../../contexts/blockedUsersContext';
import UserEllipseModal from '../profile/UserEllipseModal';
import { useBundles } from '../../../contexts/bundlesContext';
import { formatNumber } from '../../../utils/format';
import { useAppState } from '../../../contexts/appStateContext';
import DisplayName from '../../atoms/DisplayName';
import GenericSkeleton from '../GenericSkeleton';
import { ReportUserOnSignUp } from '../../../contexts/onSignUpWrapper';

interface ICreatorCard {
  creator: newnewapi.IUser;
  withEllipseMenu?: boolean;
  onBundleClicked?: (creator: newnewapi.IUser) => void;
}

export const CreatorCard: React.FC<ICreatorCard> = ({
  creator,
  withEllipseMenu,
  onBundleClicked,
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const { resizeMode, userLoggedIn } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  // Ellipse menu
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);

  // Modals
  const [blockUserModalOpen, setBlockUserModalOpen] = useState(false);
  const [confirmReportUser, setConfirmReportUser] = useState(false);
  const { usersIBlocked, changeUserBlockedStatus } = useGetBlockedUsers();
  const isUserBlocked = useMemo(
    () => usersIBlocked.includes(creator.uuid as string),
    [usersIBlocked, creator.uuid]
  );

  const { bundles } = useBundles();
  const creatorsBundle = useMemo(
    () => bundles?.find((bundle) => bundle.creator?.uuid === creator.uuid),
    [bundles, creator.uuid]
  );

  const handleClickReport = useCallback(() => {
    setConfirmReportUser(true);
  }, []);

  const handleReportSubmit = useCallback(
    async ({ reasons, message }: ReportData) => {
      if (!userLoggedIn) {
        const onSignUp: ReportUserOnSignUp = {
          type: 'report-user',
          userId: creator.uuid ?? undefined,
          message,
          reasons,
        };

        const [path, query] = window.location.href.split('?');
        const onSignUpQuery = `onSignUp=${JSON.stringify(onSignUp)}`;
        const queryWithOnSignUp = query
          ? `${query}&${onSignUpQuery}`
          : onSignUpQuery;

        Router.push(
          `/sign-up?reason=report&redirect=${encodeURIComponent(
            `${path}?${queryWithOnSignUp}`
          )}`
        );

        return false;
      }

      await reportUser(creator.uuid as string, reasons, message).catch((e) => {
        console.error(e);
        return false;
      });

      return true;
    },
    [userLoggedIn, creator.uuid]
  );
  const handleReportClose = useCallback(() => setConfirmReportUser(false), []);

  const moreButtonRef: any = useRef();

  return (
    <SCard>
      {withEllipseMenu && (
        <SMoreButton
          view='transparent'
          iconOnly
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEllipseMenu();
          }}
          ref={moreButtonRef}
        >
          <InlineSvg
            svg={MoreIconFilled}
            fill='#FFFFFF'
            width='20px'
            height='20px'
          />
        </SMoreButton>
      )}
      {!isMobile && (
        <UserEllipseMenu
          isVisible={ellipseMenuOpen}
          isBlocked={isUserBlocked}
          top='48px'
          right='0px'
          handleClose={() => setEllipseMenuOpen(false)}
          handleClickBlock={async () => {
            if (isUserBlocked) {
              await changeUserBlockedStatus(creator.uuid, false);
            } else {
              setBlockUserModalOpen(true);
            }
          }}
          handleClickReport={handleClickReport}
          anchorElement={moreButtonRef.current}
        />
      )}
      <SUserAvatarContainer>
        <SUserAvatarInnerContainer>
          <UserAvatar avatarUrl={creator.avatarUrl ?? ''} withSkeleton />
        </SUserAvatarInnerContainer>
      </SUserAvatarContainer>
      <SDisplayNameContainer isVerified={!!creator.options?.isVerified}>
        <SDisplayName user={creator} />
      </SDisplayNameContainer>
      <SUserName>@{creator.username}</SUserName>
      {onBundleClicked && (
        <SButton
          highlighted={!!creatorsBundle}
          onClick={(e) => {
            e.stopPropagation();
            onBundleClicked(creator);
          }}
        >
          {creatorsBundle
            ? t('creatorCard.purchasedVotes', {
                value: formatNumber(
                  creatorsBundle.bundle?.votesLeft || 0,
                  true
                ),
              })
            : t('creatorCard.buyBundle')}
        </SButton>
      )}
      <SBackground>
        {/* Can't pass ref NextJs is below 13.0.6 */}
        <SImage
          src={creator.coverUrl ?? ''}
          layout='fill'
          visible={backgroundLoaded}
          onLoad={() => {
            setBackgroundLoaded(true);
          }}
          onLoadingComplete={(e) => {
            setBackgroundLoaded(true);
          }}
        />
        {!backgroundLoaded && (
          <SBackgroundSkeleton
            bgColor={theme.colorsThemed.background.secondary}
            highlightColor={theme.colorsThemed.background.tertiary}
          />
        )}
      </SBackground>
      {/* Modals */}
      {isMobile && (
        <UserEllipseModal
          isOpen={ellipseMenuOpen}
          zIndex={10}
          isBlocked={isUserBlocked}
          onClose={() => setEllipseMenuOpen(false)}
          handleClickBlock={async () => {
            if (isUserBlocked) {
              await changeUserBlockedStatus(creator.uuid, false);
            } else {
              setBlockUserModalOpen(true);
            }
          }}
          handleClickReport={() => {
            setConfirmReportUser(true);
          }}
        />
      )}
      <BlockUserModalProfile
        confirmBlockUser={blockUserModalOpen}
        user={creator}
        closeModal={() => setBlockUserModalOpen(false)}
      />
      <ReportModal
        show={confirmReportUser}
        reportedUser={creator}
        onSubmit={handleReportSubmit}
        onClose={handleReportClose}
      />
    </SCard>
  );
};

export default CreatorCard;

const SCard = styled.div`
  position: relative;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1.5px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colorsThemed.background.primary};
  position: relative;
  height: auto;
  cursor: pointer;
  transition: 0.2s linear;

  &:hover {
    transform: translateY(-8px);
  }
`;

const SBackgroundSkeleton = styled(GenericSkeleton)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  z-index: 0;
`;

const SBackground = styled.div`
  height: 68px;
  position: absolute;
  left: 10px;
  right: 10px;
  top: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
`;

const SImage = styled(Image)<{ visible: boolean }>`
  object-fit: cover;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

const SUserAvatarContainer = styled.div`
  position: relative;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-top: 17px;
  margin-bottom: 10px;
`;

const SUserAvatarInnerContainer = styled.div`
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colorsThemed.background.primary};
  position: relative;
  z-index: 1;

  & > * {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
  }
`;

const SDisplayNameContainer = styled.div<{ isVerified?: boolean }>`
  display: flex;
  flex-direction: row;
  max-width: 100%;
  align-items: center;
  overflow: hidden;
  margin: 0 0 5px;
  padding-left: ${({ isVerified }) => (isVerified ? '24px' : '0px')};
`;

const SDisplayName = styled(DisplayName)`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SUserName = styled.p`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  text-align: center;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SButton = styled.button<{ highlighted: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;

  font-size: 14px;
  line-height: 24px;
  font-weight: bold;

  padding: 8px 16px;
  margin-top: 16px;
  margin-bottom: 10px;

  color: ${({ theme, highlighted }) =>
    highlighted
      ? theme.colors.darkGray
      : theme.colorsThemed.button.color.primary};
  background: ${({ theme, highlighted }) =>
    highlighted
      ? theme.colorsThemed.accent.yellow
      : theme.colorsThemed.button.background.primaryGrad};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: transparent;

  cursor: pointer;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const SMoreButton = styled(Button)`
  position: absolute;
  top: 16px;
  right: 16px;

  z-index: 1;

  border-radius: 12px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  padding: 8px;
  ${(props) => props.theme.media.tablet} {
    margin-left: 50px;
  }
  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;
