/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-lonely-if */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

import Text from '../../../atoms/Text';
import UserAvatar from '../../UserAvatar';
import Lottie from '../../../atoms/Lottie';
import Caption from '../../../atoms/Caption';
import Indicator from '../../../atoms/Indicator';
import NoResults from './notifications/NoResults';
import { useAppSelector } from '../../../../redux-store/store';
import {
  getMyNotifications,
  markAllAsRead,
} from '../../../../api/endpoints/notification';
import loadingAnimation from '../../../../public/animations/logo-loading-blue.json';
import mobileLogo from '../../../../public/images/svg/mobile-logo.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';
import usePagination, {
  PaginatedResponse,
  Paging,
} from '../../../../utils/hooks/usePagination';
import findName from '../../../../utils/findName';

interface IFunction {
  markReadNotifications: boolean;
}

export const NotificationsList: React.FC<IFunction> = ({
  markReadNotifications,
}) => {
  const scrollRef: any = useRef();
  const { ref: scrollRefNotifications, inView } = useInView();
  const user = useAppSelector((state) => state.user);
  const [unreadNotifications, setUnreadNotifications] = useState<
    number[] | null
  >(null);

  // TODO: return a list of new notifications once WS message can be used
  // const [newNotifications, setNewNotifications] = useState<
  //   newnewapi.INotification[]
  // >([]);

  const loadData = useCallback(
    async (
      paging: Paging
    ): Promise<PaginatedResponse<newnewapi.INotification>> => {
      const payload = new newnewapi.GetMyNotificationsRequest({
        paging,
      });

      const res = await getMyNotifications(payload);

      if (!res.data || res.error) {
        throw new Error(res.error?.message ?? 'Request failed');
      }

      setUnreadNotifications((curr) => {
        const arr = curr ? [...curr] : [];
        res.data?.notifications.forEach((item) => {
          if (!item.isRead) {
            arr.push(item.id as number);
          }
        });
        return arr;
      });

      return {
        nextData: res.data.notifications,
        nextPageToken: res.data.paging?.nextPageToken,
      };
    },
    []
  );

  const {
    data: notifications,
    loading,
    hasMore,
    loadMore,
  } = usePagination(loadData, 6);

  const markAllNotifications = useCallback(async () => {
    try {
      const payload = new newnewapi.EmptyRequest();
      const res = await markAllAsRead(payload);

      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      setUnreadNotifications(null);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (markReadNotifications) {
      markAllNotifications();
    }
  }, [markReadNotifications, markAllNotifications]);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      loadMore().catch((e) => console.error(e));
    }
  }, [inView, loading, hasMore, loadMore]);

  const getUrl = (target: newnewapi.IRoutingTarget | null | undefined) => {
    if (target) {
      if (target.creatorDashboard && target?.creatorDashboard.section === 2)
        return '/direct-messages';

      if (target.creatorDashboard && target?.creatorDashboard.section === 1)
        return '/creator/subscribers';

      if (target.userProfile && target?.userProfile.userUsername)
        return `/direct-messages/${target.userProfile.userUsername}`;

      if (target.postResponse && target?.postResponse.postUuid)
        return `/post/${target.postResponse.postUuid}`;

      if (target.postAnnounce && target?.postAnnounce.postUuid)
        return `/post/${target.postAnnounce.postUuid}`;
    }
    return '/direct-messages';
  };

  const getEnrichedNotificationMessage = useCallback(
    (notification: newnewapi.INotification) => {
      if (!notification.content?.message) {
        return undefined;
      }

      if (
        notification.content.relatedUser &&
        notification.content.relatedUser.isVerified
      ) {
        const name = findName(
          notification.content.message,
          notification.content.relatedUser
        );

        if (name) {
          const beforeName = notification.content.message.slice(
            0,
            name.startsAtIndex
          );
          const afterName = notification.content.message.slice(
            name.startsAtIndex + name.text.length
          );
          return (
            <>
              {beforeName}
              {name.text}
              <SInlineSvg
                svg={VerificationCheckmark}
                width='16px'
                height='16px'
              />
              {afterName}
            </>
          );
        }
      }

      return notification.content.message;
    },
    []
  );

  const renderNotificationItem = useCallback(
    (item: newnewapi.INotification) => {
      const message = getEnrichedNotificationMessage(item);

      return (
        <Link href={getUrl(item.target)} key={item.id as number}>
          <a>
            <SNotificationItem key={`notification-item-${item.id}`}>
              {item.content?.relatedUser?.uuid !== user.userData?.userUuid ? (
                <SNotificationItemAvatar
                  withClick
                  avatarUrl={
                    item.content?.relatedUser?.thumbnailAvatarUrl ?? ''
                  }
                />
              ) : (
                <SIconHolder>
                  <InlineSvg
                    clickable
                    svg={mobileLogo}
                    fill='#fff'
                    width='24px'
                    height='24px'
                  />
                </SIconHolder>
              )}
              <SNotificationItemCenter>
                {message && (
                  <SNotificationItemText variant={3} weight={600}>
                    {message}
                  </SNotificationItemText>
                )}
                <SNotificationItemTime variant={2} weight={600}>
                  {moment((item.createdAt?.seconds as number) * 1000).fromNow()}
                </SNotificationItemTime>
              </SNotificationItemCenter>
              {unreadNotifications &&
                unreadNotifications.length > 0 &&
                unreadNotifications.findIndex(
                  (unreadNotificationId) => unreadNotificationId === item.id
                ) > -1 && <SNotificationItemIndicator minified />}
            </SNotificationItem>
          </a>
        </Link>
      );
    },
    [
      unreadNotifications,
      user.userData?.userUuid,
      getEnrichedNotificationMessage,
    ]
  );

  // TODO: return a list of new notifications once WS message can be used
  // const displayedNotifications: newnewapi.INotification[] = useMemo(() => {
  //   return  [...newNotifications, ...notifications];
  // }, [notifications, newNotifications]);

  return (
    <>
      <SSectionContent ref={scrollRef}>
        {loading === undefined ? (
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimation,
            }}
          />
        ) : !notifications && loading ? (
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimation,
            }}
          />
        ) : notifications && notifications.length < 1 ? (
          <NoResults />
        ) : (
          notifications && notifications.map(renderNotificationItem)
        )}
        {hasMore && !loading && (
          <SRef ref={scrollRefNotifications}>
            <Lottie
              width={64}
              height={64}
              options={{
                loop: true,
                autoplay: true,
                animationData: loadingAnimation,
              }}
            />
          </SRef>
        )}
      </SSectionContent>
    </>
  );
};

export default NotificationsList;

const SSectionContent = styled.div`
  height: calc(100% - 48px);
  padding: 0 24px;
  display: flex;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
  // Scrollbar
  &::-webkit-scrollbar {
    width: 4px;
  }
  scrollbar-width: none;
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
    transition: 0.2s linear;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
    transition: 0.2s linear;
  }

  &:hover {
    scrollbar-width: thin;
    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.colorsThemed.background.outlines1};
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colorsThemed.background.outlines2};
    }
  }
`;

const SNotificationItem = styled.div`
  cursor: pointer;
  display: flex;
  padding: 8px 0;
`;

const SNotificationItemAvatar = styled(UserAvatar)``;

const SIconHolder = styled.div`
  background: ${(props) => props.theme.colorsThemed.accent.blue};
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SNotificationItemCenter = styled.div`
  width: 100%;
  display: flex;
  padding: 0 12px;
  flex-direction: column;
`;

const SNotificationItemText = styled(Text)`
  display: inline;
  margin-bottom: 4px;
`;

const SNotificationItemTime = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const SNotificationItemIndicator = styled(Indicator)`
  border: 3px solid
    ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colors.white
        : props.theme.colorsThemed.button.background.secondary};
  padding: 5px;
`;

const SRef = styled.span`
  overflow: hidden;
  text-align: center;
  flex-shrink: 0;
`;

const SInlineSvg = styled(InlineSvg)`
  display: inline-flex;
  transform: translateY(4px);
  margin-left: 2px;
  margin-top: -2px;
`;
