import React, {
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useContext,
  useState,
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
import loadingAnimation from '../../../../public/animations/logo-loading-blue.json';
import mobileLogo from '../../../../public/images/svg/MobileLogo.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';
import findName from '../../../../utils/findName';
import { useNotifications } from '../../../../contexts/notificationsContext';
import Loader from '../../../atoms/Loader';
import { SocketContext } from '../../../../contexts/socketContext';
import useMyNotifications, {
  useMyNotificationsActions,
} from '../../../../utils/hooks/useMyNotifications';

interface IFunction {}

export const NotificationsList: React.FC<IFunction> = () => {
  const scrollRef: any = useRef();
  const { socketConnection } = useContext(SocketContext);
  const { ref: scrollRefNotifications, inView } = useInView();
  const { userData } = useUserData();
  const { locale } = useRouter();
  const { unreadNotificationCount, notificationsDataLoaded } =
    useNotifications();

  // Used to update notification timers
  const [currentTime, setCurrentTime] = useState(Date.now());

  const { data, isLoading, hasNextPage, isFetched, fetchNextPage } =
    useMyNotifications({
      limit: 10,
    });

  const { markAsReadMutation, markAllAsRead, addNewNotificationMutation } =
    useMyNotificationsActions();

  const { mutate: markNotificationAsRead } = markAsReadMutation;
  const { mutate: addNewNotification } = addNewNotificationMutation;

  const notifications = useMemo(() => {
    if (data) {
      return data.pages.map((page) => page.notifications).flat();
    }

    return [];
  }, [data]);

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
      markAllAsRead();
    }
  }, [notificationsDataLoaded, unreadNotificationCount, markAllAsRead]);

  useEffect(() => {
    const handleNotificationCreated = async (newData: any) => {
      const arr = new Uint8Array(newData);
      const decoded = newnewapi.NotificationCreated.decode(arr);

      if (!decoded) {
        return;
      }

      if (decoded.notification) {
        addNewNotification(decoded.notification);
      }
    };

    if (socketConnection) {
      socketConnection?.on('NotificationCreated', handleNotificationCreated);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('NotificationCreated', handleNotificationCreated);
      }
    };
  }, [socketConnection, addNewNotification]);

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
              {!item.isRead && <SNotificationItemIndicator minified />}
            </SNotificationItem>
          </a>
        </Link>
      );
    },
    [
      userData?.userUuid,
      locale,
      getEnrichedNotificationMessage,
      markNotificationAsRead,
    ]
  );

  return (
    <div ref={scrollRef}>
      {
        // eslint-disable-next-line no-nested-ternary
        !notifications?.length && (isLoading || !isFetched) ? (
          <Loader size='md' isStatic />
        ) : notifications && notifications.length < 1 ? (
          <NoResults />
        ) : (
          notifications &&
          notifications.map((notification) =>
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
