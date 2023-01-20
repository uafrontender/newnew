import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useGetChats } from '../../../contexts/chatContext';
import { useAppSelector } from '../../../redux-store/store';

const ChatSidebar = dynamic(() => import('./ChatSidebar'));
const ChatContent = dynamic(() => import('./ChatContent'));

export const ChatContainer = () => {
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const {
    activeChatRoom,
    hiddenMessagesArea,
    mobileChatOpened,
    setMobileChatOpened,
  } = useGetChats();

  useEffect(() => {
    if (mobileChatOpened && !isMobile) {
      setMobileChatOpened(false);
    }
  }, [mobileChatOpened, isMobile, setMobileChatOpened]);

  return (
    <SContainer mobileChatOpened={mobileChatOpened}>
      {hiddenMessagesArea !== false && <ChatSidebar />}
      {hiddenMessagesArea !== true && (
        <SContent>
          {activeChatRoom && <ChatContent chatRoom={activeChatRoom} />}
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
    /* padding-bottom: 24px; */
    margin: 0 0 0 auto;
    border-radius: ${(props) => props.theme.borderRadius.large};
  }
`;
