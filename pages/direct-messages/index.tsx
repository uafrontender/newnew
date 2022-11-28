/* eslint-disable no-nested-ternary */
import React, { ReactElement, useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { useEffectOnce, useUpdateEffect } from 'react-use';

import General from '../../components/templates/General';

import { NextPageWithLayout } from '../_app';
import { useAppSelector } from '../../redux-store/store';
import { getMyRooms } from '../../api/endpoints/chat';
import EmptyInbox from '../../components/atoms/chat/EmptyInbox';
import Lottie from '../../components/atoms/Lottie';
import loadingAnimation from '../../public/animations/logo-loading-blue.json';
import { SUPPORTED_LANGUAGES } from '../../constants/general';

export const Chat = () => {
  const { t } = useTranslation('page-Chat');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const fetchLastActiveRoom = async () => {
    try {
      const payload = new newnewapi.GetMyRoomsRequest({
        paging: {
          limit: 1,
        },
      });
      const res = await getMyRooms(payload);

      if (!res.data || res.error) {
        setIsLoaded(true);
        throw new Error(res.error?.message ?? 'Request failed');
      }

      if (res.data.rooms.length > 0) {
        const chatRoom = res.data.rooms[0];
        let route = '';

        if (chatRoom?.visavis?.user?.username) {
          route =
            chatRoom.kind === 1
              ? chatRoom.myRole === 1
                ? `${chatRoom.visavis.user.username}-cr`
                : chatRoom.visavis.user.username
              : `${chatRoom.visavis.user.username}-announcement`;
        } else {
          route =
            chatRoom.kind === 4 && chatRoom.myRole === 2
              ? `${user.userData?.username}-announcement`
              : '';
        }
        router?.push(`/direct-messages/${route}`);
      } else {
        setIsLoaded(true);
      }
    } catch (err) {
      console.error(err);
      setIsLoaded(true);
    }
  };

  useUpdateEffect(() => {
    // Redirect only after the persist data is pulled
    if (!user.loggedIn && user._persist?.rehydrated) {
      router?.push('/sign-up');
    }
  }, [router, user.loggedIn, user._persist?.rehydrated]);

  useEffectOnce(() => {
    if (!isMobileOrTablet) {
      fetchLastActiveRoom();
    } else {
      router?.push(`/direct-messages/-mobile`);
    }
  });

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <SContainer>
        <SSidebar>
          {!isLoaded ? (
            <Lottie
              width={64}
              height={64}
              options={{
                loop: true,
                autoplay: true,
                animationData: loadingAnimation,
              }}
            />
          ) : (
            <SSectionContent>
              <EmptyInbox />
            </SSectionContent>
          )}
        </SSidebar>
        <SContent />
      </SContainer>
    </>
  );
};

(Chat as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <SGeneral>{page}</SGeneral>
);

export default Chat;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Chat', 'modal-PaymentModal'],
    null,
    SUPPORTED_LANGUAGES
  );

  const { req } = context;

  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

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

const SSectionContent = styled.div`
  height: calc(100% - 74px);
  display: flex;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
`;

const SContainer = styled.div`
  position: relative;
  min-height: 700px;
  height: calc(100vh - 500px);
  margin: -20px -16px;
  display: flex;

  ${(props) => props.theme.media.laptop} {
    margin: -20px 0;
  }
`;

const SSidebar = styled.div`
  position: static;
  padding-top: 16px;
  height: 100%;
  flex-shrink: 0;
  width: 100%;

  ${(props) => props.theme.media.laptop} {
    background: none;
    width: 352px;
    padding: 0;
    z-index: 0;
  }
`;

const SContent = styled.div`
  position: relative;
  height: 100%;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  padding: 0 0 24px;
  width: 100vw;
  ${(props) => props.theme.media.laptop} {
    width: calc(100% - 384px);
    margin-left: auto;
    border-radius: ${(props) => props.theme.borderRadius.large};
  }
`;
