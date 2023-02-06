import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useUpdateEffect } from 'react-use';
import { NextPageWithLayout } from '../../_app';
import { useAppSelector } from '../../../redux-store/store';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';
import ChatLayout from '../../../components/templates/ChatLayout';
import ChatContainer from '../../../components/organisms/direct-messages/ChatContainer';
import { useGetChats } from '../../../contexts/chatContext';
import useMyChatRooms from '../../../utils/hooks/useMyChatRooms';

interface IChat {
  username: string;
}

const Chat: NextPage<IChat> = ({ username }) => {
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

  useUpdateEffect(() => {
    // Redirect only after the persist data is pulled
    if (!user.loggedIn && user._persist?.rehydrated) {
      router?.push('/sign-up');
    }
  }, [router, user.loggedIn, user._persist?.rehydrated]);

  const { setActiveChatRoom, setActiveTab, setHiddenMessagesArea } =
    useGetChats();

  const [usernameQuery, setUsernameQuery] = useState('');
  const [myRole, setMyRole] = useState<newnewapi.ChatRoom.MyRole | undefined>();
  const [roomKind, setRoomKind] = useState<
    newnewapi.ChatRoom.Kind | undefined
  >();

  const [filteredChatrooms, setFilteredChatroom] = useState<
    newnewapi.IChatRoom[]
  >([]);

  const { data } = useMyChatRooms({
    myRole,
    roomKind,
    searchQuery: usernameQuery,
  });

  const chatrooms = useMemo(
    () => (data ? data.pages.map((page) => page.chatrooms).flat() : []),
    [data]
  );

  useEffect(() => {
    if (
      username &&
      !username.includes('-') &&
      username === user.userData?.username
    ) {
      router.push('/direct-messages');
    }
  }, [router, username, user.userData?.username]);

  useEffect(() => {
    const parseUsername = () => {
      if (!username.includes('-')) {
        if (username !== user.userData?.username) {
          setRoomKind(newnewapi.ChatRoom.Kind.CREATOR_TO_ONE);
          setUsernameQuery(username);
          setMyRole(undefined);
        }
      } else {
        const usernameArr = username.split('-');
        setUsernameQuery(usernameArr[0]);
        if (usernameArr[1] === 'bundle') {
          setMyRole(newnewapi.ChatRoom.MyRole.CREATOR);
          setRoomKind(newnewapi.ChatRoom.Kind.CREATOR_TO_ONE);
        }
        if (usernameArr[1] === 'announcement') {
          setRoomKind(newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE);
          if (usernameArr[0] === user.userData?.username) {
            setMyRole(newnewapi.ChatRoom.MyRole.CREATOR);
          } else {
            setMyRole(newnewapi.ChatRoom.MyRole.SUBSCRIBER);
          }
        }
      }
    };

    if (username) {
      parseUsername();
    }
  }, [username, user.userData?.username]);

  useEffect(() => {
    if (chatrooms.length > 0) {
      const usernameArr = username.split('-');
      if (
        chatrooms.length === 1 &&
        myRole === newnewapi.ChatRoom.MyRole.CREATOR &&
        roomKind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE
      ) {
        setActiveChatRoom(chatrooms[0]);
        if (isMobileOrTablet) {
          setHiddenMessagesArea(false);
        }
      } else {
        const localChatrooms = chatrooms.filter(
          (room) =>
            room.visavis?.user?.username === usernameArr[0].toLowerCase()
        );
        setFilteredChatroom(localChatrooms);
      }
    }
  }, [
    chatrooms,
    isMobileOrTablet,
    myRole,
    roomKind,
    setActiveChatRoom,
    setHiddenMessagesArea,
    username,
  ]);

  useEffect(() => {
    if (filteredChatrooms.length > 0) {
      if (filteredChatrooms.length === 1) {
        setActiveTab(
          filteredChatrooms[0].myRole === newnewapi.ChatRoom.MyRole.CREATOR
            ? newnewapi.ChatRoom.MyRole.CREATOR
            : newnewapi.ChatRoom.MyRole.SUBSCRIBER
        );
        setActiveChatRoom(filteredChatrooms[0]);
        if (isMobileOrTablet) {
          setHiddenMessagesArea(false);
        }
      }
      // if we have 1 chatroom as creator and 1 as bundle ownder
      if (filteredChatrooms.length === 2) {
        setMyRole(newnewapi.ChatRoom.MyRole.SUBSCRIBER);
      }
    }
  }, [
    filteredChatrooms,
    isMobileOrTablet,
    setActiveChatRoom,
    setHiddenMessagesArea,
    setActiveTab,
  ]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <ChatContainer />
    </>
  );
};

(Chat as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <ChatLayout>{page}</ChatLayout>
);

export default Chat;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.query;
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
      username,
      ...translationContext,
    },
  };
};
