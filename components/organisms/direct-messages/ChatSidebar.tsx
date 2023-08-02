import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { FocusOn } from 'react-focus-on';

import { useGetChats } from '../../../contexts/chatContext';
import { useBundles } from '../../../contexts/bundlesContext';
import { useAppState } from '../../../contexts/appStateContext';

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
  className?: string;
}

const ChatSidebar: React.FC<IChatSidebar> = ({
  initialTab,
  hidden,
  withTabs,
  className,
  onChatRoomSelect,
}) => {
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
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

  const isTabs = useMemo(
    () => withTabs && !searchChatroom && tabsVisible && !!activeTab,
    [activeTab, searchChatroom, tabsVisible, withTabs]
  );

  const chatListRef = useRef<HTMLDivElement | null>(null);

  return (
    <SSidebar hidden={hidden} className={className}>
      <FocusOn
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        enabled={!hidden && isMobileOrTablet}
      >
        <ChatToolbar onChatRoomSelect={onChatRoomSelect} />
        {isTabs && (
          <ChatListTabs
            activeTab={activeTab!!}
            changeActiveTab={changeActiveTab}
          />
        )}
        <ChatList
          onChatRoomSelect={onChatRoomSelect}
          myRole={activeTab}
          forwardRef={chatListRef}
        />
      </FocusOn>
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
  height: 100%;
  padding: 0 10px;

  ${(props) => props.theme.media.laptop} {
    background: none;
    position: static;
    width: 352px;
    z-index: 0;
  }
`;
