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
import NoResults from '../../notifications/NoResults';
// import { useAppSelector } from '../../../../redux-store/store';
import {
  getMyNotifications,
  markAsRead,
} from '../../../../api/endpoints/notification';
import loadingAnimation from '../../../../public/animations/logo-loading-blue.json';
import { useNotifications } from '../../../../contexts/notificationsContext';

interface IFunction {
  markReadNotifications: boolean;
}

export const NotificationsList: React.FC<IFunction> = ({
  markReadNotifications,
}) => {
  const scrollRef: any = useRef();
  const { ref: scrollRefNotifications, inView } = useInView();
  // const user = useAppSelector((state) => state.user);
  const [notifications, setNotifications] =
    useState<newnewapi.INotification[] | null>(null);
  const [unreadNotifications, setUnreadNotifications] =
    useState<number[] | null>(null);
  const [notificationsNextPageToken, setNotificationsNextPageToken] =
    useState<string | undefined | null>('');
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [defaultLimit, setDefaultLimit] = useState<number>(11);
  const { unreadNotificationCount } = useNotifications();
  const [localUnreadNotificationCount, setLocalUnreadNotificationCount] =
    useState<number>(0);

  const fetchNotification = useCallback(
    async (args?) => {
      if (loading) return;
      setLoading(true);
      const limit: number = args && args.limit ? args.limit : defaultLimit;
      const pageToken: string = args && args.pageToken ? args.pageToken : null;
      try {
        if (!pageToken && limit === defaultLimit) setNotifications([]);
        const payload = new newnewapi.GetMyNotificationsRequest({
          paging: {
            limit,
            pageToken,
          },
        });
        const res = await getMyNotifications(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        if (res.data.notifications.length > 0) {
          if (limit === defaultLimit) {
            setNotifications((curr) => {
              const arr = curr ? [...curr] : [];
              res.data?.notifications.forEach((item) => {
                arr.push(item);
              });
              return arr;
            });
            setUnreadNotifications((curr) => {
              const arr = curr ? [...curr] : [];
              res.data?.notifications.forEach((item) => {
                if (!item.isRead) {
                  arr.push(item.id as number);
                }
              });
              return arr;
            });
            setNotificationsNextPageToken(res.data.paging?.nextPageToken);
          } else {
            setNotifications((curr) => {
              const arr = curr ? [...curr] : [];
              if (res.data) arr.unshift(res.data.notifications[0]);
              return arr;
            });
            setUnreadNotifications((curr) => {
              const arr = curr ? [...curr] : [];
              if (res.data) arr.push(res.data.notifications[0].id as number);
              return arr;
            });
          }
        }
        if (!res.data.paging?.nextPageToken && notificationsNextPageToken)
          setNotificationsNextPageToken(null);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading]
  );

  const readNotification = useCallback(
    async () => {
      try {
        const payload = new newnewapi.MarkAsReadRequest({
          notificationIds: unreadNotifications,
        });
        const res = await markAsRead(payload);

        if (res.error) throw new Error(res.error?.message ?? 'Request failed');
        setUnreadNotifications(null);
      } catch (err) {
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unreadNotifications, markReadNotifications]
  );

  useEffect(() => {
    if (!notifications) {
      fetchNotification();
    }
  }, [notifications, fetchNotification]);

  useEffect(() => {
    if (
      markReadNotifications &&
      unreadNotifications &&
      unreadNotifications.length > 0
    ) {
      readNotification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markReadNotifications]);

  useEffect(() => {
    if (inView && !loading && notificationsNextPageToken) {
      fetchNotification({ pageToken: notificationsNextPageToken });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, loading, notificationsNextPageToken]);

  useEffect(() => {
    if (initialLoad) {
      setLocalUnreadNotificationCount(unreadNotificationCount);
      setInitialLoad(false);
    } else {
      if (unreadNotificationCount > localUnreadNotificationCount) {
        fetchNotification({ limit: 1 });
      } else {
        setLocalUnreadNotificationCount(unreadNotificationCount);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, unreadNotificationCount]);

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
    return '';
  };

  const renderNotificationItem = useCallback(
    (item: newnewapi.INotification) => (
      <Link href={getUrl(item.target)}>
        <a>
          <SNotificationItem key={`notification-item-${item.id}`}>
            <SNotificationItemAvatar
              withClick
              // onClick={handleUserClick}
              avatarUrl={
                item.content?.relatedUser?.thumbnailAvatarUrl
                  ? item.content?.relatedUser?.thumbnailAvatarUrl
                  : ''
              }
            />
            <SNotificationItemCenter>
              {item.content && (
                <SNotificationItemText variant={3} weight={600}>
                  {item.content.message}
                </SNotificationItemText>
              )}
              <SNotificationItemTime variant={2} weight={600}>
                {moment((item.createdAt?.seconds as number) * 1000).fromNow()}
              </SNotificationItemTime>
            </SNotificationItemCenter>
            {!item.isRead && <SNotificationItemIndicator minified />}
          </SNotificationItem>
        </a>
      </Link>
    ),

    []
  );

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
        {notificationsNextPageToken && !loading && (
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

const SNotificationItemCenter = styled.div`
  width: 100%;
  display: flex;
  padding: 0 12px;
  flex-direction: column;
`;

const SNotificationItemText = styled(Text)`
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
`;
