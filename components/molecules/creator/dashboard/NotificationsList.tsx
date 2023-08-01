import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
  useContext,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { useRouter } from 'next/dist/client/router';

import Text from '../../../atoms/Text';
import UserAvatar from '../../UserAvatar';
import Lottie from '../../../atoms/Lottie';
import Caption from '../../../atoms/Caption';
import Indicator from '../../../atoms/Indicator';
import NoResults from './notifications/NoResults';
import { useUserData } from '../../../../contexts/userDataContext';
import {
  markAllAsRead,
  markAsRead,
} from '../../../../api/endpoints/notification';
import loadingAnimation from '../../../../public/animations/logo-loading-blue.json';
import mobileLogo from '../../../../public/images/svg/MobileLogo.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';
import findName from '../../../../utils/findName';
import { useNotifications } from '../../../../contexts/notificationsContext';
import Loader from '../../../atoms/Loader';
import { SocketContext } from '../../../../contexts/socketContext';
import useMyNotifications from '../../../../utils/hooks/useMyNotifications';

interface IFunction {
  markReadNotifications: boolean;
}

export const NotificationsList: React.FC<IFunction> = ({
  markReadNotifications,
}) => {
  const scrollRef: any = useRef();
  const { socketConnection } = useContext(SocketContext);
  const { ref: scrollRefNotifications, inView } = useInView();
  const { userData } = useUserData();
  const { locale } = useRouter();
  const { unreadNotificationCount, notificationsDataLoaded } =
    useNotifications();

  const [newNotifications, setNewNotifications] = useState<
    newnewapi.INotification[]
  >([]);

  const [unreadNotifications, setUnreadNotifications] = useState<
    number[] | null
  >(null);

  // Used to update notification timers
  const [currentTime, setCurrentTime] = useState(Date.now());

  const { data, isLoading, hasNextPage, isFetched, fetchNextPage } =
    useMyNotifications({
      limit: 10,
    });

  const notifications = useMemo(() => {
    if (data) {
      return data.pages.map((page) => page.notifications).flat();
    }

    return [];
  }, [data]);

  useEffect(() => {
    setUnreadNotifications((curr) => {
      const arr = curr ? [...curr] : [];
      notifications.forEach((item) => {
        if (!item.isRead) {
          arr.push(item.id as number);
        }
      });
      return arr;
    });
  }, [notifications]);

  const markAllNotifications = useCallback(async () => {
    try {
      const payload = new newnewapi.EmptyRequest();
      const res = await markAllAsRead(payload);

      if (res.error) {
        throw new Error(res.error?.message ?? 'Request failed');
      }

      setUnreadNotifications(null);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const markNotificationAsRead = useCallback(
    async (notification: newnewapi.INotification) => {
      if (!notification || notification.isRead) {
        return;
      }

      try {
        const payload = new newnewapi.MarkAsReadRequest({
          notificationIds: [notification.id as number],
        });
        const res = await markAsRead(payload);

        if (res.error) {
          throw new Error(res.error?.message ?? 'Request failed');
        }

        setUnreadNotifications((curr) => {
          const arr = curr ? [...curr] : [];
          const result = arr.filter((item) => item !== notification.id);
          return result;
        });
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  useEffect(() => {
    if (markReadNotifications) {
      markAllNotifications();
    }
  }, [markReadNotifications, markAllNotifications]);

  useEffect(() => {
    if (inView && !isLoading && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isLoading, hasNextPage, fetchNextPage]);

  useEffect(() => {
    const updateTimeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => {
      clearInterval(updateTimeInterval);
    };
  }, []);

  useEffect(() => {
    // If all notifications read in other tabs/apps
    if (notificationsDataLoaded && unreadNotificationCount === 0) {
      setUnreadNotifications([]);
    }
  }, [notificationsDataLoaded, unreadNotificationCount]);

  useEffect(() => {
    const handleNotificationCreated = async (newData: any) => {
      const arr = new Uint8Array(newData);
      const decoded = newnewapi.NotificationCreated.decode(arr);

      if (!decoded) {
        return;
      }

      setNewNotifications((curr) => {
        if (!decoded.notification) {
          return curr;
        }

        return [decoded.notification, ...curr];
      });
    };

    if (socketConnection) {
      socketConnection?.on('NotificationCreated', handleNotificationCreated);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('NotificationCreated', handleNotificationCreated);
      }
    };
  }, [socketConnection]);

  // TODO: make changes to `newnewapi.IRoutingTarget` to support postShortId
  const getUrl = (target: newnewapi.IRoutingTarget | null | undefined) => {
    if (target) {
      if (target.creatorDashboard && target?.creatorDashboard.section === 2) {
        return '/direct-messages';
      }

      if (target.creatorDashboard && target?.creatorDashboard.section === 1) {
        return '/creator/subscribers';
      }

      if (target.userProfile && target?.userProfile.userUsername) {
        return `/direct-messages/${target.userProfile.userUsername}`;
      }

      if (
        target.postResponse &&
        (target?.postResponse.postShortId || target?.postResponse.postUuid)
      ) {
        return `/p/${
          target?.postResponse.postShortId || target?.postResponse.postUuid
        }`;
      }

      if (
        target.postAnnounce &&
        (target?.postAnnounce.postShortId || target?.postAnnounce.postUuid)
      ) {
        return `/p/${
          target?.postAnnounce.postShortId || target?.postAnnounce.postUuid
        }`;
      }
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
    (item: newnewapi.INotification, itemCurrentTime: number) => {
      const message = getEnrichedNotificationMessage(item);

      return (
        <Link href={getUrl(item.target)} key={item.id as number}>
          <a>
            <SNotificationItem
              key={`notification-item-${item.id}`}
              onClick={() => {
                markNotificationAsRead(item);
              }}
              onContextMenu={() => {
                markNotificationAsRead(item);
              }}
            >
              {item.content?.relatedUser?.uuid !== userData?.userUuid ? (
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
                  {moment((item.createdAt?.seconds as number) * 1000)
                    .locale(locale || 'en-US')
                    .fromNow()}
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
      userData?.userUuid,
      locale,
      unreadNotifications,
      getEnrichedNotificationMessage,
      markNotificationAsRead,
    ]
  );

  const displayedNotifications: newnewapi.INotification[] = useMemo(
    () => [...newNotifications, ...notifications],
    [newNotifications, notifications]
  );

  return (
    <div ref={scrollRef}>
      {
        // eslint-disable-next-line no-nested-ternary
        !displayedNotifications?.length && (isLoading || !isFetched) ? (
          <Loader size='md' isStatic />
        ) : displayedNotifications && displayedNotifications.length < 1 ? (
          <NoResults />
        ) : (
          displayedNotifications &&
          displayedNotifications.map((notification) =>
            renderNotificationItem(notification, currentTime)
          )
        )
      }
      {hasNextPage && !isLoading && isFetched && (
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
    </div>
  );
};

export default NotificationsList;

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
  overflow: hidden;
`;

const SNotificationItemText = styled(Text)`
  display: inline;
  margin-bottom: 4px;

  overflow: hidden;
  text-overflow: ellipsis;
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
  transform: translateY(6px);
  margin-left: 2px;
  margin-top: -6px;
  width: 20px;
  height: 20px;
`;
