/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { useUpdateEffect } from 'react-use';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useMyChatRooms from '../../../utils/hooks/useMyChatRooms';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import { SChatSeparator } from '../../atoms/direct-messages/styles';
import Lottie from '../../atoms/Lottie';
import { useGetChats } from '../../../contexts/chatContext';
import { useAppSelector } from '../../../redux-store/store';

const NoResults = dynamic(
  () => import('../../atoms/direct-messages/NoResults')
);

const ChatlistItem = dynamic(() => import('./ChatListItem'));

interface IChatList {
  hidden?: boolean;
}

const ChatList: React.FC<IChatList> = ({ hidden }) => {
  const { ref: scrollRef, inView } = useInView();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  const router = useRouter();

  const isDashboard = useMemo(() => {
    if (router.asPath.includes('/creator/dashboard')) {
      return true;
    }
    return false;
  }, [router.asPath]);
  const {
    unreadCountForCreator,
    unreadCountForUser,
    searchChatroom,
    activeTab,
    activeChatRoom,
    justSentMessage,
  } = useGetChats();
  const { data, isLoading, hasNextPage, fetchNextPage, refetch } =
    useMyChatRooms({
      myRole: activeTab,
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
    if (activeTab === newnewapi.ChatRoom.MyRole.CREATOR) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCountForCreator, refetch, activeTab]);

  useEffect(() => {
    if (activeTab === newnewapi.ChatRoom.MyRole.SUBSCRIBER) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, unreadCountForUser, refetch]);

  // to update last message and position in chatlist
  useEffect(() => {
    if (
      !isMobileOrTablet &&
      !isDashboard &&
      activeChatRoom &&
      justSentMessage
    ) {
      refetch();
    }
  }, [activeChatRoom, justSentMessage, isDashboard, isMobileOrTablet, refetch]);

  const renderChatItem = useCallback(
    (chatroom: newnewapi.IChatRoom, index: number) => (
      <React.Fragment key={chatroom.id as number}>
        <ChatlistItem chatRoom={chatroom} />
        {index < chatrooms.length - 1 && <SChatSeparator />}
      </React.Fragment>
    ),

    [chatrooms]
  );

  return (
    <SChatlist
      style={
        hidden
          ? {
              display: 'none',
            }
          : {}
      }
    >
      {isLoading ? (
        <Lottie
          width={64}
          height={64}
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingAnimation,
          }}
        />
      ) : chatrooms.length > 0 ? (
        <>
          {chatrooms.map(renderChatItem)}
          {hasNextPage && <SRef ref={scrollRef}>Loading...</SRef>}
        </>
      ) : (
        <NoResults text={searchChatroom} />
      )}
    </SChatlist>
  );
};

export default ChatList;

const SChatlist = styled.div`
  display: flex;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
  overscroll-behavior: contain;
  height: calc(100vh - 122px);
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
