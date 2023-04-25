import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
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
  onChatRoomSelect: (chatRoom: newnewapi.IChatRoom | null) => void;
}

const ChatSidebar: React.FC<IChatSidebar> = ({ onChatRoomSelect }) => {
  const { searchChatroom, activeTab, setActiveTab, mobileChatOpened } =
    useGetChats();

  const { bundles, isSellingBundles, hasSoldBundles } = useBundles();

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

  return (
    <SSidebar>
      <ChatToolbar />
      {activeTab &&
        searchChatroom === '' &&
        !mobileChatOpened &&
        bundles &&
        bundles?.length > 0 &&
        (isSellingBundles || hasSoldBundles) && (
          <ChatListTabs
            activeTab={activeTab!!}
            changeActiveTab={changeActiveTab}
          />
        )}
      <ChatList onChatRoomSelect={onChatRoomSelect} />
    </SSidebar>
  );
};

export default ChatSidebar;

const SSidebar = styled.div`
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
`;
