import React, {
  useContext,
  useEffect,
  useMemo,
  useCallback,
  RefObject,
} from 'react';
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
import NoAnnouncementMessagesYet from './NoAnnouncmentMessagesYet';

const NoMessagesYet = dynamic(() => import('./NoMessagesYet'));
const WelcomeMessage = dynamic(() => import('./WelcomeMessage'));
const ChatMessage = dynamic(
  () => import('../../atoms/direct-messages/ChatMessage')
);

interface IChatAreaCenter {
  chatRoom: newnewapi.IChatRoom;
  isAnnouncement?: boolean;
  withAvatars?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
  forwardRef?: RefObject<HTMLDivElement>;
}

const ChatAreaCenter: React.FC<IChatAreaCenter> = ({
  chatRoom,
  isAnnouncement,
  withAvatars,
  variant,
  className,
  // because ChatAreaCenter is imported dynamically
  forwardRef,
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

  const hasNoAnnouncementMessagesYet = useMemo(
    () =>
      messages.length === 0 &&
      isAnnouncement &&
      !isLoading &&
      chatRoom.myRole === 1,
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
    <SContainer className={className}>
      <SMessagesContent ref={forwardRef} data-ignore-touch-move-lock>
        {hasWelcomeMessage && <WelcomeMessage user={chatRoom.visavis?.user} />}
        {hasNoMessagesYet && <NoMessagesYet />}
        {hasNoAnnouncementMessagesYet && <NoAnnouncementMessagesYet />}
        <SMessages
          isAnnouncementBannerOffset={isAnnouncement && chatRoom.myRole === 1}
        >
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
        </SMessages>

        {messages.length === 0 && isLoading && <Loader isStatic size='md' />}
        {hasNextPage && !isFetchingNextPage && <SRef ref={loadingRef} />}
        {messages.length > 0 && isFetchingNextPage && <SPageLoader size='xs' />}
      </SMessagesContent>
    </SContainer>
  );
};

export default ChatAreaCenter;

interface ISContainer {
  isAnnouncement?: boolean;
}
const SContainer = styled.div<ISContainer>`
  flex: 1;
  overflow-y: hidden;

  ${(props) => props.theme.media.tablet} {
    position: static;
    flex: 0;
    padding-bottom: unset;
    padding: 0 24px;
    margin: 0;
    overscroll-behavior: auto;

    flex: 1;
  }
`;

const SMessagesContent = styled.div`
  overflow-y: auto;
  height: 100%;

  display: flex;
  flex-direction: column-reverse;

  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior: contain;
`;

const SMessages = styled.div<{
  isAnnouncementBannerOffset?: boolean;
}>`
  display: flex;
  flex-direction: column-reverse;
  flex-shrink: 0;

  padding: 0 12px;

  ${({ isAnnouncementBannerOffset }) =>
    isAnnouncementBannerOffset
      ? css`
          padding-top: 75px;
        `
      : null}
`;

const SRef = styled.span`
  height: 10px;
  overflow: hidden;
  margin-bottom: -20px;
`;

const SPageLoader = styled(Loader)`
  margin: 8px auto;
`;
