import React, { ReactElement, useCallback, useMemo } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import moment from 'moment';
import randomID from '../utils/randomIdGenerator';

import General from '../components/templates/General';
import Notification from '../components/molecules/Notification';

import { NextPageWithLayout } from './_app';

// eslint-disable-next-line no-shadow
export enum RoutingTarget {
  Empty = 'NO TARGET',
  PostAnnounce = 'POST ANNOUNCE',
  PostResponse = 'POST RESPONSE',
  PostModeration = 'POST MODERATION',
  PostComments = 'POST COMMENTS',
  ChatRoom = 'CHAT ROOM',
  UserProfile = 'USER PROFILE',
}

export interface INotification {
  id: string;
  createdAt: moment.Moment;
  content: {
    message: string;
    relatedPost?: {
      uuid: string;
      thumbnailImageUrl: string;
      title: string;
    };
    relatedUser: {
      uuid: string;
      thumbnailAvatarUrl: string;
      title: string;
    };
  };
  isRead?: boolean;
  routingTarget: RoutingTarget;
}

// UNUSED
export const Notifications = () => {
  const { t } = useTranslation('notifications');

  const collection = useMemo(
    () =>
      [
        {
          id: randomID(),
          createdAt: moment().subtract(1, 'day'),
          content: {
            message: 'your card was declined click here to retry',
            relatedUser: {
              uuid: randomID(),
              title: 'NewNew',
              thumbnailAvatarUrl: '/images/mock/test_user_1.jpg',
            },
          },
          routingTarget: RoutingTarget.Empty,
        },
        {
          id: randomID(),
          createdAt: moment().subtract(1, 'day'),
          content: {
            message:
              'this is a multi-line comment that wraps on a second line just in case we need to have a longer comment',
            relatedUser: {
              uuid: randomID(),
              title: 'Bugaboo👻😈',
              thumbnailAvatarUrl: '/images/mock/test_user_2.jpg',
            },
            relatedPost: {
              uuid: randomID(),
              thumbnailImageUrl: '/images/mock/test_user_1.jpg',
              title: 'I don’t beleive...',
            },
          },
          routingTarget: RoutingTarget.Empty,
        },
        {
          id: randomID(),
          createdAt: moment().subtract(2, 'day'),
          content: {
            message: 'Sent you a message',
            relatedUser: {
              uuid: randomID(),
              title: 'SandyCandy',
              thumbnailAvatarUrl: '/images/mock/test_user_2.jpg',
            },
          },
          routingTarget: RoutingTarget.ChatRoom,
        },
        {
          id: randomID(),
          createdAt: moment().subtract(4, 'day'),
          content: {
            message: 'posted a new comment on',
            relatedUser: {
              uuid: randomID(),
              title: 'SugarDaddy',
              thumbnailAvatarUrl: '/images/mock/test_user_2.jpg',
            },
            relatedPost: {
              uuid: randomID(),
              thumbnailImageUrl: '/images/mock/test_user_1.jpg',
              title: 'Where to dine tonight?',
            },
          },
          routingTarget: RoutingTarget.PostComments,
        },
        {
          id: randomID(),
          createdAt: moment().subtract(4, 'day'),
          content: {
            message: '',
            relatedUser: {
              uuid: randomID(),
              title: 'Dark Moon 🌚 ',
              thumbnailAvatarUrl: '/images/mock/test_user_2.jpg',
            },
            relatedPost: {
              uuid: randomID(),
              thumbnailImageUrl: '/images/mock/test_user_1.jpg',
              title: 'Where to dine tonight?',
            },
          },
          routingTarget: RoutingTarget.PostAnnounce,
        },
        {
          id: randomID(),
          createdAt: moment().subtract(4, 'day'),
          content: {
            message: '',
            relatedUser: {
              uuid: randomID(),
              title: 'Dark Moon 🌚 ',
              thumbnailAvatarUrl: '/images/mock/test_user_2.jpg',
            },
            relatedPost: {
              uuid: randomID(),
              thumbnailImageUrl: '/images/mock/test_user_1.jpg',
              title: 'Where to dine tonight?',
            },
          },
          routingTarget: RoutingTarget.PostAnnounce,
        },
        {
          id: randomID(),
          createdAt: moment().subtract(4, 'day'),
          content: {
            message: '',
            relatedUser: {
              uuid: randomID(),
              title: 'Dark Moon 🌚 ',
              thumbnailAvatarUrl: '/images/mock/test_user_2.jpg',
            },
            relatedPost: {
              uuid: randomID(),
              thumbnailImageUrl: '/images/mock/test_user_1.jpg',
              title: 'Where to dine tonight?',
            },
          },
          routingTarget: RoutingTarget.PostAnnounce,
        },
        {
          id: randomID(),
          createdAt: moment().subtract(4, 'day'),
          content: {
            message: '',
            relatedUser: {
              uuid: randomID(),
              title: 'Dark Moon 🌚 ',
              thumbnailAvatarUrl: '/images/mock/test_user_2.jpg',
            },
            relatedPost: {
              uuid: randomID(),
              thumbnailImageUrl: '/images/mock/test_user_1.jpg',
              title: 'Where to dine tonight?',
            },
          },
          routingTarget: RoutingTarget.PostAnnounce,
        },
        {
          id: randomID(),
          createdAt: moment().subtract(4, 'day'),
          content: {
            message: '',
            relatedUser: {
              uuid: randomID(),
              title: 'Dark Moon 🌚 ',
              thumbnailAvatarUrl: '/images/mock/test_user_2.jpg',
            },
            relatedPost: {
              uuid: randomID(),
              thumbnailImageUrl: '/images/mock/test_user_1.jpg',
              title: 'Where to dine tonight?',
            },
          },
          routingTarget: RoutingTarget.PostAnnounce,
        },
        {
          id: randomID(),
          createdAt: moment().subtract(4, 'day'),
          content: {
            message: '',
            relatedUser: {
              uuid: randomID(),
              title: 'Dark Moon 🌚 ',
              thumbnailAvatarUrl: '/images/mock/test_user_2.jpg',
            },
            relatedPost: {
              uuid: randomID(),
              thumbnailImageUrl: '/images/mock/test_user_1.jpg',
              title: 'Where to dine tonight?',
            },
          },
          routingTarget: RoutingTarget.PostAnnounce,
        },
      ] as INotification[],
    []
  );

  const renderNotification = useCallback(
    (item) => <Notification {...item} />,
    []
  );

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <SContent>
        <SHeading>{t('meta.title')}</SHeading>
        {collection.map(renderNotification)}
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
