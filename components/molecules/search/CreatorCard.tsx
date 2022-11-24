import { newnewapi } from 'newnew-api';
import React, { useCallback, useMemo, useState, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import UserAvatar from '../UserAvatar';
import InlineSvg from '../../atoms/InlineSVG';
import Button from '../../atoms/Button';
import UserEllipseMenu from '../profile/UserEllipseMenu';
import ReportModal, { ReportData } from '../chat/ReportModal';
import BlockUserModalProfile from '../profile/BlockUserModalProfile';

import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import { useAppSelector } from '../../../redux-store/store';
import { reportUser } from '../../../api/endpoints/report';
import { useGetBlockedUsers } from '../../../contexts/blockedUsersContext';
import { markUser } from '../../../api/endpoints/user';
import UserEllipseModal from '../profile/UserEllipseModal';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import { useBundles } from '../../../contexts/bundlesContext';
import { formatNumber } from '../../../utils/format';
import getDisplayname from '../../../utils/getDisplayname';

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
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Ellipse menu
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);

  // Modals
  const [blockUserModalOpen, setBlockUserModalOpen] = useState(false);
  const [confirmReportUser, setConfirmReportUser] = useState(false);
  const { usersIBlocked, unblockUser } = useGetBlockedUsers();
  const isUserBlocked = useMemo(
    () => usersIBlocked.includes(creator.uuid as string),
    [usersIBlocked, creator.uuid]
  );

  const { bundles } = useBundles();
  const creatorsBundle = useMemo(
    () => bundles?.find((bundle) => bundle.creator?.uuid === creator.uuid),
    [bundles, creator.uuid]
  );

  const unblockUserAsync = async (uuid: string) => {
    try {
      const payload = new newnewapi.MarkUserRequest({
        markAs: newnewapi.MarkUserRequest.MarkAs.NOT_BLOCKED,
        userUuid: uuid,
      });
      const res = await markUser(payload);
      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');
      unblockUser(uuid);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickReport = useCallback(() => {
    // Redirect only after the persist data is pulled
    if (!currentUser.loggedIn && currentUser._persist?.rehydrated) {
      router.push(
        `/sign-up?reason=report&redirect=${encodeURIComponent(
          window.location.href
        )}`
      );
      return;
    }

    setConfirmReportUser(true);
  }, [currentUser, router]);

  const handleReportSubmit = useCallback(
    async ({ reasons, message }: ReportData) => {
      await reportUser(creator.uuid as string, reasons, message).catch((e) =>
        console.error(e)
      );
    },
    [creator.uuid]
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
          loggedIn={currentUser.loggedIn}
          top='48px'
          right='0px'
          handleClose={() => setEllipseMenuOpen(false)}
          handleClickBlock={() => {
            if (isUserBlocked) {
              unblockUserAsync(creator.uuid as string);
            } else {
              setBlockUserModalOpen(true);
            }
          }}
          handleClickReport={handleClickReport}
          anchorElement={moreButtonRef.current}
        />
      )}
      <SUserAvatarContainer>
        <SUserAvatar>
          <UserAvatar avatarUrl={creator.avatarUrl ?? ''} />
        </SUserAvatar>
      </SUserAvatarContainer>
      <SDisplayNameContainer isVerified={!!creator.options?.isVerified}>
        <SDisplayName>{creator.nickname}</SDisplayName>
        {creator.options?.isVerified && (
          <SInlineSVG
            svg={VerificationCheckmark}
            width='16px'
            height='16px'
            fill='none'
          />
        )}
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
        <Image src={creator.coverUrl ?? ''} layout='fill' />
      </SBackground>
      {/* Modals */}
      {isMobile && (
        <UserEllipseModal
          isOpen={ellipseMenuOpen}
          zIndex={10}
          isBlocked={isUserBlocked}
          loggedIn={currentUser.loggedIn}
          onClose={() => setEllipseMenuOpen(false)}
          handleClickBlock={() => {
            if (isUserBlocked) {
              unblockUserAsync(creator.uuid as string);
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
        reportedDisplayname={getDisplayname(creator)}
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

const SBackground = styled.div`
  height: 68px;
  position: absolute;
  left: 10px;
  right: 10px;
  top: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
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

const SUserAvatar = styled.div`
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
  align-items: center;
  overflow: hidden;
  margin: 0 0 5px;
  padding-left: ${({ isVerified }) => (isVerified ? '24px' : '0px')};
`;

const SDisplayName = styled.p`
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SInlineSVG = styled(InlineSvg)`
  min-width: 24px;
  min-height: 24px;
`;

const SUserName = styled.p`
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
