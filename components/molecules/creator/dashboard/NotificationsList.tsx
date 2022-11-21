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
import { useNotifications } from '../../../../contexts/notificationsContext';
import mobileLogo from '../../../../public/images/svg/mobile-logo.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';

interface IFunction {
  markReadNotifications: boolean;
}

export const NotificationsList: React.FC<IFunction> = ({
  markReadNotifications,
}) => {
  const scrollRef: any = useRef();
  const { ref: scrollRefNotifications, inView } = useInView();
  const user = useAppSelector((state) => state.user);
  const [notifications, setNotifications] = useState<
    newnewapi.INotification[] | null
  >(null);
  const [unreadNotifications, setUnreadNotifications] = useState<
    number[] | null
  >(null);
  const [notificationsNextPageToken, setNotificationsNextPageToken] = useState<
    string | undefined | null
  >('');
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [defaultLimit, setDefaultLimit] = useState<number>(11);
  const { unreadNotificationCount } = useNotifications();
  const [localUnreadNotificationCount, setLocalUnreadNotificationCount] =
    useState<number>(0);

  const fetchNotification = useCallback(
    async (args?: any) => {
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
            // We don`t update token since we only loaded the new first items
          }
        } else {
          // If there is no results then there is no more pages to load
          setNotificationsNextPageToken(null);
        }

        if (!res.data.paging?.nextPageToken) {
          setNotificationsNextPageToken(null);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading]
  );

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
    if (!notifications) {
      fetchNotification();
    }
  }, [notifications, fetchNotification]);

  useEffect(() => {
    if (markReadNotifications) {
      markAllNotifications();
    }
  }, [markReadNotifications, markAllNotifications]);

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
    return '/direct-messages';
  };

  const findName = useCallback(
    (message: string, author: newnewapi.ITinyUser) => {
      if (author.nickname) {
        const nicknameIndex = message.indexOf(author.nickname);
        if (nicknameIndex > -1) {
          return {
            text: author.nickname,
            startsAtIndex: nicknameIndex,
          };
        }
      }

      if (author.username) {
        const usernameIndex = message.indexOf(author.username);
        if (usernameIndex > -1) {
          return {
            text: author.username,
            startsAtIndex: usernameIndex,
          };
        }
      }

      return undefined;
    },
    []
  );

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
              {notification.content.relatedUser.nickname}
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
    [findName]
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
