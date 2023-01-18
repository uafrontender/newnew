/* eslint-disable no-nested-ternary */
import React, { useEffect, useContext, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import styled, { css } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { useUpdateEffect } from 'react-use';
import { SocketContext } from '../../../contexts/socketContext';
import getDisplayname from '../../../utils/getDisplayname';
import useChatRoomMessages from '../../../utils/hooks/useChatRoomMessages';
import { isIOSMikhail } from '../../../utils/isIOS';

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
  const socketConnection = useContext(SocketContext);

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    refetch,
    isFetchingNextPage,
  } = useChatRoomMessages({
    limit: isIOSMikhail() ? 8 : 20,
    roomId: chatRoom?.id,
  });

  const messages = useMemo(
    () => (data ? data.pages.map((page) => page.messages).flat() : []),
    [data]
  );

  useEffect(() => {
    const socketHandlerMessageCreated = () => {
      refetch();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

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

  /* loading next page of messages */
  useUpdateEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <SContainer isIOS={isIOSMikhail()} textareaFocused={textareaFocused}>
      {hasWelcomeMessage && (
        <WelcomeMessage userAlias={getDisplayname(chatRoom.visavis?.user)} />
      )}
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
  isIOS: boolean;
}
const SContainer = styled.div<ISContainer>`
  flex: 1;
  ${({ textareaFocused, isIOS }) =>
    !textareaFocused && isIOS
      ? css`
          margin: 0 0 100px;
        `
      : textareaFocused && isIOS
      ? css`
          margin: 80px 0 0;
        `
      : ''};
  display: flex;
  overflow-y: auto;
  flex-direction: column-reverse;
  padding: 0 12px;
  position: relative;
  height: calc(100vh - 300px);
  min-height: calc(100vh - 300px);
  ${(props) => props.theme.media.tablet} {
    min-height: calc(100% - 160px);
    flex: 0;
    padding: 0 24px;
    margin: 0;
  }
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior: contain;
`;

const SRef = styled.span`
  height: 10px;
  overflow: hidden;
  margin-bottom: -20px;
`;
