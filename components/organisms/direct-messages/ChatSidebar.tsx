import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { useGetChats } from '../../../contexts/chatContext';
import { useBundles } from '../../../contexts/bundlesContext';

const ChatListTabs = dynamic(
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
  onChatRoomSelect: (chatRoom: newnewapi.IChatRoom) => void;
  isTabs?: boolean;
}

const ChatSidebar: React.FC<IChatSidebar> = ({
  initialTab,
  hidden,
  isTabs,
  onChatRoomSelect,
}) => {
  const { searchChatroom } = useGetChats();

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
  ]);

  const changeActiveTab = useCallback(
    (tabName: newnewapi.ChatRoom.MyRole) => {
      setActiveTab(tabName);
    },
    [setActiveTab]
  );

  // TODO: move hidden to parent, just pass className here
  return (
    <SSidebar hidden={hidden}>
      <ChatToolbar />
      {isTabs &&
        searchChatroom === '' &&
        bundles &&
        bundles?.length > 0 &&
        (isSellingBundles || hasSoldBundles) && (
          <ChatListTabs
            activeTab={activeTab!!}
            changeActiveTab={changeActiveTab}
          />
        )}
      <ChatList onChatRoomSelect={onChatRoomSelect} myRole={activeTab} />
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
