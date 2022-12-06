import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { SocketContext } from '../../../contexts/socketContext';
import { getMessages } from '../../../api/endpoints/chat';
import isSafari from '../../../utils/isSafari';
import isBrowser from '../../../utils/isBrowser';
import getDisplayname from '../../../utils/getDisplayname';
import { useAppSelector } from '../../../redux-store/store';

const NoMessagesYet = dynamic(() => import('./NoMessagesYet'));
const WelcomeMessage = dynamic(() => import('./WelcomeMessage'));
const ChatMessage = dynamic(() => import('../../atoms/chat/ChatMessage'));

interface IChatAreaCenter {
  chatRoom: newnewapi.IChatRoom | null;
  isAnnouncement?: boolean;
  updateLastMessage?: { (data: any): any } | null;
}

const ChatAreaCenter: React.FC<IChatAreaCenter> = ({
  chatRoom,
  isAnnouncement,
  updateLastMessage,
}) => {
  const { ref: scrollRef, inView } = useInView();
  const socketConnection = useContext(SocketContext);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const messagesScrollContainerRef = useRef<HTMLDivElement>();
  const [messages, setMessages] = useState<newnewapi.IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<
    newnewapi.IChatMessage | null | undefined
  >();
  const [messagesNextPageToken, setMessagesNextPageToken] = useState<
    string | undefined | null
  >('');
  const [messagesLoading, setMessagesLoading] = useState<boolean | null>(null);

  const getChatMessages = useCallback(
    async (pageToken?: string) => {
      if (messagesLoading) return;
      try {
        if (!pageToken) setMessages([]);
        setMessagesLoading(true);
        const payload = new newnewapi.GetMessagesRequest({
          roomId: chatRoom?.id,
          ...(pageToken
            ? {
                paging: {
                  pageToken,
                },
              }
            : {}),
        });
        const res = await getMessages(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        if (res.data && res.data.messages.length > 0) {
          setMessages((curr) => [
            ...curr,
            ...(res.data?.messages as newnewapi.ChatMessage[]),
          ]);
          setMessagesNextPageToken(res.data.paging?.nextPageToken);
        }
        setMessagesLoading(false);
      } catch (err) {
        console.error(err);
        setMessagesLoading(false);
      }
    },
    [messagesLoading, chatRoom]
  );

  useEffect(() => {
    if (chatRoom) {
      getChatMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom]);

  useEffect(() => {
    const socketHandlerMessageCreated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatMessageCreated.decode(arr);
      if (decoded) {
        setNewMessage(decoded.newMessage);
        if (
          updateLastMessage &&
          chatRoom &&
          !chatRoom.visavis?.isVisavisBlocked
        )
          updateLastMessage({ roomId: chatRoom.id });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  /* loading next page of messages */
  useEffect(() => {
    if (inView && !messagesLoading && messagesNextPageToken) {
      getChatMessages(messagesNextPageToken);
    }
  }, [inView, messagesLoading, messagesNextPageToken, getChatMessages]);

  useEffect(() => {
    if (newMessage && newMessage.roomId === chatRoom?.id) {
      setMessages((curr) => {
        if (curr.length === 0 || curr[0]?.id !== newMessage.id) {
          return [newMessage, ...curr];
        }
        return curr;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  useEffect(() => {
    if (newMessage && isBrowser()) {
      setTimeout(() => {
        messagesScrollContainerRef.current?.scrollBy({
          top: messagesScrollContainerRef.current?.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [newMessage]);

  // fix for container scrolling on Safari iOS
  useEffect(() => {
    if (
      messages.length > 0 &&
      messagesScrollContainerRef.current &&
      isMobile &&
      isSafari()
    ) {
      messagesScrollContainerRef.current.style.cssText = `flex: 0 0 300px;`;
      setTimeout(() => {
        messagesScrollContainerRef.current!!.style.cssText = `flex:1;`;
      }, 5);
    }
  }, [messages, isMobile]);

  return chatRoom ? (
    <SContainer
      ref={(el) => {
        messagesScrollContainerRef.current = el!!;
      }}
    >
      {messages.length === 0 &&
        !isAnnouncement &&
        messagesLoading === false &&
        (chatRoom.myRole === 1 ? (
          <WelcomeMessage userAlias={getDisplayname(chatRoom.visavis?.user)} />
        ) : (
          <NoMessagesYet />
        ))}
      {messages.length > 0 &&
        messages.map((item, index) => {
          if (index === messages.length - 2) {
            return (
              <SRef key={`sref-${item.id}`} ref={scrollRef}>
                Loading...
              </SRef>
            );
          }

          if (index < messages.length) {
            return (
              <ChatMessage
                key={`${chatRoom}-${item.id}`}
                chatRoom={chatRoom}
                item={item}
                nextElement={messages[index + 1]}
                prevElement={messages[index - 1]}
              />
            );
          }

          return null;
        })}
    </SContainer>
  ) : null;
};

export default ChatAreaCenter;

const SContainer = styled.div`
  flex: 1;
  margin: 0 0 24px;
  display: flex;
  overflow-y: auto;
  flex-direction: column-reverse;
  padding: 0 12px;
  position: relative;
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
  ${({ theme }) => theme.media.tablet} {
    padding: 0 24px;
  }
`;

const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;
