import React, { useContext, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import styled, { css } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { useUpdateEffect } from 'react-use';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';

import useChatRoomMessages from '../../../utils/hooks/useChatRoomMessages';
import isIOS from '../../../utils/isIOS';
import { SocketContext } from '../../../contexts/socketContext';
import Loader from '../../atoms/Loader';
import { markRoomAsRead } from '../../../api/endpoints/chat';

const NoMessagesYet = dynamic(() => import('./NoMessagesYet'));
const WelcomeMessage = dynamic(() => import('./WelcomeMessage'));
const ChatMessage = dynamic(
  () => import('../../atoms/direct-messages/ChatMessage')
);

interface IChatAreaCenter {
  chatRoom: newnewapi.IChatRoom;
  isAnnouncement?: boolean;
  textareaFocused: boolean;
  withAvatars?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const ChatAreaCenter: React.FC<IChatAreaCenter> = ({
  chatRoom,
  isAnnouncement,
  withAvatars,
  textareaFocused,
  variant,
  className,
}) => {
  const { ref: loadingRef, inView } = useInView();
  const { socketConnection } = useContext(SocketContext);

  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    refetch,
    isFetchingNextPage,
    isFetched,
  } = useChatRoomMessages({
    limit: isIOS() ? 8 : 20,
    roomId: chatRoom?.id,
  });

  const messages = useMemo(
    () => (data ? data.pages.map((page) => page.messages).flat() : []),
    [data]
  );

  const markAsRead = useCallback(async () => {
    try {
      const payload = new newnewapi.MarkRoomAsReadRequest({
        roomId: chatRoom.id as number,
      });
      const res = await markRoomAsRead(payload);
      if (!res?.data || res.error) {
        throw new Error(res?.error?.message ?? 'Request failed');
      }

      // Update chat list
      queryClient.invalidateQueries({
        queryKey: ['private', 'getMyRooms'],
      });
    } catch (err) {
      console.error(err);
    }
  }, [chatRoom, queryClient]);

  useEffect(() => {
    if (
      chatRoom.unreadMessageCount &&
      chatRoom.unreadMessageCount > 0 &&
      isFetched
    ) {
      markAsRead();
    }
  }, [chatRoom, isFetched, markAsRead]);

  const hasWelcomeMessage = useMemo(
    () =>
      messages.length === 0 &&
      !isAnnouncement &&
      !isLoading &&
      chatRoom.myRole === 1 &&
      chatRoom.visavis?.isSubscriptionActive,
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

  const selectedChatRoomId = useMemo(() => {
    if (!router.query.roomID || Array.isArray(router.query.roomID)) {
      return undefined;
    }

    return parseInt(router.query.roomID);
  }, [router.query.roomID]);

  useEffect(() => {
    const socketHandlerMessageCreated = (dataSocket: any) => {
      const arr = new Uint8Array(dataSocket);
      const decoded = newnewapi.ChatMessageCreated.decode(arr);
      // eslint-disable-next-line eqeqeq
      if (selectedChatRoomId && decoded.roomId === selectedChatRoomId) {
        // TODO: think how to avoid it
        refetch();
        // TODO: not the best solution but there is no alternative in current implementation
        markAsRead();
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
  }, [selectedChatRoomId, socketConnection, refetch, markAsRead]);

  /* loading next page of messages */
  useUpdateEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <SContainer
      textareaFocused={textareaFocused}
      className={className}
      isAnnouncement={isAnnouncement}
    >
      {hasWelcomeMessage && <WelcomeMessage user={chatRoom.visavis?.user} />}
      {hasNoMessagesYet && <NoMessagesYet />}

      {messages.map((item, index) => (
        <ChatMessage
          key={`${chatRoom}-${item.id}`}
          chatRoom={chatRoom}
          item={item}
          nextElement={messages[index + 1]}
          prevElement={messages[index - 1]}
          withAvatar={withAvatars}
          variant={variant}
        />
      ))}
      {messages.length === 0 && isLoading && <Loader isStatic size='md' />}
      {hasNextPage && !isFetchingNextPage && <SRef ref={loadingRef} />}
    </SContainer>
  );
};

export default ChatAreaCenter;

interface ISContainer {
  textareaFocused: boolean;
  isAnnouncement?: boolean;
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

  ${({ isAnnouncement }) =>
    isAnnouncement
      ? css`
          padding-top: 75px;
        `
      : null}

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
