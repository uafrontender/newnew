import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { useGetChats } from '../../../contexts/chatContext';
import { useBundles } from '../../../contexts/bundlesContext';
import { useAppSelector } from '../../../redux-store/store';

const ChatListTabs = dynamic(
  // eslint-disable-next-line import/no-unresolved
  () => import('../../molecules/direct-messages/ChatListTabs')
);
const ChatList = dynamic(
  () => import('../../molecules/direct-messages/ChatList')
);
const ChatToolbar = dynamic(
  () => import('../../molecules/direct-messages/ChatToolbar')
);

interface IChatSidebar {
  initialTab: newnewapi.ChatRoom.MyRole | undefined;
  hidden: boolean;
}

const ChatSidebar: React.FC<IChatSidebar> = ({ initialTab, hidden }) => {
  const user = useAppSelector((state) => state.user);
  const router = useRouter();

  const {
    searchChatroom,
    mobileChatOpened,
    activeChatRoom,
    setActiveChatRoom,
    setSearchChatroom,
  } = useGetChats();

  const { bundles, isSellingBundles, hasSoldBundles } = useBundles();

  const [activeTab, setActiveTab] = useState<
    newnewapi.ChatRoom.MyRole | undefined
  >(initialTab);

  useEffect(() => {
    if (!activeTab && searchChatroom === '') {
      if (bundles?.length && (isSellingBundles || hasSoldBundles)) {
        setActiveTab(newnewapi.ChatRoom.MyRole.CREATOR);
      } else {
        setActiveTab(undefined);
      }
    }
  }, [
    activeTab,
    searchChatroom,
    bundles?.length,
    isSellingBundles,
    hasSoldBundles,
    setActiveTab,
    activeChatRoom,
  ]);

  const changeActiveTab = useCallback(
    (tabName: newnewapi.ChatRoom.MyRole) => {
      setActiveTab(tabName);
    },
    [setActiveTab]
  );

  const handleSelectChatRoom = useCallback(
    (chatRoom: newnewapi.IChatRoom) => {
      setActiveChatRoom(chatRoom);
      setSearchChatroom('');

      let route = `${
        chatRoom.visavis?.user?.username || user.userData?.username
      }`;

      if (chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE) {
        route += '-announcement';
      } else if (chatRoom.myRole === newnewapi.ChatRoom.MyRole.CREATOR) {
        route += '-bundle';
      }

      router.push(route, undefined, { shallow: true });
    },
    [router, setActiveChatRoom, setSearchChatroom, user.userData?.username]
  );

  // TODO: move hidden to parent, just pass className here
  return (
    <SSidebar hidden={hidden}>
      <ChatToolbar />
      {searchChatroom === '' &&
        !mobileChatOpened &&
        bundles &&
        bundles?.length > 0 &&
        (isSellingBundles || hasSoldBundles) && (
          <ChatListTabs
            activeTab={activeTab!!}
            changeActiveTab={changeActiveTab}
          />
        )}
      <ChatList onChatRoomSelect={handleSelectChatRoom} myRole={activeTab} />
    </SSidebar>
  );
};

export default ChatSidebar;

const SSidebar = styled.div<{
  hidden: boolean;
}>`
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  ${(props) => props.theme.media.laptop} {
    background: none;
    position: static;
    width: 352px;
    z-index: 0;
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
