import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { InfiniteData, useQueryClient } from 'react-query';

import { useAppState } from '../../contexts/appStateContext';
import { useGetChats } from '../../contexts/chatContext';
import ChatContent from './direct-messages/ChatContent';
import ChatSidebar from './direct-messages/ChatSidebar';
import Loader from '../atoms/Loader';
import { getRoom } from '../../api/endpoints/chat';
import { useOverlayMode } from '../../contexts/overlayModeContext';

interface IChatContainer {
  myRole: newnewapi.ChatRoom.MyRole | undefined;
}

export const MobileChat: React.FC<IChatContainer> = ({ myRole }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { enableOverlayMode, disableOverlayMode } = useOverlayMode();

  const { setSearchChatroom } = useGetChats();
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const [isLoading, setIsLoading] = useState(false);
  const [activeChatRoom, setActiveChatRoom] =
    useState<newnewapi.IChatRoom | null>(null);

  const selectedChatRoomId = useMemo(() => {
    if (!router.query.roomID || Array.isArray(router.query.roomID)) {
      return undefined;
    }

    return parseInt(router.query.roomID);
  }, [router.query.roomID]);

  const handleCloseChatRoom = useCallback(() => {
    router.replace(`${router.pathname}?tab=chat`, undefined, { shallow: true });
  }, [router]);

  const handleChatRoomSelect = useCallback(
    (chatRoom: newnewapi.IChatRoom) => {
      setSearchChatroom('');

      router.replace(
        `${router.pathname}?tab=direct-messages&roomID=${chatRoom.id}`,
        undefined,
        { shallow: true }
      );
    },
    [router, setSearchChatroom]
  );

  useEffect(() => {
    const findChatRoom = async () => {
      try {
        setIsLoading(true);

        const query = queryClient.getQueriesData<
          InfiniteData<{ chatrooms: newnewapi.IChatRoom[] }>
        >(['private', 'getMyRooms', { myRole: 2, searchQuery: '' }]);

        const myRoleQueryKeyValueArray = query.length > 0 ? query[0] : null;
        const myRoleQueryValue =
          myRoleQueryKeyValueArray && myRoleQueryKeyValueArray.length > 1
            ? myRoleQueryKeyValueArray[1]
            : null;

        const chatRooms = myRoleQueryValue
          ? myRoleQueryValue.pages.map((page) => page.chatrooms).flat()
          : [];

        const foundActiveChatRoom = chatRooms.find(
          (chatroom: newnewapi.IChatRoom) =>
            selectedChatRoomId && chatroom.id === selectedChatRoomId
        );

        if (foundActiveChatRoom) {
          setActiveChatRoom(foundActiveChatRoom);

          return;
        }

        const payload = new newnewapi.GetRoomRequest({
          roomId: selectedChatRoomId,
        });

        const res = await getRoom(payload);

        if (!res?.data || res.error) {
          throw new Error('Request failed');
        }

        setActiveChatRoom(res.data);

        return;
      } catch (err) {
        console.error(err);
        router.push(`${router.pathname}?tab=chat`);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedChatRoomId && selectedChatRoomId !== activeChatRoom?.id) {
      findChatRoom();
    }
  }, [
    selectedChatRoomId,
    router,
    activeChatRoom,
    setActiveChatRoom,
    queryClient,
  ]);

  useEffect(() => {
    enableOverlayMode();

    return () => {
      disableOverlayMode();
    };
  }, [disableOverlayMode, enableOverlayMode]);

  return (
    <SWrapper>
      <SContainer>
        <ChatSidebar
          initialTab={myRole}
          hidden={isMobileOrTablet && !!selectedChatRoomId}
          onChatRoomSelect={handleChatRoomSelect}
        />

        <SContent hidden={isMobileOrTablet && !selectedChatRoomId}>
          {activeChatRoom && (
            <ChatContent
              chatRoom={activeChatRoom}
              isBackButton={isMobileOrTablet}
              onBackButtonClick={handleCloseChatRoom}
              isMoreButton
              withChatMessageAvatars
            />
          )}
          {!activeChatRoom && isLoading && <Loader size='md' isStatic />}
        </SContent>
      </SContainer>
    </SWrapper>
  );
};

export default MobileChat;

const SWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;

  background: ${({ theme }) =>
    theme.name === 'light' ? theme.colors.white : theme.colors.black};
  height: 100vh;
`;

const SContainer = styled.div`
  padding: 0 10px;

  max-height: calc(var(--window-inner-height, 1vh) * 100);

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
  margin: 0 -15px;
  padding: 0;

  ${(props) => props.theme.media.laptop} {
    height: 100%;
    width: calc(100% - 384px);
    margin: 0 0 0 auto;
    border-radius: ${({ theme }) => theme.borderRadius.large};
  }
`;
