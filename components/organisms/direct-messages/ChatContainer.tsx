import React, { useEffect } from 'react';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';

import { useAppState } from '../../../contexts/appStateContext';
import { useGetChats } from '../../../contexts/chatContext';
import SelectChat from '../../atoms/direct-messages/SelectChat';
import Loader from '../../atoms/Loader';
import ChatContent from './ChatContent';

const ChatSidebar = dynamic(() => import('./ChatSidebar'));

interface IChatContainer {
  isLoading?: boolean;
  initialTab: newnewapi.ChatRoom.MyRole | undefined;
}

export const ChatContainer: React.FC<IChatContainer> = ({
  isLoading,
  initialTab,
}) => {
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const isMobileOrTablet = isMobile || isTablet;

  const router = useRouter();
  const { username } = router.query;

  const isActiveChatRoom = username !== 'empty';

  const { activeChatRoom, mobileChatOpened, setMobileChatOpened } =
    useGetChats();

  useEffect(() => {
    if (mobileChatOpened && !isMobile) {
      setMobileChatOpened(false);
    }
  }, [mobileChatOpened, isMobile, setMobileChatOpened]);

  return (
    <SContainer mobileChatOpened={mobileChatOpened}>
      <ChatSidebar
        initialTab={initialTab}
        hidden={isMobileOrTablet && isActiveChatRoom}
      />

      <SContent hidden={isMobileOrTablet && !isActiveChatRoom}>
        {activeChatRoom && <ChatContent chatRoom={activeChatRoom} />}
        {!activeChatRoom && !isLoading && !isMobile && <SelectChat />}
        {!activeChatRoom && isLoading && <Loader size='md' isStatic />}
      </SContent>
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

const SContent = styled.div<{
  hidden: boolean;
}>`
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

  ${({ hidden }) => {
    if (hidden) {
      return css`
        display: none;
      `;
    }
    return css``;
  }}
`;
