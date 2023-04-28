import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
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

const getChatRoomParamsFromUrl = (room: string, username?: string) => {
  if (!room || room === 'empty') {
    return null;
  }

  const chatType =
    room && room.includes('-')
      ? (room.toString().split('-')[1] as ChatTypes)
      : ChatTypes.default;

  const visavisUsername = room.includes('-') ? room.split('-')[0] : room;

  switch (chatType) {
    case ChatTypes.default: {
      return {
        roomKind: newnewapi.ChatRoom.Kind.CREATOR_TO_ONE,
        username: visavisUsername,
      };
    }

    case ChatTypes.announcement: {
      // Announcements, creator role
      if (visavisUsername === username) {
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
};

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

  const { setActiveChatRoom, setSearchChatroom } = useGetChats();

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

  const myRole = useMemo(() => {
    if (username === 'empty') {
      return undefined;
    }

    return chatType === ChatTypes.default
      ? newnewapi.ChatRoom.MyRole.SUBSCRIBER
      : newnewapi.ChatRoom.MyRole.CREATOR;
  }, [username, chatType]);

  // Parse roomKind, username, myRole from ulr parameter [username]
  // [username] possible forms: username, username-bundle, username-announcement
  const chatRoomParams = getChatRoomParamsFromUrl(
    username,
    user.userData?.username
  );

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
  }, [chatRoomParams, chatRooms]);

  useEffect(() => {
    if (activeChatRoom && !isInitialChatSet.current) {
      setActiveChatRoom(activeChatRoom);
      isInitialChatSet.current = true;
    }
  }, [activeChatRoom, setActiveChatRoom]);

  const handleChatRoomSelect = useCallback(
    (chatRoom: newnewapi.IChatRoom) => {
      setActiveChatRoom(chatRoom);
      setSearchChatroom('');

      let route = `${
        chatRoom.visavis?.user?.username || user.userData?.username
      }`;

      if (chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE) {
        route += '-announcement';
      } else if (chatRoom.myRole === newnewapi.ChatRoom.MyRole.CREATOR) {
        route += '-bundle';
      }

      router.push(route, undefined, { shallow: true });
    },
    [router, setActiveChatRoom, setSearchChatroom, user.userData?.username]
  );

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <ChatContainer
        isLoading={isFetching}
        initialTab={myRole}
        onChatRoomSelect={handleChatRoomSelect}
      />
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
