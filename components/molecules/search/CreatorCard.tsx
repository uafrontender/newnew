import { newnewapi } from 'newnew-api';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import UnsubscribeModal from '../profile/UnsubscribeModal';

import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';

import { formatNumber } from '../../../utils/format';
import { useAppSelector } from '../../../redux-store/store';
import { reportUser } from '../../../api/endpoints/report';
import { useGetBlockedUsers } from '../../../contexts/blockedUsersContext';
import { markUser } from '../../../api/endpoints/user';
import UserEllipseModal from '../profile/UserEllipseModal';
import { getSubscriptionStatus } from '../../../api/endpoints/subscription';
import { useGetSubscriptions } from '../../../contexts/subscriptionsContext';

interface ICreatorCard {
  creator: newnewapi.IUser;
  // TODO: make sign creator specific, get more data
  sign?: string;
  subscriptionPrice?: number;
  withEllipseMenu?: boolean;
}

export const CreatorCard: React.FC<ICreatorCard> = ({
  creator,
  sign,
  subscriptionPrice,
  withEllipseMenu,
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const currentUser = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Subscription status
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [wasSubscribed, setWasSubscribed] = useState(false);
  const { creatorsImSubscribedTo } = useGetSubscriptions();

  // Ellipse menu
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);

  // Modals
  const [blockUserModalOpen, setBlockUserModalOpen] = useState(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
  const [unsubscribeModalOpen, setUnsubscribeModalOpen] = useState(false);
  const { usersIBlocked, unblockUser } = useGetBlockedUsers();
  const isUserBlocked = useMemo(
    () => usersIBlocked.includes(creator.uuid as string),
    [usersIBlocked, creator.uuid]
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
    if (!currentUser.loggedIn) {
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

  useEffect(() => {
    async function fetchIsSubscribed() {
      try {
        const getStatusPayload = new newnewapi.SubscriptionStatusRequest({
          creatorUuid: creator.uuid,
        });

        const res = await getSubscriptionStatus(getStatusPayload);

        if (res.data?.status?.activeRenewsAt) {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
        if (res.data?.status?.activeCancelsAt) {
          setWasSubscribed(true);
        } else {
          setWasSubscribed(false);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchIsSubscribed();

    // TODO: After update GetCreatorsImSubscribedToResponse on backend remaster this section
    // let isSub = undefined;
    // if (creatorsImSubscribedTo && creatorsImSubscribedTo.length > 0) {
    //   isSub = creatorsImSubscribedTo.find((cr) => cr.uuid === user.uuid);
    // }
    // isSub ? setIsSubscribed(true) : setIsSubscribed(false);
  }, [creatorsImSubscribedTo, creator.uuid]);

  return (
    <SCard showSubscriptionPrice={subscriptionPrice !== undefined}>
      {withEllipseMenu && (
        <SMoreButton
          view='transparent'
          iconOnly
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEllipseMenu();
          }}
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
          isSubscribed={isSubscribed}
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
          handleClickUnsubscribe={() => {
            setUnsubscribeModalOpen(true);
          }}
        />
      )}
      <SUserAvatarContainer>
        <SUserAvatar>
          <UserAvatar avatarUrl={creator.avatarUrl ?? ''} />
        </SUserAvatar>
        {sign && isSubscribed && <AvatarSign>{sign}</AvatarSign>}
        {wasSubscribed && <AvatarSign>{t('creatorCard.cancelled')}</AvatarSign>}
      </SUserAvatarContainer>
      <SDisplayName>{creator.nickname}</SDisplayName>
      <SUserName>@{creator.username}</SUserName>
      {subscriptionPrice !== undefined && subscriptionPrice > 0 && (
        <SSubscriptionPrice>
          {t('creatorCard.subscriptionCost', {
            amount: formatNumber(subscriptionPrice / 100, true),
          })}
        </SSubscriptionPrice>
      )}
      <SBackground>
        <Image src={creator.coverUrl ?? ''} layout='fill' />
      </SBackground>
      {/* Modals */}
      {isMobile && (
        <UserEllipseModal
          isOpen={ellipseMenuOpen}
          zIndex={10}
          isSubscribed={isSubscribed}
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
          handleClickUnsubscribe={() => {
            setUnsubscribeModalOpen(true);
          }}
        />
      )}
      <UnsubscribeModal
        confirmUnsubscribe={unsubscribeModalOpen}
        user={creator}
        closeModal={() => setUnsubscribeModalOpen(false)}
        onUnsubcribeSuccess={() => {
          setIsSubscribed(false);
          setWasSubscribed(true);
        }}
      />
      <BlockUserModalProfile
        confirmBlockUser={blockUserModalOpen}
        user={creator}
        closeModal={() => setBlockUserModalOpen(false)}
      />
      <ReportModal
        show={confirmReportUser}
        reportedDisplayname={
          creator.nickname ? creator.nickname || `@${creator.username}` : ''
        }
        onSubmit={handleReportSubmit}
        onClose={handleReportClose}
      />
    </SCard>
  );
};

export default CreatorCard;

CreatorCard.defaultProps = {
  sign: '',
  subscriptionPrice: undefined,
};

const SCard = styled.div<{ showSubscriptionPrice: boolean }>`
  position: relative;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1.5px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  position: relative;
  height: ${({ showSubscriptionPrice }) =>
    showSubscriptionPrice ? '185px' : '160px'};
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

const AvatarSign = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: -5px;
  padding: 0px 8px;
  background-color: ${({ theme }) => theme.colorsThemed.accent.yellow};
  color: #2c2c33;
  border-radius: 10px;
  height: 20px;
  font-size: 8px;
  line-height: 8px;
  font-weight: 800;
  text-transform: uppercase;
  z-index: 2;
`;

const SDisplayName = styled.p`
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  margin: 0 0 5px;
`;

const SUserName = styled.p`
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SSubscriptionPrice = styled.p`
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  margin-top: 5px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
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
