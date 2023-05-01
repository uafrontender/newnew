import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useQueryClient, InfiniteData } from 'react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useUpdateEffect } from 'react-use';
import _toNumber from 'lodash/toNumber';

import { NextPageWithLayout } from '../../_app';
import { useAppSelector } from '../../../redux-store/store';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';
import ChatLayout from '../../../components/templates/ChatLayout';
import ChatContainer from '../../../components/organisms/direct-messages/ChatContainer';
import { ChatsProvider, useGetChats } from '../../../contexts/chatContext';
import { ChatTypes } from '../../../constants/chat';
import { getMyRooms } from '../../../api/endpoints/chat';

interface IChat {
  username: string;
}

const getChatRoomParamsFromUrl = (room: string, username?: string) => {
  if (!room) {
    return undefined;
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
        searchQuery: visavisUsername,
      };
    }

    case ChatTypes.announcement: {
      // Announcements, creator role
      if (visavisUsername === username) {
        return {
          myRole: newnewapi.ChatRoom.MyRole.CREATOR,
          roomKind: newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE,
          searchQuery: visavisUsername,
        };
      }

      //  Announcements, subscriber role
      return {
        myRole: newnewapi.ChatRoom.MyRole.SUBSCRIBER,
        roomKind: newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE,
        searchQuery: visavisUsername,
      };
    }
    case ChatTypes.bundle: {
      return {
        myRole: newnewapi.ChatRoom.MyRole.CREATOR,
        roomKind: newnewapi.ChatRoom.Kind.CREATOR_TO_ONE,
        searchQuery: visavisUsername,
      };
    }
    default: {
      return undefined;
    }
  }
};

const Chat: NextPage<IChat> = () => {
  const { t } = useTranslation('page-Chat');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  useUpdateEffect(() => {
    // Redirect only after the persist data is pulled
    if (!user.loggedIn && user._persist?.rehydrated) {
      router?.push('/sign-up');
    }
  }, [router, user.loggedIn, user._persist?.rehydrated]);

  const username = router.query.username as string;

  const { setSearchChatroom } = useGetChats();

  useEffect(() => {
    // prevent user from opening chat with himself
    if (
      username &&
      !username.includes('-') &&
      username === user.userData?.username
    ) {
      router.replace('/direct-messages');
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

  const handleChatRoomSelect = useCallback(
    (chatRoom: newnewapi.IChatRoom) => {
      setSearchChatroom('');

      let route = `${
        chatRoom.visavis?.user?.username || user.userData?.username
      }`;

      if (chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE) {
        route += '-announcement';
      } else if (chatRoom.myRole === newnewapi.ChatRoom.MyRole.CREATOR) {
        route += '-bundle';
      }

      router.replace(
        `${route}?roomID=${chatRoom.id}&myRole=${chatRoom.myRole}`,
        route,
        { shallow: true }
      );
    },
    [router, setSearchChatroom, user.userData?.username]
  );

  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  const [activeChatRoom, setActiveChatRoom] = useState<
    newnewapi.IChatRoom | undefined
  >(undefined);

  const findChatRoom = useCallback(
    (myRoleRequested: newnewapi.ChatRoom.MyRole) => {
      const query = queryClient.getQueriesData<
        InfiniteData<{ chatrooms: newnewapi.IChatRoom[] }>
      >([
        'private',
        'getMyRooms',
        { myRole: myRoleRequested, searchQuery: '' },
      ]);

      const queryData = query[0] ? query[0][1] : null;

      const chatrooms = queryData
        ? queryData.pages.map((page) => page.chatrooms).flat()
        : [];

      const foundedActiveChatRoom = chatrooms.find(
        (chatroom: newnewapi.IChatRoom) =>
          router.query.roomID && chatroom.id === +router.query.roomID
      );

      return foundedActiveChatRoom;
    },
    [queryClient, router.query.roomID]
  );

  const fetchChatRoom = useCallback(async () => {
    const chatRoomParams = getChatRoomParamsFromUrl(username);

    const chatRoomPayload = new newnewapi.GetMyRoomsRequest(chatRoomParams);

    const chatroomResponse = await getMyRooms(chatRoomPayload);

    if (!chatroomResponse.data || chatroomResponse.error) {
      throw new Error('Request failed');
    }

    if (!chatroomResponse.data?.rooms[0]) {
      throw new Error('Chat room not found');
    }

    return chatroomResponse.data?.rooms[0];
  }, [username]);

  useEffect(() => {
    const getChatRoom = async () => {
      try {
        setIsLoading(true);
        // find room in already requested witch react-query chatRooms for ChatList
        if (router.query.myRole && router.query.roomID) {
          const foundedActiveChatRoom = findChatRoom(
            _toNumber(router.query.myRole)
          );

          if (foundedActiveChatRoom) {
            setActiveChatRoom(foundedActiveChatRoom);
            return;
          }
        }

        if (!username || username === 'empty') {
          setActiveChatRoom(undefined);
          return;
        }

        // request chatRoom if it wasn't found in ChatList
        const chatroom = await fetchChatRoom();

        setActiveChatRoom(chatroom);

        router.replace(
          `${username}?roomID=${chatroom.id}&myRole=${chatroom.myRole}`,
          username,
          { shallow: true }
        );

        return;
      } catch (err) {
        console.error(err);
        router.replace('/direct-messages', undefined, { shallow: true });
      } finally {
        setIsLoading(false);
      }
    };

    if (router.query.roomID !== activeChatRoom?.id || !activeChatRoom?.id) {
      getChatRoom();
    }
  }, [
    router.query.myRole,
    router.query.roomID,
    username,
    queryClient,
    activeChatRoom?.id,
    router,
    fetchChatRoom,
    findChatRoom,
  ]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <ChatContainer
        isLoading={isLoading}
        initialTab={myRole}
        onChatRoomSelect={handleChatRoomSelect}
        activeChatRoom={activeChatRoom}
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
