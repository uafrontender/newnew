/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-lonely-if */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
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
  const [defaultLimit, setDefaultLimit] = useState<number>(6);
  const { unreadNotificationCount, fetchNotificationCount } =
    useNotifications();
  const [localUnreadNotificationCount, setLocalUnreadNotificationCount] =
    useState<number>(0);

  const fetchNotification = useCallback(
    async (args?: any) => {
      if (loading) return;
      const limit: number = args && args.limit ? args.limit : defaultLimit;
      const pageToken: string = args && args.pageToken ? args.pageToken : null;

      try {
        if (!pageToken && limit === defaultLimit) {
          setNotifications([]);
        }

        setLoading(true);
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
              if (res.data?.notifications[0])
                arr.unshift(res.data.notifications[0]);
              return arr;
            });
            setUnreadNotifications((curr) => {
              const arr = curr ? [...curr] : [];
              if (res.data?.notifications[0].id)
                arr.push(res.data.notifications[0].id as number);
              return arr;
            });
            // We don`t update token since we only loaded the new first items
          }
        } else {
          // If there is no results then there is no more pages to load
          setNotificationsNextPageToken(null);
        }

        if (!res.data.paging?.nextPageToken)
          setNotificationsNextPageToken(null);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [loading, defaultLimit]
  );

  const readNotification = useCallback(
    async () => {
      try {
        const payload = new newnewapi.MarkAsReadRequest({
          notificationIds: unreadNotifications,
        });
        const res = await markAsRead(payload);
        if (unreadNotifications && notifications) {
          const arr = notifications;
          unreadNotifications.forEach((unreadItem) => {
            const index = arr.findIndex(
              (item) => (item.id as number) === unreadItem
            );
            if (index > -1) {
              arr[index].isRead = true;
            }
          });
          setNotifications(arr);
        }
        if (res.error) throw new Error(res.error?.message ?? 'Request failed');
        fetchNotificationCount();
        setUnreadNotifications(null);
      } catch (err) {
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unreadNotifications, notifications]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const payload = new newnewapi.EmptyRequest({});
      await markAllAsRead(payload);
      fetchNotificationCount();
      setUnreadNotifications(null);
    } catch (err) {
      console.error(err);
    }
  }, [fetchNotificationCount]);

  useEffect(() => {
    if (!notifications) {
      fetchNotification();
    }
  }, [notifications, fetchNotification]);

  useEffect(() => {
    if (unreadNotifications && unreadNotifications.length > 0) {
      readNotification();
    }
  }, [unreadNotifications, readNotification]);

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

  useEffect(() => {
    if (inView && !loading && notificationsNextPageToken) {
      fetchNotification({ pageToken: notificationsNextPageToken });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, loading, notificationsNextPageToken]);

  useEffect(() => {
    if (!user.loggedIn) {
      router?.push('/sign-up');
    }
  }, [user.loggedIn, router]);

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
        ) : notifications && notifications.length < 1 && !loading ? (
          <NoResults />
        ) : (
          notifications?.map(renderNotification)
        )}
        {notificationsNextPageToken && !loading && (
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
