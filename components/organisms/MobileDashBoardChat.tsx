/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import SearchInput from '../atoms/chat/SearchInput';
import NewMessage from '../molecules/chat/NewMessage';
import { IChatData } from '../interfaces/ichat';
import GoBackButton from '../molecules/GoBackButton';
import MobileChatList from '../molecules/creator/dashboard/MobileChatList';
import MobileChatArea from '../molecules/creator/dashboard/MobileChatArea';
import { useGetChats } from '../../contexts/chatContext';

interface IMobileDashBoardChat {
  closeChat: () => void;
}

const MobileDashBoardChat: React.FC<IMobileDashBoardChat> = ({ closeChat }) => {
  const { chatData, setChatData } = useGetChats();
  const openChat = ({ chatRoom }: IChatData) => {
    setChatData({ chatRoom, showChatList });
  };
  const { t } = useTranslation('page-Creator');
  const [chatListHidden, setChatListHidden] =
    useState<boolean | undefined>(false);
  const [newMessage, setNewMessage] =
    useState<newnewapi.IChatMessage | null | undefined>();
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    setSearchText('');
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    if (chatData.chatRoom) {
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

  return (
    <SContainer>
      <SSidebar hidden={chatListHidden !== undefined && chatListHidden}>
        <SToolbar>
          <GoBackButton onClick={closeChat} />
          <SearchInput
            placeholderText={t('chat.toolbar.searchPlaceholder')}
            style={{ marginRight: '16px', fontSize: '16px' }}
            passInputValue={passInputValue}
          />
          <NewMessage openChat={openChat} />
        </SToolbar>
        <MobileChatList searchText={searchText} openChat={openChat} />
      </SSidebar>
      <SContent>
        <MobileChatArea {...chatData} showChatList={showChatList} />
      </SContent>
    </SContainer>
  );
};

export default MobileDashBoardChat;

const SContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

interface ISSidebar {
  hidden: boolean;
}

const SSidebar = styled.div<ISSidebar>`
  padding-top: 16px;
  height: 100vh;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colors.black};
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
`;

const SToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  height: 70px;
  align-items: center;
  margin-bottom: 0;
`;

const SContent = styled.div`
  position: relative;
  height: 100%;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  padding: 0 0 24px;
  width: 100vw;
`;
