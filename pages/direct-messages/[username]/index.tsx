import React, { ReactElement, useEffect, useMemo } from 'react';
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
import { useAppState } from '../../../contexts/appStateContext';

interface IChat {
  username: string;
}

const Chat: NextPage<IChat> = ({ username }) => {
  const { t } = useTranslation('page-Chat');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppState();
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

  const {
    setActiveChatRoom,
    setActiveTab,
    setHiddenMessagesArea,
    activeChatRoom: activeChatRoomFromContext,
  } = useGetChats();

  useEffect(() => {
    // prevent user from opening chat with himself
    if (
      username &&
      !username.includes('-') &&
      username === user.userData?.username
    ) {
      router.push('/direct-messages');
    }
  }, [router, username, user.userData?.username]);

  // Parse roomKind, username, myRole from ulr parameter [username]
  // [username] possible forms: username, username-bundle, username-announcement
  const chatRoomParams = useMemo(() => {
    if (!username) {
      return null;
    }

    if (!username.includes('-')) {
      if (username !== user.userData?.username) {
        return {
          roomKind: newnewapi.ChatRoom.Kind.CREATOR_TO_ONE,
          username,
        };
      }
    } else {
      const usernameArr = username.split('-');

      if (usernameArr[1] === 'bundle') {
        return {
          myRole: newnewapi.ChatRoom.MyRole.CREATOR,
          roomKind: newnewapi.ChatRoom.Kind.CREATOR_TO_ONE,
          username: usernameArr[0],
        };
      }
      if (usernameArr[1] === 'announcement') {
        if (usernameArr[0] === user.userData?.username) {
          return {
            myRole: newnewapi.ChatRoom.MyRole.CREATOR,
            roomKind: newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE,
            username: usernameArr[0],
          };
        }

        return {
          myRole: newnewapi.ChatRoom.MyRole.SUBSCRIBER,
          roomKind: newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE,
          username: usernameArr[0],
        };
      }
    }

    return null;
  }, [user.userData?.username, username]);

  const { data, isFetched, isFetching } = useMyChatRooms(
    {
      ...chatRoomParams,
      searchQuery: chatRoomParams?.username,
    },
    {
      enabled: !!chatRoomParams,
    },
    'getRoom'
  );

  const chatRooms = useMemo(
    () => (data ? data.pages.map((page) => page.chatrooms).flat() : []),
    [data]
  );

  // Calculate activeChatRoom from requested chatRooms
  const activeChatRoom = useMemo(() => {
    if (!chatRoomParams) {
      return null;
    }

    if (chatRooms.length === 0) {
      return null;
    }

    // Announcements, creator role
    if (
      chatRoomParams.myRole === newnewapi.ChatRoom.MyRole.CREATOR &&
      chatRoomParams.roomKind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE
    ) {
      return chatRooms.filter(
        (chatRoom) =>
          chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE &&
          chatRoom.myRole === newnewapi.ChatRoom.MyRole.CREATOR
      )[0];
    }

    // other cases
    if (chatRoomParams.myRole) {
      return chatRooms.filter(
        (chatRoom) =>
          chatRoom.kind === chatRoomParams.roomKind &&
          chatRoom.myRole === chatRoomParams.myRole &&
          chatRoom.visavis?.user?.username ===
            chatRoomParams.username.toLowerCase()
      )[0];
    }

    const filteredChatRooms = chatRooms.filter(
      (chatRoom) =>
        chatRoom.kind === chatRoomParams.roomKind &&
        chatRoom.visavis?.user?.username ===
          chatRoomParams.username?.toLowerCase()
    );

    if (filteredChatRooms.length === 2) {
      return filteredChatRooms.filter(
        (chatRoom) => chatRoom.myRole === newnewapi.ChatRoom.MyRole.SUBSCRIBER
      )[0];
    }

    return filteredChatRooms[0];
  }, [chatRoomParams, chatRooms]);

  useEffect(() => {
    if (isFetched && !isFetching) {
      setActiveChatRoom(activeChatRoom);

      // Set activeTab
      if (
        activeChatRoom &&
        activeChatRoom.id !== activeChatRoomFromContext?.id
      ) {
        setActiveTab(
          activeChatRoom.myRole === newnewapi.ChatRoom.MyRole.CREATOR
            ? newnewapi.ChatRoom.MyRole.CREATOR
            : newnewapi.ChatRoom.MyRole.SUBSCRIBER
        );

        if (isMobileOrTablet) {
          setHiddenMessagesArea(false);
        }
      }
    }
  }, [
    activeChatRoom,
    isFetched,
    isFetching,
    isMobileOrTablet,
    setActiveChatRoom,
    setActiveTab,
    setHiddenMessagesArea,
    activeChatRoomFromContext?.id,
  ]);

  // Reset activeChatRoom on unmount
  useEffect(
    () => () => {
      setActiveChatRoom(null);
    },
    [setActiveChatRoom]
  );

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <ChatContainer isLoading={isFetching} />
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
