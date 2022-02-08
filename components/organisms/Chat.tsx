/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import ChatList from '../molecules/chat/ChatList';
import ChatArea from '../molecules/chat/ChatArea';
import SearchInput from '../atoms/chat/SearchInput';
import NewMessage from '../molecules/chat/NewMessage';
import { IChatData } from '../interfaces/ichat';
import { useAppSelector } from '../../redux-store/store';

export const Chat = () => {
  const [chatData, setChatData] = useState<IChatData>({ userData: null, messages: [] });
  const openChat = ({ userData, messages }: IChatData) => {
    setChatData({ userData, messages });
  };
  const { t } = useTranslation('chat');
  const [chatListHidden, setChatListHidden] = useState<boolean>(false);

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  useEffect(() => {
    /* eslint-disable no-unused-expressions */
    isMobileOrTablet ? setChatListHidden(true) : setChatListHidden(false);
  }, [isMobileOrTablet]);

  useEffect(() => {
    if (!chatListHidden) {
      setChatListHidden(true);
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [chatData]);

  const showChatList = () => {
    setChatListHidden(false);
  };

  const passInputValue = (str: string) => {
    console.log(str);
  };

  return (
    <SContainer>
      <SSidebar style={{ left: chatListHidden ? '-352px' : 0 }}>
        <SToolbar>
          <SearchInput
            placeholderText={t('toolbar.search-placeholder')}
            style={{ marginRight: '16px', fontSize: '16px' }}
            passInputValue={passInputValue}
          />
          <NewMessage />
        </SToolbar>
        <ChatList openChat={openChat} />
      </SSidebar>
      <SContent>
        <ChatArea {...chatData} showChatList={showChatList} />
      </SContent>
    </SContainer>
  );
};

export default Chat;

const SContainer = styled.div`
  position: relative;
  min-height: 700px;
  height: calc(100vh - 500px);
  margin: -20px -16px;
  display: flex;
  ${(props) => props.theme.media.tablet} {
    margin: -20px -31px;
  }
  ${(props) => props.theme.media.laptop} {
    margin: -20px 0;
  }
`;

interface ISSidebar {
  hidden?: boolean;
}

const SSidebar = styled.aside<ISSidebar>`
  padding-top: 16px;
  width: 100%;
  height: 100%;
  width: 352px;
  position: relative;
  z-index: 1;
  background: ${(props) => props.theme.colors.black};
  ${(props) => props.theme.media.laptop} {
    background: none;
    position: static;
  }
`;

const SToolbar = styled.div`
  display: flex;
  margin-bottom: 24px;
  justify-content: space-between;
`;

const SContent = styled.div`
  position: relative;
  height: 100%;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  padding: 0 0 24px;
  width: 100%;
  margin-left: -352px;
  ${(props) => props.theme.media.laptop} {
    width: calc(100% - 384px);
    margin-left: auto;
    border-radius: ${(props) => props.theme.borderRadius.large};
  }
`;
