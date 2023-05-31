import React, { useEffect, useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { useUpdateEffect } from 'react-use';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import useMyChatRooms from '../../../utils/hooks/useMyChatRooms';
import { SChatSeparator } from '../../atoms/direct-messages/styles';
import { useGetChats } from '../../../contexts/chatContext';
import Loader from '../../atoms/Loader';
import EmptyInbox from '../../atoms/direct-messages/EmptyInbox';
import { useAppState } from '../../../contexts/appStateContext';
import { useChatsUnreadMessages } from '../../../contexts/chatsUnreadMessagesContext';

const NoResults = dynamic(
  () => import('../../atoms/direct-messages/NoResults')
);
const ChatListItem = dynamic(() => import('./ChatListItem'));

interface IChatList {
  hidden?: boolean;
  myRole: newnewapi.ChatRoom.MyRole | undefined;
  onChatRoomSelect: (chatRoom: newnewapi.IChatRoom) => void;
}

const ChatList: React.FC<IChatList> = ({
  myRole,
  hidden,
  onChatRoomSelect: onChatRoomSelected,
}) => {
  const { t } = useTranslation('page-Chat');
  const { ref: scrollRef, inView } = useInView();
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const router = useRouter();

  const { unreadCountForCreator, unreadCountForUser } =
    useChatsUnreadMessages();

  const { searchChatroom } = useGetChats();

  const { data, isLoading, hasNextPage, fetchNextPage, refetch } =
    useMyChatRooms({
      myRole: searchChatroom ? undefined : myRole,
      searchQuery: searchChatroom,
      announcementsName: t('announcement.announcements'),
    });

  const chatRooms: newnewapi.IChatRoom[] = useMemo(() => {
    if (data) {
      return data.pages.map((page) => page.chatrooms).flat();
    }

    return [];
  }, [data]);

  const selectedChatRoomId = useMemo(() => {
    if (!router.query.roomID || Array.isArray(router.query.roomID)) {
      return undefined;
    }

    return parseInt(router.query.roomID);
  }, [router.query.roomID]);

  useUpdateEffect(() => {
    if (inView && !isLoading && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isLoading, hasNextPage, fetchNextPage]);

  // Refetch on unreadCountForCreator changed
  useEffect(() => {
    if (myRole === newnewapi.ChatRoom.MyRole.CREATOR) {
      refetch();
    }
  }, [myRole, unreadCountForCreator, refetch]);

  // Refetch on unreadCountForUser changed
  useEffect(() => {
    if (myRole === newnewapi.ChatRoom.MyRole.SUBSCRIBER) {
      refetch();
    }
  }, [myRole, unreadCountForUser, refetch]);

  return (
    <SChatList
      style={
        hidden
          ? {
              display: 'none',
            }
          : {}
      }
    >
      {/* Loading state */}
      {isLoading && <Loader size='md' isStatic />}

      {/* Chats */}
      {!isLoading && (
        <>
          {chatRooms.length > 0 && (
            <>
              {chatRooms.map((chatroom, index) => (
                <React.Fragment key={chatroom.id as number}>
                  {hasNextPage && index === chatRooms.length - 1 && (
                    <SRef ref={scrollRef}>Loading...</SRef>
                  )}
                  <ChatListItem
                    chatRoom={chatroom}
                    onChatRoomSelected={onChatRoomSelected}
                    isActive={
                      !!selectedChatRoomId && chatroom.id === selectedChatRoomId
                    }
                  />
                  <SChatSeparator />
                </React.Fragment>
              ))}
              {/* TODO: Remove this for dynamic section */}
              {isMobileOrTablet && (
                <>
                  <SChatItemFakeContainer />
                  <SChatItemFakeContainer />
                </>
              )}
            </>
          )}

          {/* Empty inbox */}
          {chatRooms.length === 0 && !searchChatroom && <EmptyInbox />}

          {/* No Search Results */}
          {chatRooms.length === 0 && searchChatroom && (
            <NoResults text={searchChatroom} />
          )}
        </>
      )}
    </SChatList>
  );
};

export default ChatList;

const SChatList = styled.div`
  display: flex;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
  overscroll-behavior: contain;
  height: calc(100vh - 124px);

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;

const SChatItemFakeContainer = styled.div`
  min-height: 72px;
  flex: 1;
`;
