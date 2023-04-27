import React, { useEffect, useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { useUpdateEffect } from 'react-use';
import dynamic from 'next/dynamic';

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
  onChatRoomSelect,
}) => {
  const { ref: scrollRef, inView } = useInView();
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const { unreadCountForCreator, unreadCountForUser } =
    useChatsUnreadMessages();

  const { searchChatroom, activeChatRoom } = useGetChats();

  const { data, isLoading, hasNextPage, fetchNextPage, refetch } =
    useMyChatRooms({
      myRole: searchChatroom ? undefined : myRole,
      searchQuery: searchChatroom,
    });

  const chatrooms = useMemo(
    () => (data ? data.pages.map((page) => page.chatrooms).flat() : []),
    [data]
  );

  useUpdateEffect(() => {
    if (inView && !isLoading && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isLoading, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (myRole === newnewapi.ChatRoom.MyRole.CREATOR) {
      refetch();
    }
  }, [unreadCountForCreator, refetch, myRole]);

  useEffect(() => {
    if (myRole === newnewapi.ChatRoom.MyRole.SUBSCRIBER) {
      refetch();
    }
  }, [myRole, unreadCountForUser, refetch]);

  console.log(activeChatRoom, 'activeChatRoom');

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
          {chatrooms.length > 0 && (
            <>
              {chatrooms.map((chatroom, index) => (
                <React.Fragment key={chatroom.id as number}>
                  {hasNextPage && index === chatrooms.length - 1 && (
                    <SRef ref={scrollRef}>Loading...</SRef>
                  )}
                  <ChatListItem
                    chatRoom={chatroom}
                    onChatRoomSelect={onChatRoomSelect}
                    isActive={
                      !!(
                        activeChatRoom &&
                        activeChatRoom.id &&
                        chatroom.id === activeChatRoom.id
                      )
                    }
                  />
                  {index < chatrooms.length - 1 && <SChatSeparator />}
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
          {chatrooms.length === 0 && !searchChatroom && <EmptyInbox />}

          {/* No Search Results */}
          {chatrooms.length === 0 && searchChatroom && (
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
