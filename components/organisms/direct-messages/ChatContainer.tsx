import React, { useCallback, useMemo, useEffect } from 'react';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { useAppState } from '../../../contexts/appStateContext';
import SelectChat from '../../atoms/direct-messages/SelectChat';
import Loader from '../../atoms/Loader';
import ChatContent from './ChatContent';
import isIOS from '../../../utils/isIOS';

const ChatSidebar = dynamic(() => import('./ChatSidebar'));

interface IChatContainer {
  isLoading?: boolean;
  initialTab: newnewapi.ChatRoom.MyRole | undefined;
  className?: string;
  activeChatRoom?: newnewapi.IChatRoom;
  onChatRoomSelected: (chatRoom: newnewapi.IChatRoom) => void;
}

export const ChatContainer: React.FC<IChatContainer> = ({
  isLoading,
  initialTab,
  className,
  activeChatRoom,
  onChatRoomSelected,
}) => {
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const router = useRouter();
  const { room } = router.query;

  // Cant just check activeChatRoom as it may be loading
  const chatRoomSelected = useMemo(
    () => !!room && !Array.isArray(room) && room !== 'empty',
    [room]
  );

  const handleCloseChatRoom = useCallback(() => {
    router.replace('/direct-messages', undefined, { shallow: true });
  }, [router]);

  useEffect(() => {
    let input: HTMLInputElement | null = null;

    const handleFocusIn = (e: Event) => {
      input = e.target as HTMLInputElement;

      if (input && input.getAttribute('data-new-message-textarea')) {
        input.style.transform = 'translateY(-99999px)';

        setTimeout(() => {
          if (input) {
            input.style.transform = '';
          }
        }, 100);
      }
    };

    const handleFocusOut = (e: Event) => {
      if (input) {
        input.style.transform = '';
      }
    };

    if (isIOS()) {
      document.addEventListener('focusin', handleFocusIn);

      document.addEventListener('focusout', handleFocusOut);
    }

    return () => {
      if (isIOS()) {
        document.removeEventListener('focusin', handleFocusIn);

        document.removeEventListener('focusout', handleFocusOut);
      }
    };
  }, []);

  return (
    <SContainer className={className}>
      <ChatSidebar
        initialTab={initialTab}
        hidden={isMobileOrTablet && chatRoomSelected}
        onChatRoomSelect={onChatRoomSelected}
        withTabs
      />
      <SContent hidden={isMobileOrTablet && !chatRoomSelected}>
        {activeChatRoom && (
          <ChatContent
            chatRoom={activeChatRoom}
            isBackButton={isMobileOrTablet}
            onBackButtonClick={handleCloseChatRoom}
            isMoreButton
            withChatMessageAvatars
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
  overflow: hidden;
  height: calc(var(--window-inner-height, 1vh) * 100);

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
  display: ${({ hidden }) => (hidden ? 'none' : 'block')};

  position: relative;
  height: 100%;
  background: ${({ theme }) => theme.colorsThemed.background.secondary};
  padding: 0;

  ${(props) => props.theme.media.laptop} {
    height: 100%;
    width: calc(100% - 384px);
    margin: 0 0 0 auto;
    border-radius: ${({ theme }) => theme.borderRadius.large};
  }
`;
