import React, {
  ReactElement,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import Head from 'next/head';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from './_app';
import General from '../components/templates/General';
import Notification from '../components/molecules/notifications/Notification';
import { markAllAsRead } from '../api/endpoints/notification';
import { useNotifications } from '../contexts/notificationsContext';
import assets from '../constants/assets';
import Button from '../components/atoms/Button';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import { Mixpanel } from '../utils/mixpanel';
import { useAppState } from '../contexts/appStateContext';
import { SocketContext } from '../contexts/socketContext';
import useMyNotifications from '../utils/hooks/useMyNotifications';
import Loader from '../components/atoms/Loader';

const NoResults = dynamic(
  () => import('../components/molecules/notifications/NoResults')
);

export const Notifications = () => {
  const { t } = useTranslation('page-Notifications');
  const { ref: scrollRef, inView } = useInView();
  const router = useRouter();
  const { userLoggedIn } = useAppState();
  const [readAllToTime, setReadAllToTime] = useState<number | undefined>();

  // Used to update notification timers
  const [currentTime, setCurrentTime] = useState(Date.now());
  const { socketConnection } = useContext(SocketContext);

  const [newNotifications, setNewNotifications] = useState<
    newnewapi.INotification[]
  >([]);

  const {
    unreadNotificationCount,
    notificationsDataLoaded,
    fetchNotificationCount,
  } = useNotifications();

  const { data, isLoading, hasNextPage, isFetched, fetchNextPage } =
    useMyNotifications({
      limit: 6,
    });

  const notifications = useMemo(() => {
    if (data) {
      return data.pages.map((page) => page.notifications).flat();
    }

    return [];
  }, [data]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      Mixpanel.track('Mark All As Read Clicked', {
        _stage: 'Notifications',
      });

      if (notifications.length === 0) {
        return;
      }

      const lastNotification = notifications[0];
      if (lastNotification.createdAt?.seconds) {
        setReadAllToTime((lastNotification.createdAt.seconds as number) * 1000);
      }

      const payload = new newnewapi.EmptyRequest({});
      await markAllAsRead(payload);

      fetchNotificationCount();
    } catch (err) {
      console.error(err);
      setReadAllToTime(undefined);
    }
  }, [notifications, fetchNotificationCount]);

  useEffect(() => {
    // If all notifications read in other tabs/apps
    if (unreadNotificationCount === 0 && notificationsDataLoaded) {
      setReadAllToTime(Date.now());
    }
  }, [unreadNotificationCount, notificationsDataLoaded]);

  useEffect(() => {
    if (inView && !isLoading && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isLoading, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (!userLoggedIn) {
      router?.push('/sign-up');
    }
  }, [userLoggedIn, router]);

  useEffect(() => {
    const updateTimeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => {
      clearInterval(updateTimeInterval);
    };
  }, []);

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

  const displayedNotifications: newnewapi.INotification[] = useMemo(
    () => [...newNotifications, ...notifications],
    [newNotifications, notifications]
  );

  const renderNotification = useCallback(
    (item: newnewapi.INotification, itemCurrentTime: number) => {
      const { id, isRead, ...rest } = item;
      if (readAllToTime && item.createdAt?.seconds) {
        const createdAtTime = (item.createdAt.seconds as number) * 1000;
        if (readAllToTime >= createdAtTime) {
          return (
            <Notification
              key={id as any}
              id={id}
              isRead
              currentTime={itemCurrentTime}
              {...rest}
            />
          );
        }
      }

      return (
        <Notification
          key={id as any}
          id={id}
          isRead={isRead}
          currentTime={itemCurrentTime}
          {...rest}
        />
      );
    },
    [readAllToTime]
  );

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <SContent>
        <SHeadingWrapper>
          <SHeading>{t('meta.title')}</SHeading>
          {unreadNotificationCount > 0 && (
            <SButton onClick={handleMarkAllAsRead} view='secondary'>
              {t('button.markAllAsRead')}
            </SButton>
          )}
        </SHeadingWrapper>
        {/* Loading */}
        {!isFetched && <SLoader size='md' />}

        {/* Notifications */}
        {displayedNotifications.length > 0 && (
          <>
            {displayedNotifications?.map((notification) =>
              renderNotification(notification, currentTime)
            )}
            {isFetched && hasNextPage && !isLoading && (
              <SRef ref={scrollRef}>
                <SLoader size='md' />
              </SRef>
            )}
          </>
        )}

        {/* No notifications */}
        {isFetched && displayedNotifications.length === 0 && <NoResults />}
      </SContent>
    </>
  );
};

(Notifications as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <SGeneral>{page}</SGeneral>
);

export default Notifications;

export const getServerSideProps: GetServerSideProps = async (context) => {
  // TODO: implement granular cache-control (likely in newer version of Next.js)
  // context.res.setHeader(
  //   'Cache-Control',
  //   'public, s-maxage=50, stale-while-revalidate=60'
  // );

  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Notifications'],
    null,
    SUPPORTED_LANGUAGES
  );

  return {
    props: {
      ...translationContext,
    },
  };
};

const SGeneral = styled(General)`
  background: ${(props) => props.theme.colorsThemed.background.primary};

  ${({ theme }) => theme.media.laptop} {
    background: ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colors.white
        : props.theme.colorsThemed.background.primary};
  }
`;

const SContent = styled.div`
  margin: 0 auto;
  max-width: 704px;

  ${({ theme }) => theme.media.laptop} {
    max-width: 608px;
  }
`;

const SHeadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  min-height: 60px;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 20px;
  }
`;

const SHeading = styled.h2`
  font-weight: 600;
  font-size: 22px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 28px;
  }

  ${({ theme }) => theme.media.desktop} {
    font-size: 32px;
    line-height: 40px;
  }
`;

const SButton = styled(Button)`
  padding: 8px 16px;
`;

const SRef = styled.span`
  overflow: hidden;
  text-align: center;
`;

const SLoader = styled(Loader)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
