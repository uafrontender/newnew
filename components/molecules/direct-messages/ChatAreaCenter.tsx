/* eslint-disable no-nested-ternary */
import React, { useContext, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { useUpdateEffect } from 'react-use';
import useChatRoomMessages from '../../../utils/hooks/useChatRoomMessages';
import isIOS from '../../../utils/isIOS';
import { useGetChats } from '../../../contexts/chatContext';
import { SocketContext } from '../../../contexts/socketContext';

const NoMessagesYet = dynamic(() => import('./NoMessagesYet'));
const WelcomeMessage = dynamic(() => import('./WelcomeMessage'));
const ChatMessage = dynamic(
  () => import('../../atoms/direct-messages/ChatMessage')
);

interface IChatAreaCenter {
  chatRoom: newnewapi.IChatRoom;
  isAnnouncement?: boolean;
  textareaFocused: boolean;
}

const ChatAreaCenter: React.FC<IChatAreaCenter> = ({
  chatRoom,
  isAnnouncement,
  textareaFocused,
}) => {
  const { ref: loadingRef, inView } = useInView();
  const { activeChatRoom, justSentMessage } = useGetChats();
  const { socketConnection } = useContext(SocketContext);

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    refetch,
    isFetchingNextPage,
  } = useChatRoomMessages({
    limit: isIOS() ? 8 : 20,
    roomId: chatRoom?.id,
  });

  const messages = useMemo(
    () => (data ? data.pages.map((page) => page.messages).flat() : []),
    [data]
  );

  useEffect(() => {
    if (activeChatRoom && justSentMessage) {
      refetch();
    }
  }, [activeChatRoom, justSentMessage, refetch]);

  const hasWelcomeMessage = useMemo(
    () =>
      messages.length === 0 &&
      !isAnnouncement &&
      !isLoading &&
      chatRoom.myRole === 1,
    [messages, isAnnouncement, isLoading, chatRoom]
  );

  const hasNoMessagesYet = useMemo(
    () =>
      messages.length === 0 &&
      !isAnnouncement &&
      !isLoading &&
      chatRoom.myRole === 2,
    [messages, isAnnouncement, isLoading, chatRoom]
  );

  useEffect(() => {
    const socketHandlerMessageCreated = (dataSocket: any) => {
      const arr = new Uint8Array(dataSocket);
      const decoded = newnewapi.ChatMessageCreated.decode(arr);
      // eslint-disable-next-line eqeqeq
      if (decoded.roomId == activeChatRoom?.id) {
        refetch();
      }
    };
    if (socketConnection) {
      socketConnection?.on('ChatMessageCreated', socketHandlerMessageCreated);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off(
          'ChatMessageCreated',
          socketHandlerMessageCreated
        );
      }
    };
  }, [socketConnection, activeChatRoom, refetch]);

  /* loading next page of messages */
  useUpdateEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <SContainer textareaFocused={textareaFocused}>
      {hasWelcomeMessage && <WelcomeMessage user={chatRoom.visavis?.user} />}
      {hasNoMessagesYet && <NoMessagesYet />}

      {messages.map((item, index) => (
        <ChatMessage
          key={`${chatRoom}-${item.id}`}
          chatRoom={chatRoom}
          item={item}
          nextElement={messages[index + 1]}
          prevElement={messages[index - 1]}
        />
      ))}
      {hasNextPage && !isFetchingNextPage && <SRef ref={loadingRef} />}
    </SContainer>
  );
};

export default ChatAreaCenter;

interface ISContainer {
  textareaFocused: boolean;
}
const SContainer = styled.div<ISContainer>`
  flex: 1;
  display: flex;
  overflow-y: auto;
  flex-direction: column-reverse;
  padding: 0 12px;
  position: fixed;
  top: 80px;
  bottom: 80px;
  left: 0;
  right: 0;
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior: contain;

  ${(props) => props.theme.media.tablet} {
    position: static;
    min-height: calc(100% - 160px);
    height: calc(100vh - 160px);
    flex: 0;
    padding-bottom: unset;
    padding: 0 24px;
    margin: 0;
    overscroll-behavior: auto;
  }
`;

const SRef = styled.span`
  height: 10px;
  overflow: hidden;
  margin-bottom: -20px;
`;
