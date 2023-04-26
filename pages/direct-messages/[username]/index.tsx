import React, { ReactElement, useEffect, useMemo, useRef } from 'react';
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
import { ChatsProvider, useGetChats } from '../../../contexts/chatContext';
import useMyChatRooms from '../../../utils/hooks/useMyChatRooms';
import { ChatTypes } from '../../../constants/chat';

interface IChat {
  username: string;
}

const Chat: NextPage<IChat> = ({ username }) => {
  const { t } = useTranslation('page-Chat');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const isInitialChatSet = useRef(false);

  useUpdateEffect(() => {
    // Redirect only after the persist data is pulled
    if (!user.loggedIn && user._persist?.rehydrated) {
      router?.push('/sign-up');
    }
  }, [router, user.loggedIn, user._persist?.rehydrated]);

  const { setActiveChatRoom } = useGetChats();

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

  const chatType = useMemo<ChatTypes>(
    () =>
      username && username.includes('-')
        ? (username.toString().split('-')[1] as ChatTypes)
        : ChatTypes.default,
    [username]
  );

  // Parse roomKind, username, myRole from ulr parameter [username]
  // [username] possible forms: username, username-bundle, username-announcement
  const chatRoomParams = useMemo(() => {
    if (!username) {
      return null;
    }

    const visavisUsername = username.includes('-')
      ? username.split('-')[0]
      : username;

    switch (chatType) {
      case ChatTypes.default: {
        return {
          roomKind: newnewapi.ChatRoom.Kind.CREATOR_TO_ONE,
          username: visavisUsername,
        };
      }

      case ChatTypes.announcement: {
        // Announcements, creator role
        if (visavisUsername === user.userData?.username) {
          return {
            myRole: newnewapi.ChatRoom.MyRole.CREATOR,
            roomKind: newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE,
            username: visavisUsername,
          };
        }

        //  Announcements, subscriber role
        return {
          myRole: newnewapi.ChatRoom.MyRole.SUBSCRIBER,
          roomKind: newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE,
          username: visavisUsername,
        };
      }
      case ChatTypes.bundle: {
        return {
          myRole: newnewapi.ChatRoom.MyRole.CREATOR,
          roomKind: newnewapi.ChatRoom.Kind.CREATOR_TO_ONE,
          username: visavisUsername,
        };
      }
      default: {
        return null;
      }
    }
  }, [chatType, user.userData?.username, username]);

  const { data, isFetching } = useMyChatRooms(
    {
      ...chatRoomParams,
      searchQuery: chatRoomParams?.username,
    },
    {
      enabled: !!chatRoomParams && !isInitialChatSet.current,
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

    return chatRooms[0];

    // TODO: check if this logic is required
    // Announcements, creator role
    // if (
    //   chatRoomParams.myRole === newnewapi.ChatRoom.MyRole.CREATOR &&
    //   chatRoomParams.roomKind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE
    // ) {
    //   return chatRooms.filter(
    //     (chatRoom) =>
    //       chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE &&
    //       chatRoom.myRole === newnewapi.ChatRoom.MyRole.CREATOR
    //   )[0];
    // }

    // // other cases
    // if (chatRoomParams.myRole) {
    //   return chatRooms.filter(
    //     (chatRoom) =>
    //       chatRoom.kind === chatRoomParams.roomKind &&
    //       chatRoom.myRole === chatRoomParams.myRole &&
    //       chatRoom.visavis?.user?.username ===
    //         chatRoomParams.username.toLowerCase()
    //   )[0];
    // }

    // const filteredChatRooms = chatRooms.filter(
    //   (chatRoom) =>
    //     chatRoom.kind === chatRoomParams.roomKind &&
    //     chatRoom.visavis?.user?.username ===
    //       chatRoomParams.username?.toLowerCase()
    // );

    // if (filteredChatRooms.length === 2) {
    //   return filteredChatRooms.filter(
    //     (chatRoom) => chatRoom.myRole === newnewapi.ChatRoom.MyRole.SUBSCRIBER
    //   )[0];
    // }

    // return filteredChatRooms[0];
  }, [chatRoomParams, chatRooms]);

  useEffect(() => {
    if (activeChatRoom && !isInitialChatSet.current) {
      setActiveChatRoom(activeChatRoom);
      isInitialChatSet.current = true;
    }
  }, [activeChatRoom, setActiveChatRoom]);

  const initialTab = useMemo(() => {
    if (username === 'empty') {
      return undefined;
    }

    return chatType === ChatTypes.default
      ? newnewapi.ChatRoom.MyRole.SUBSCRIBER
      : newnewapi.ChatRoom.MyRole.CREATOR;
  }, [username, chatType]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <ChatContainer isLoading={isFetching} initialTab={initialTab} />
    </>
  );
};

(Chat as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <ChatsProvider>
    <ChatLayout>{page}</ChatLayout>
  </ChatsProvider>
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
