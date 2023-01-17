import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useGetChats } from '../../../contexts/chatContext';

const ChatlistTabs = dynamic(
  () => import('../../molecules/direct-messages/ChatlistTabs')
);
const ChatList = dynamic(
  () => import('../../molecules/direct-messages/ChatList')
);
const ChatToolbar = dynamic(
  () => import('../../molecules/direct-messages/ChatToolbar')
);

const ChatSidebar: React.FC = () => {
  const {
    hasChatsWithCreators,
    hasChatsWithSubs,
    searchChatroom,
    activeTab,
    setActiveTab,
    mobileChatOpened,
  } = useGetChats();

  useEffect(() => {
    if (
      hasChatsWithCreators &&
      hasChatsWithSubs &&
      !activeTab &&
      searchChatroom === ''
    ) {
      setActiveTab(newnewapi.ChatRoom.MyRole.CREATOR);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChatsWithCreators, hasChatsWithSubs, activeTab, searchChatroom]);

  const changeActiveTab = useCallback(
    (tabName: newnewapi.ChatRoom.MyRole) => {
      setActiveTab(tabName);
    },
    [setActiveTab]
  );

  return (
    <SSidebar>
      <ChatToolbar />
      {activeTab && searchChatroom === '' && !mobileChatOpened && (
        <ChatlistTabs
          activeTab={activeTab!!}
          changeActiveTab={changeActiveTab}
        />
      )}
      <ChatList />
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
