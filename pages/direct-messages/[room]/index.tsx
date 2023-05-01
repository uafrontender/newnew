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

import { NextPageWithLayout } from '../../_app';
import { useAppSelector } from '../../../redux-store/store';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';
import ChatLayout from '../../../components/templates/ChatLayout';
import ChatContainer from '../../../components/organisms/direct-messages/ChatContainer';
import { ChatsProvider, useGetChats } from '../../../contexts/chatContext';
import { ChatTypes } from '../../../constants/chat';
import { getMyRooms } from '../../../api/endpoints/chat';

// TODO: Room or username
// TODO: Move to utils
const getChatRoomParamsFromUrl = (room?: string, username?: string) => {
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

const Chat: NextPage = () => {
  const { t } = useTranslation('page-Chat');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const queryClient = useQueryClient();
  const { setSearchChatroom } = useGetChats();

  const [isLoading, setIsLoading] = useState(false);
  const [activeChatRoom, setActiveChatRoom] = useState<
    newnewapi.IChatRoom | undefined
  >(undefined);

  const room = useMemo(() => {
    if (!router.query.room || Array.isArray(router.query.room)) {
      return undefined;
    }

    return router.query.room;
  }, [router.query.room]);

  const myRole = useMemo(() => {
    if (!router.query.myRole || Array.isArray(router.query.myRole)) {
      return undefined;
    }

    return parseInt(router.query.myRole);
  }, [router.query.myRole]);

  const selectedChatRoomId = useMemo(() => {
    if (!router.query.roomID || Array.isArray(router.query.roomID)) {
      return undefined;
    }

    return parseInt(router.query.roomID);
  }, [router.query.roomID]);

  const chatType = useMemo<ChatTypes>(
    () =>
      room && room.includes('-')
        ? (room.toString().split('-')[1] as ChatTypes)
        : ChatTypes.default,
    [room]
  );

  const initialTab = useMemo(() => {
    if (room === 'empty') {
      return undefined;
    }

    return chatType === ChatTypes.default
      ? newnewapi.ChatRoom.MyRole.SUBSCRIBER
      : newnewapi.ChatRoom.MyRole.CREATOR;
  }, [room, chatType]);

  const handleChatRoomSelected = useCallback(
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
    [router, user.userData?.username, setSearchChatroom]
  );

  const findLoadedChatRoom = useCallback(
    (chatRoomId: number, role: newnewapi.ChatRoom.MyRole) => {
      const query = queryClient.getQueriesData<
        InfiniteData<{ chatrooms: newnewapi.IChatRoom[] }>
      >(['private', 'getMyRooms', { myRole: role, searchQuery: '' }]);

      const myRoleQueryKeyValueArray = query.length > 0 ? query[0] : null;
      const myRoleQueryValue =
        myRoleQueryKeyValueArray && myRoleQueryKeyValueArray.length > 1
          ? myRoleQueryKeyValueArray[1]
          : null;

      const chatRooms = myRoleQueryValue
        ? myRoleQueryValue.pages.map((page) => page.chatrooms).flat()
        : [];

      const foundActiveChatRoom = chatRooms.find(
        (chatroom: newnewapi.IChatRoom) => chatroom.id === chatRoomId
      );

      return foundActiveChatRoom;
    },
    [queryClient]
  );

  const fetchChatRoom = useCallback(async () => {
    if (!room) {
      return undefined;
    }

    const chatRoomParams = getChatRoomParamsFromUrl(
      room,
      user.userData?.username
    );

    const chatRoomPayload = new newnewapi.GetMyRoomsRequest(chatRoomParams);
    const chatroomResponse = await getMyRooms(chatRoomPayload);

    if (!chatroomResponse.data || chatroomResponse.error) {
      throw new Error('Request failed');
    }

    // Can be undefined as it is an array item
    const chatRoom: newnewapi.IChatRoom | undefined =
      chatroomResponse.data.rooms[0];

    if (!chatRoom) {
      throw new Error('Chat room not found');
    }

    return chatRoom;
  }, [room, user.userData?.username]);

  useUpdateEffect(() => {
    // Redirect only after the persist data is pulled
    if (!user.loggedIn && user._persist?.rehydrated) {
      router?.push('/sign-up');
    }
  }, [router, user.loggedIn, user._persist?.rehydrated]);

  useEffect(() => {
    if (
      room &&
      !room.includes('-') &&
      // prevent user from opening chat with himself
      room === user.userData?.username
    ) {
      router.replace('/direct-messages');
    }
  }, [router, room, user.userData?.username]);

  useEffect(() => {
    const getChatRoom = async () => {
      try {
        setIsLoading(true);
        // Find room in already requested witch react-query chatRooms for ChatList
        if (myRole && selectedChatRoomId) {
          const loadedActiveChatRoom = findLoadedChatRoom(
            selectedChatRoomId,
            myRole
          );

          if (loadedActiveChatRoom) {
            setActiveChatRoom(loadedActiveChatRoom);
            return;
          }
        }

        if (!room || room === 'empty') {
          setActiveChatRoom(undefined);
          return;
        }

        // Request chatRoom if it wasn't found in ChatList
        const chatRoom = await fetchChatRoom();

        if (!chatRoom) {
          return;
        }

        setActiveChatRoom(chatRoom);

        router.replace(
          `${room}?roomID=${chatRoom.id}&myRole=${chatRoom.myRole}`,
          room,
          { shallow: true }
        );
      } catch (err) {
        console.error(err);
        router.replace('/direct-messages', undefined, { shallow: true });
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedChatRoomId !== activeChatRoom?.id || !activeChatRoom?.id) {
      getChatRoom();
    }
  }, [
    myRole,
    selectedChatRoomId,
    room,
    queryClient,
    activeChatRoom?.id,
    router,
    fetchChatRoom,
    findLoadedChatRoom,
  ]);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
      </Head>
      <ChatContainer
        isLoading={isLoading}
        initialTab={initialTab}
        onChatRoomSelected={handleChatRoomSelected}
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
