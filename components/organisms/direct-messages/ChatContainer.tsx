import React, { useCallback } from 'react';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';

import { useAppState } from '../../../contexts/appStateContext';
import SelectChat from '../../atoms/direct-messages/SelectChat';
import Loader from '../../atoms/Loader';
import ChatContent from './ChatContent';

const ChatSidebar = dynamic(() => import('./ChatSidebar'));

interface IChatContainer {
  isLoading?: boolean;
  initialTab: newnewapi.ChatRoom.MyRole | undefined;
  className?: string;
  activeChatRoom?: newnewapi.IChatRoom;
  onChatRoomSelect: (chatRoom: newnewapi.IChatRoom) => void;
}

export const ChatContainer: React.FC<IChatContainer> = ({
  isLoading,
  initialTab,
  className,
  activeChatRoom,
  onChatRoomSelect,
}) => {
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const isMobileOrTablet = isMobile || isTablet;

  const router = useRouter();
  const { room } = router.query;

  const isActiveChatRoom = room !== 'empty';

  const handleCloseChatRoom = useCallback(() => {
    router.replace('/direct-messages', undefined, { shallow: true });
  }, [router]);

  return (
    <SContainer className={className}>
      <ChatSidebar
        initialTab={initialTab}
        hidden={isMobileOrTablet && isActiveChatRoom}
        onChatRoomSelect={onChatRoomSelect}
        isTabs
      />

      <SContent hidden={isMobileOrTablet && !isActiveChatRoom}>
        {activeChatRoom && (
          <ChatContent
            chatRoom={activeChatRoom}
            isBackButton={isMobileOrTablet}
            onBackButtonClick={handleCloseChatRoom}
            isMoreButton
            isChatMessageAvatar
          />
        )}
        {!activeChatRoom && !isLoading && !isMobileOrTablet && <SelectChat />}
        {!activeChatRoom && isLoading && <Loader size='md' isStatic />}
      </SContent>
    </SContainer>
  );
};

export default ChatContainer;

const SContainer = styled.div`
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
