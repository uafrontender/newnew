import React, { useCallback, useState, useEffect, useRef } from 'react';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import styled, { css } from 'styled-components';
import _toNumber from 'lodash/toNumber';

import { useAppState } from '../../contexts/appStateContext';
import { useGetChats } from '../../contexts/chatContext';
import ChatContent from './direct-messages/ChatContent';
import ChatSidebar from './direct-messages/ChatSidebar';
import Loader from '../atoms/Loader';
import { getRoom } from '../../api/endpoints/chat';

interface IChatContainer {
  myRole: newnewapi.ChatRoom.MyRole | undefined;
}

export const MobileChat: React.FC<IChatContainer> = ({ myRole }) => {
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const isMobileOrTablet = isMobile || isTablet;

  const router = useRouter();
  const { roomID } = router.query;

  const [isLoading, setIsLoading] = useState(false);

  const { activeChatRoom, setActiveChatRoom, setSearchChatroom } =
    useGetChats();

  const isActiveChatRoom = !!roomID || !!activeChatRoom;

  const handleCloseChatRoom = useCallback(() => {
    setActiveChatRoom(null);
    router.replace(`${router.pathname}?tab=chat`, undefined, { shallow: true });
  }, [router, setActiveChatRoom]);

  const handleChatRoomSelect = useCallback(
    (chatRoom: newnewapi.IChatRoom) => {
      setActiveChatRoom(chatRoom);
      setSearchChatroom('');

      router.replace(
        `${router.pathname}?tab=direct-messages&roomID=${chatRoom.id}`,
        undefined,
        { shallow: true }
      );
    },
    [router, setActiveChatRoom, setSearchChatroom]
  );

  const initialRoomID = useRef(roomID);
  const isInitialRoomLoaded = useRef(false);

  useEffect(() => {
    const getChatRoom = async () => {
      try {
        setIsLoading(true);
        const payload = new newnewapi.GetRoomRequest({
          roomId: _toNumber(roomID),
        });

        const res = await getRoom(payload);

        if (!res.data || res.error) {
          throw new Error(res.error?.message ?? 'Request failed');
        }

        setActiveChatRoom(res.data);
        isInitialRoomLoaded.current = true;
      } catch (err) {
        router.push(`${router.pathname}?tab=chat`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (initialRoomID && !isInitialRoomLoaded) {
      getChatRoom();
    }
  }, [roomID, router, activeChatRoom, setActiveChatRoom]);

  return (
    <SContainer>
      <ChatSidebar
        initialTab={myRole}
        hidden={isMobileOrTablet && isActiveChatRoom}
        onChatRoomSelect={handleChatRoomSelect}
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
        {!activeChatRoom && isLoading && <Loader size='md' isStatic />}
      </SContent>
    </SContainer>
  );
};

export default MobileChat;

const SContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 15px;
  background: ${({ theme }) =>
    theme.name === 'light' ? theme.colors.white : theme.colors.black};

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
