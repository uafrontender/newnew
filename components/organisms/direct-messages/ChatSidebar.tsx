import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  initialTab: newnewapi.ChatRoom.MyRole | undefined;
  hidden: boolean;
  onChatRoomSelect: (chatRoom: newnewapi.IChatRoom) => void;
  withTabs?: boolean;
}

const ChatSidebar: React.FC<IChatSidebar> = ({
  initialTab,
  hidden,
  withTabs,
  onChatRoomSelect,
}) => {
  const { searchChatroom } = useGetChats();

  const { bundles, isSellingBundles, hasSoldBundles } = useBundles();

  const [activeTab, setActiveTab] = useState<
    newnewapi.ChatRoom.MyRole | undefined
  >(initialTab);

  const chatsWithCreatorsAvailable = useMemo(
    () => bundles && bundles.length > 0,
    [bundles]
  );
  const chatsWithBundleOwnersAvailable = useMemo(
    () => isSellingBundles || hasSoldBundles,
    [isSellingBundles, hasSoldBundles]
  );

  const tabsVisible = useMemo(
    () => chatsWithCreatorsAvailable && chatsWithBundleOwnersAvailable,
    [chatsWithCreatorsAvailable, chatsWithBundleOwnersAvailable]
  );

  useEffect(() => {
    if (tabsVisible) {
      setActiveTab((curr) => {
        if (curr || searchChatroom) {
          return curr;
        }

        return newnewapi.ChatRoom.MyRole.CREATOR;
      });
    }
  }, [searchChatroom, tabsVisible]);

  const changeActiveTab = useCallback(
    (tabName: newnewapi.ChatRoom.MyRole) => {
      setActiveTab(tabName);
    },
    [setActiveTab]
  );

  // TODO: move hidden to parent, just pass className here
  return (
    <SSidebar hidden={hidden}>
      <ChatToolbar onChatRoomSelect={onChatRoomSelect} />
      {withTabs && !searchChatroom && tabsVisible && activeTab && (
        <ChatListTabs activeTab={activeTab} changeActiveTab={changeActiveTab} />
      )}
      <ChatList onChatRoomSelect={onChatRoomSelect} myRole={activeTab} />
    </SSidebar>
  );
};

export default ChatSidebar;

const SSidebar = styled.div<{
  hidden: boolean;
}>`
  display: ${({ hidden }) => (hidden ? 'none' : 'flex')};

  width: 100%;
  overflow: hidden;
  flex-direction: column;

  ${(props) => props.theme.media.laptop} {
    background: none;
    position: static;
    width: 352px;
    z-index: 0;
  }
`;
