import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useAppState } from '../../../contexts/appStateContext';
import { useGetChats } from '../../../contexts/chatContext';
import SelectChat from '../../atoms/direct-messages/SelectChat';
import Loader from '../../atoms/Loader';
import ChatContent from './ChatContent';

const ChatSidebar = dynamic(() => import('./ChatSidebar'));

interface IChatContainer {
  chatRoom?: newnewapi.IChatRoom | null;
  isLoading?: boolean;
}

export const ChatContainer: React.FC<IChatContainer> = ({
  chatRoom,
  isLoading,
}) => {
  const router = useRouter();

  const { username } = router.query;

  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const isMobileOrTablet = isMobile || isTablet;

  const [activeChat, setActiveChat] = useState<
    newnewapi.IChatRoom | undefined | null
  >(chatRoom);

  const handleSetActiveChat = useCallback(
    (newChatRoom: newnewapi.IChatRoom | null) => {
      setActiveChat(newChatRoom);
    },
    []
  );

  useEffect(() => {
    if (!activeChat) {
      setActiveChat(chatRoom);
    }
  }, [chatRoom, activeChat]);

  useEffect(() => {
    if (username === 'empty') {
      setActiveChat(null);
    }
  }, [username]);

  const { mobileChatOpened, setMobileChatOpened } = useGetChats();

  // const [isChatSidebarVisible, setIsChatSidebarVisible] = useState(true);

  useEffect(() => {
    if (mobileChatOpened && !isMobile) {
      setMobileChatOpened(false);
    }
  }, [mobileChatOpened, isMobile, setMobileChatOpened]);

  // TODO: think how to implement local chat context instead of passing props down to children onChatRoomSelect={handleSetActiveChat}
  // For this /direct-messages/ can be replaced with something like /direct-messages/empty to work only with [username] and be able to do shallow routing
  return (
    <SContainer mobileChatOpened={mobileChatOpened}>
      {(!isMobileOrTablet || !activeChat) && (
        <ChatSidebar onChatRoomSelect={handleSetActiveChat} />
      )}
      {(!isMobileOrTablet || activeChat) && (
        <SContent>
          {activeChat && <ChatContent chatRoom={activeChat} />}
          {!activeChat && !isLoading && !isMobile && <SelectChat />}
          {!activeChat && isLoading && <Loader size='md' isStatic />}
        </SContent>
      )}
    </SContainer>
  );
};

export default ChatContainer;

interface ISContainer {
  mobileChatOpened: boolean;
}
const SContainer = styled.div<ISContainer>`
  ${(props) => {
    if (props.mobileChatOpened) {
      return css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 0 15px;
        background: ${props.theme.name === 'light'
          ? props.theme.colors.white
          : props.theme.colors.black};
      `;
    }
    return css``;
  }}

  padding: 0 10px;
  overflow: hidden;
  height: 100vh;

  ${(props) => props.theme.media.laptop} {
    position: relative;
    min-height: 700px;
    height: calc(100vh - 500px);
    margin: -20px 0;
    display: flex;
  }
`;

const SContent = styled.div`
  position: relative;
  height: 100%;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  margin: 0 -15px;
  padding: 0;
  ${(props) => props.theme.media.laptop} {
    height: 100%;
    width: calc(100% - 384px);
    margin: 0 0 0 auto;
    border-radius: ${(props) => props.theme.borderRadius.large};
  }
`;
