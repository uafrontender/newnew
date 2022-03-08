/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import ChatList from '../molecules/chat/ChatList';
import ChatArea from '../molecules/chat/ChatArea';
import SearchInput from '../atoms/chat/SearchInput';
import NewMessage from '../molecules/chat/NewMessage';
import { IChatData } from '../interfaces/ichat';
import { useAppSelector } from '../../redux-store/store';
import GoBackButton from '../molecules/GoBackButton';

export const Chat = () => {
  const [chatData, setChatData] = useState<IChatData>({
    chatRoom: null,
    showChatList: null,
  });
  const openChat = ({ chatRoom }: IChatData) => {
    setChatData({ chatRoom, showChatList });
  };
  const { t } = useTranslation('chat');
  const [chatListHidden, setChatListHidden] = useState<boolean | undefined>(undefined);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);
  const [newMessage, setNewMessage] = useState<newnewapi.IChatMessage | null | undefined>();
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    /* eslint-disable no-unused-expressions */
    isMobileOrTablet ? setChatListHidden(true) : setChatListHidden(undefined);
  }, [isMobileOrTablet]);

  useEffect(() => {
    if (!chatListHidden && isMobileOrTablet) {
      setChatListHidden(true);
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [chatData]);

  useEffect(() => {
    if (newMessage) {
      setNewMessage(null);
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [newMessage]);

  const showChatList = () => {
    setChatListHidden(false);
  };

  const passInputValue = (str: string) => {
    setSearchText(str);
  };

  const gotNewMessage = (msg: newnewapi.IChatMessage | null | undefined) => {
    setNewMessage(msg);
  };

  return (
    <SContainer>
      <SSidebar hidden={chatListHidden !== undefined && chatListHidden}>
        <SToolbar isMobile={isMobileOrTablet}>
          {isMobileOrTablet && (
            <GoBackButton
              onClick={() => {
                setChatListHidden(true);
              }}
            />
          )}
          <SearchInput
            placeholderText={t('toolbar.search-placeholder')}
            style={{ marginRight: '16px', fontSize: '16px' }}
            passInputValue={passInputValue}
          />
          <NewMessage />
        </SToolbar>
        <ChatList searchText={searchText} openChat={openChat} gotNewMessage={gotNewMessage} />
      </SSidebar>
      <SContent>
        <ChatArea {...chatData} showChatList={showChatList} newMessage={newMessage} />
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

  ${(props) => props.theme.media.laptop} {
    margin: -20px 0;
  }
`;

interface ISSidebar {
  hidden: boolean;
}

const SSidebar = styled.div<ISSidebar>`
  padding-top: 16px;
  height: 100%;
  background: ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colors.black)};
  flex-shrink: 0;
  ${(props) => {
    if (props.hidden === false) {
      return css`
        ${props.theme.media.mobile} {
          z-index: 20;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
          position: fixed;
          /* height: 100vh; */
          padding: 0 15px;
        }
      `;
    }
    return css`
      left: -100vw;
      width: 100vw;
    `;
  }}
  ${(props) => props.theme.media.laptop} {
    background: none;
    position: static;
    width: 352px;
    padding: 0;
    z-index: 0;
  }
`;

interface ISToolbar {
  isMobile?: boolean;
}

const SToolbar = styled.div<ISToolbar>`
  display: flex;
  margin-bottom: 24px;
  justify-content: space-between;
  ${(props) => {
    if (props.isMobile) {
      return css`
        height: 70px;
        align-items: center;
        margin-bottom: 0;
      `;
    }
    return css``;
  }}
`;

const SContent = styled.div`
  position: relative;
  height: 100%;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  padding: 0 0 24px;
  width: 100vw;
  ${(props) => props.theme.media.laptop} {
    width: calc(100% - 384px);
    margin-left: auto;
    border-radius: ${(props) => props.theme.borderRadius.large};
  }
`;
