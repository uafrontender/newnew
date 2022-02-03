/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import styled from 'styled-components';
import ChatList from '../molecules/chat/ChatList';
import ChatArea from '../molecules/chat/ChatArea';
import SearchInput from '../atoms/chat/SearchInput';
import NewMessage from '../atoms/chat/NewMessage';
import { IChatData } from '../interfaces/chat';

export const Chat = () => {
  const [chatData, setChatData] = useState<IChatData>({ userData: null, messages: [] });
  const openChat = ({ userData, messages }: IChatData) => {
    setChatData({ userData, messages });
  };
  return (
    <SContainer>
      <SSidebar>
        <SToolbar>
          <SearchInput />
          <NewMessage />
        </SToolbar>
        <ChatList openChat={openChat} />
      </SSidebar>
      <SContent>
        <ChatArea {...chatData} />
      </SContent>
    </SContainer>
  );
};

export default Chat;

const SContainer = styled.div`
  position: relative;
  min-height: 700px;
  height: calc(100vh - 500px);

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: -20px;
    margin-bottom: -20px;
  }
`;

const SSidebar = styled.aside`
  top: 32px;
  padding-top: 16px;
  left: 0;
  float: left;
  width: 352px;
  position: sticky;
  height: 100%;

  /* ${(props) => props.theme.media.laptop} {
    top: 40px;
    width: 200px;
    margin-right: unset;
  } */
`;

const SToolbar = styled.div`
  display: flex;
  margin-bottom: 24px;
  justify-content: space-between;
`;

const SContent = styled.div`
  position: relative;
  height: 100%;

  ${(props) => props.theme.media.tablet} {
    margin-left: 354px;
  }

  ${(props) => props.theme.media.laptop} {
    margin-right: -26px;
    padding: 0 0 24px;
    background: ${(props) => props.theme.colorsThemed.background.secondary};
    margin-left: 384px;
    border-radius: ${(props) => props.theme.borderRadius.large};
  }
`;
