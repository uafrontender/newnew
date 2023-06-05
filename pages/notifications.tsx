/* eslint-disable no-nested-ternary */
import React, { ReactElement, useState, useCallback, useEffect } from 'react';
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
import Lottie from '../components/atoms/Lottie';
import General from '../components/templates/General';
import {
  getMyNotifications,
  markAllAsRead,
} from '../api/endpoints/notification';
import loadingAnimation from '../public/animations/logo-loading-blue.json';
import { useNotifications } from '../contexts/notificationsContext';
import assets from '../constants/assets';
import { useAppSelector } from '../redux-store/store';
import Button from '../components/atoms/Button';
import usePagination, {
  PaginatedResponse,
  Paging,
} from '../utils/hooks/usePagination';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import { Mixpanel } from '../utils/mixpanel';

const NoResults = dynamic(
  () => import('../components/molecules/notifications/NoResults')
);
const Notification = dynamic(
  () => import('../components/molecules/notifications/Notification')
);

export const Notifications = () => {
  const { t } = useTranslation('page-Notifications');
  const { ref: scrollRef, inView } = useInView();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [readAllToTime, setReadAllToTime] = useState<number | undefined>();

  // Used to update notification timers
  const [currentTime, setCurrentTime] = useState(Date.now());

  // TODO: return a list of new notifications once WS message can be used
  // const [newNotifications, setNewNotifications] = useState<
  //   newnewapi.INotification[]
  // >([]);

  const {
    unreadNotificationCount,
    notificationsDataLoaded,
    fetchNotificationCount,
  } = useNotifications();

  const loadData = useCallback(
    async (
      paging: Paging
    ): Promise<PaginatedResponse<newnewapi.INotification>> => {
      const payload = new newnewapi.GetMyNotificationsRequest({
        paging,
      });

      const res = await getMyNotifications(payload);

      if (!res?.data || res.error) {
        throw new Error(res?.error?.message ?? 'Request failed');
      }

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
    initialLoadDone,
    loadMore,
  } = usePagination(loadData, 6);

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
    if (inView && !loading && hasMore) {
      loadMore().catch((e) => console.error(e));
    }
  }, [inView, loading, hasMore, loadMore]);

  useEffect(() => {
    if (!user.loggedIn && user._persist?.rehydrated) {
      router?.push('/sign-up');
    }
  }, [user.loggedIn, user._persist?.rehydrated, router]);

  useEffect(() => {
    const updateTimeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => {
      clearInterval(updateTimeInterval);
    };
  }, []);

  // TODO: return a list of new notifications once WS message can be used
  // const displayedNotifications: newnewapi.INotification[] = useMemo(() => {
  //   return  [...newNotifications, ...notifications];
  // }, [notifications, newNotifications]);

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

        {notifications.length > 0 ? (
          notifications?.map((notification) =>
            renderNotification(notification, currentTime)
          )
        ) : !hasMore ? (
          <NoResults />
        ) : !initialLoadDone ? (
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimation,
            }}
          />
        ) : null}

        {initialLoadDone && hasMore && !loading && (
          <SRef ref={scrollRef}>
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
      </SContent>
    </>
  );
};

(Notifications as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <SGeneral>{page}</SGeneral>
);

export default Notifications;

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=50, stale-while-revalidate=60'
  );
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
