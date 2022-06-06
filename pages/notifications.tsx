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
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from './_app';
import Lottie from '../components/atoms/Lottie';
import General from '../components/templates/General';
import { getMyNotifications, markAsRead } from '../api/endpoints/notification';
import loadingAnimation from '../public/animations/logo-loading-blue.json';
import { useNotifications } from '../contexts/notificationsContext';
import assets from '../constants/assets';

const NoResults = dynamic(
  () => import('../components/molecules/notifications/NoResults')
);
const Notification = dynamic(
  () => import('../components/molecules/notifications/Notification')
);

export const Notifications = () => {
  const { t } = useTranslation('notifications');
  const { ref: scrollRef, inView } = useInView();
  const [notifications, setNotifications] =
    useState<newnewapi.INotification[] | null>(null);
  const [unreadNotifications, setUnreadNotifications] =
    useState<number[] | null>(null);
  const [notificationsNextPageToken, setNotificationsNextPageToken] =
    useState<string | undefined | null>('');
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [defaultLimit, setDefaultLimit] = useState<number>(6);
  const { unreadNotificationCount, fetchNotificationCount } =
    useNotifications();
  const [localUnreadNotificationCount, setLocalUnreadNotificationCount] =
    useState<number>(0);

  const fetchNotification = useCallback(
    async (args?) => {
      if (loading) return;
      const limit: number = args && args.limit ? args.limit : defaultLimit;
      const pageToken: string = args && args.pageToken ? args.pageToken : null;
      try {
        if (!pageToken && limit === defaultLimit) setNotifications([]);
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
        fetchNotificationCount();
        setUnreadNotifications(null);
      } catch (err) {
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unreadNotifications]
  );

  useEffect(() => {
    if (!notifications) {
      fetchNotification();
    }
  }, [notifications, fetchNotification]);

  useEffect(() => {
    if (unreadNotifications && unreadNotifications.length > 0) {
      readNotification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadNotifications]);

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

  const renderNotification = useCallback(
    (item) => <Notification key={item.id} {...item} />,
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
        <SHeading>{t('meta.title')}</SHeading>
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
    'notifications',
  ]);

  return {
    props: {
      ...translationContext,
    },
  };
};

const SGeneral = styled(General)`
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.secondary
      : props.theme.colorsThemed.background.primary};

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

const SHeading = styled.h2`
  font-weight: 600;
  font-size: 22px;
  line-height: 30px;
  margin-bottom: 14px;
  ${({ theme }) => theme.media.tablet} {
    font-size: 28px;
    line-height: 36px;
    margin-bottom: 20px;
  }
  ${({ theme }) => theme.media.desktop} {
    font-size: 32px;
    line-height: 40px;
  }
`;

const SRef = styled.span`
  overflow: hidden;
  text-align: center;
`;
