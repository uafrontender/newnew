/* eslint-disable no-nested-ternary */
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
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
import Lottie from '../components/atoms/Lottie';
import General from '../components/templates/General';
import {
  getMyNotifications,
  markAllAsRead,
  markAsRead,
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

  const [newNotifications, setNewNotifications] = useState<
    newnewapi.INotification[]
  >([]);
  const [unreadNotificationIds, setUnreadNotificationIds] = useState<number[]>(
    []
  );

  const localUnreadNotificationCount = useRef<number | undefined>(undefined);
  const { unreadNotificationCount, fetchNotificationCount } =
    useNotifications();

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

      setUnreadNotificationIds((curr) => {
        const arr = curr.slice();
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
    initialLoadDone,
    loadMore,
  } = usePagination(loadData, 6);

  const fetchNewNotification = useCallback(async () => {
    const payload = new newnewapi.GetMyNotificationsRequest({
      paging: {
        limit: 1,
      },
    });

    const res = await getMyNotifications(payload);

    if (!res.data || res.error) {
      throw new Error(res.error?.message ?? 'Request failed');
    }

    setUnreadNotificationIds((curr) => {
      const arr = curr.slice();
      if (res.data?.notifications[0].id)
        arr.push(res.data.notifications[0].id as number);
      return arr;
    });

    setNewNotifications((curr) => {
      const arr = curr.slice();
      res.data?.notifications.forEach((item) => {
        if (!item.isRead) {
          arr.push(item);
        }
      });
      return arr;
    });
  }, []);

  const markNotificationsAsRead = useCallback(async () => {
    try {
      const payload = new newnewapi.MarkAsReadRequest({
        notificationIds: unreadNotificationIds,
      });

      const res = await markAsRead(payload);

      if (res.error) throw new Error(res.error?.message ?? 'Request failed');

      setUnreadNotificationIds([]);
      fetchNotificationCount();
    } catch (err) {
      console.error(err);
    }
  }, [unreadNotificationIds, fetchNotificationCount]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const payload = new newnewapi.EmptyRequest({});
      await markAllAsRead(payload);

      fetchNotificationCount();
      setUnreadNotificationIds([]);
    } catch (err) {
      console.error(err);
    }
  }, [fetchNotificationCount]);

  useEffect(() => {
    if (unreadNotificationIds.length > 0) {
      markNotificationsAsRead();
    }
  }, [unreadNotificationIds, markNotificationsAsRead]);

  useEffect(() => {
    if (localUnreadNotificationCount.current === undefined) {
      localUnreadNotificationCount.current = unreadNotificationCount;
      return;
    }

    if (!initialLoadDone) {
      return;
    }

    // TODO: What if there are 2 new notifications?
    if (unreadNotificationCount > localUnreadNotificationCount.current) {
      fetchNewNotification();
    } else {
      localUnreadNotificationCount.current = unreadNotificationCount;
    }
  }, [initialLoadDone, unreadNotificationCount, fetchNewNotification]);

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

  const displayedNotifications: newnewapi.INotification[] = useMemo(() => {
    const allNotifications = [...newNotifications, ...notifications];
    const notificationsWithStatus = allNotifications.map((notification) => {
      const isRead = !unreadNotificationIds.includes(notification.id as number);
      return {
        ...notification,
        isRead,
      };
    });
    return notificationsWithStatus;
  }, [notifications, newNotifications, unreadNotificationIds]);

  const renderNotification = useCallback(
    (item: newnewapi.INotification) => (
      <Notification key={item.id as any} {...item} />
    ),
    []
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

        {displayedNotifications.length > 0 ? (
          displayedNotifications?.map(renderNotification)
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
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-Notifications',
  ]);

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
  max-width: 600px;
  margin: 0 auto;
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
