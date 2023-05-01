import React, { useCallback, useState, useEffect } from 'react';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import styled, { css } from 'styled-components';
import _toNumber from 'lodash/toNumber';
import { InfiniteData, useQueryClient } from 'react-query';

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

  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  const { setSearchChatroom } = useGetChats();

  const [activeChatRoom, setActiveChatRoom] =
    useState<newnewapi.IChatRoom | null>(null);

  const isActiveChatRoom = !!roomID;

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

        const queryData = query[0] ? query[0][1] : null;
        // tslint:disable-next-statement
        const chatrooms = queryData
          ? queryData.pages?.map((page) => page.chatrooms).flat()
          : [];

        const foundedActiveChatRoom = chatrooms.find(
          (chatroom: newnewapi.IChatRoom) =>
            router.query.roomID && chatroom.id === +router.query.roomID
        );

        if (foundedActiveChatRoom) {
          setActiveChatRoom(foundedActiveChatRoom);

          return;
        }

        const payload = new newnewapi.GetRoomRequest({
          roomId: _toNumber(router.query.roomID),
        });

        const res = await getRoom(payload);

        if (!res.data || res.error) {
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

    if (router.query.roomID !== activeChatRoom?.id && router.query.roomID) {
      findChatRoom();
    }
  }, [roomID, router, activeChatRoom, setActiveChatRoom, queryClient]);

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
