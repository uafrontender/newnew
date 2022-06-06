import React, { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import General from '../../components/templates/General';

import { NextPageWithLayout } from '../_app';
import { useAppSelector } from '../../redux-store/store';
import { getMyRooms } from '../../api/endpoints/chat';
import EmptyInbox from '../../components/atoms/chat/EmptyInbox';
import Lottie from '../../components/atoms/Lottie';
import loadingAnimation from '../../public/animations/logo-loading-blue.json';

export const Chat = () => {
  const { t } = useTranslation('chat');
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

  const [chatListHidden, setChatListHidden] =
    useState<boolean | undefined>(undefined);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    /* eslint-disable no-unused-expressions */
    isMobileOrTablet ? setChatListHidden(true) : setChatListHidden(undefined);
  }, [isMobileOrTablet]);

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

        if (chatRoom?.visavis?.username) {
          chatRoom.kind === 1
            ? (route = chatRoom.visavis.username)
            : (route = `${chatRoom.visavis.username}-announcement`);
        } else {
          chatRoom.kind === 4 && chatRoom.myRole === 2
            ? (route = `${user.userData?.username}-announcement`)
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

  useEffect(() => {
    if (!user.loggedIn) {
      router?.push('/sign-up?to=log-in');
    }
  }, [router, user.loggedIn]);

  useEffect(() => {
    fetchLastActiveRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <SContainer>
        <SSidebar hidden={chatListHidden !== undefined && chatListHidden}>
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
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'chat',
    'payment-modal',
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

interface ISSidebar {
  hidden: boolean;
}

const SSidebar = styled.div<ISSidebar>`
  padding-top: 16px;
  height: 100%;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colors.black};
  flex-shrink: 0;
  ${(props) => {
    if (props.hidden === false) {
      return css`
        ${props.theme.media.mobile} {
          z-index: 20;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
          position: fixed;
          padding: 0 15px;
        }
      `;
    }
    return css`
      left: -100vw;
      width: 100vw;
    `;
  }}
  ${(props) => props.theme.media.laptop} {
    background: none;
    position: static;
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
