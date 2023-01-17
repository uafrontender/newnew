import React, { useEffect, useContext, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import styled, { css } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { useUpdateEffect } from 'react-use';

import Loader from '../../atoms/Loader';
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
  const { ref: scrollRef, inView } = useInView();
  const socketConnection = useContext(SocketContext);

  const { data, isLoading, hasNextPage, fetchNextPage, refetch } =
    useChatRoomMessages({
      limit: 5,
      roomId: chatRoom?.id,
    });

  const messages = useMemo(
    () => (data ? data.pages.map((page) => page.messages).flat() : []),
    [data]
  );

  const messagesScrollContainerRef = useRef<HTMLDivElement>();

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

  /* loading next page of messages */
  useUpdateEffect(() => {
    if (inView && !isLoading && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, isLoading, hasNextPage, fetchNextPage]);

  // useUpdateEffect(() => {
  //   if (
  //     isMobile &&
  //     isSafari() &&
  //     messages.length > 0 &&
  //     messagesScrollContainerRef.current
  //   ) {
  //     messagesScrollContainerRef.current.style.cssText = `flex: 0 0 300px;`;
  //     setTimeout(() => {
  //       messagesScrollContainerRef.current!!.style.cssText = `flex:0 0 calc(100vh - 160px);`;
  //     }, 5);
  //   }
  // }, [messages]);

  // useEffect(() => {
  //   if (newMessage && isBrowser()) {
  //     setTimeout(() => {
  //       messagesScrollContainerRef.current?.scrollBy({
  //         top: messagesScrollContainerRef.current?.scrollHeight,
  //         behavior: 'smooth',
  //       });
  //     }, 100);
  //   }
  // }, [newMessage]);

  // fix for container scrolling on Safari iOS
  // useEffect(() => {
  //   if (
  //     messages.length > 0 &&
  //     messagesScrollContainerRef.current &&
  //     isMobile &&
  //     isSafari()
  //   ) {
  //     messagesScrollContainerRef.current.style.cssText = `flex: 0 0 300px;`;
  //     setTimeout(() => {
  //       messagesScrollContainerRef.current!!.style.cssText = `flex:1;`;
  //     }, 10);
  //   }
  // }, [messages, isMobile]);

  return (
    <SContainer
      isIOS={isIOSMikhail()}
      textareaFocused={textareaFocused}
      ref={(el) => {
        messagesScrollContainerRef.current = el!!;
      }}
    >
      {isLoading && <SLoader size='md' />}
      {messages.length === 0 &&
        !isAnnouncement &&
        !isLoading &&
        (chatRoom.myRole === 1 ? (
          <WelcomeMessage userAlias={getDisplayname(chatRoom.visavis?.user)} />
        ) : (
          <NoMessagesYet />
        ))}
      {messages.map((item, index) => (
        <ChatMessage
          key={`${chatRoom}-${item.id}`}
          chatRoom={chatRoom}
          item={item}
          nextElement={messages[index + 1]}
          prevElement={messages[index - 1]}
        />
      ))}
      {hasNextPage && !isLoading && <SRef ref={scrollRef}>Loading...</SRef>}
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
      : css`
          margin: 80px 0 0;
        `};
  display: flex;
  overflow-y: auto;
  flex-direction: column-reverse;
  padding: 0 12px;
  position: relative;
  height: calc(100vh - 300px);
  min-height: calc(100vh - 300px);
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior: contain;
  ${({ theme }) => theme.media.tablet} {
    padding: 0 24px;
  }
`;

const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;

const SLoader = styled(Loader)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
