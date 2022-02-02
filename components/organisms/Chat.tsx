/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import styled from 'styled-components';
import ChatList from '../molecules/chat/ChatList';
import ChatArea from '../molecules/chat/ChatArea';

export const Chat = () => (
  <SContainer>
    <SSidebar>
      <ChatList />
    </SSidebar>
    <SContent>
      <ChatArea />
    </SContent>
  </SContainer>
);

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
  left: 0;
  float: left;
  width: 352px;
  position: sticky;
  margin-right: 32px;
  height:100%;

  /* ${(props) => props.theme.media.laptop} {
    top: 40px;
    width: 200px;
    margin-right: unset;
  } */
`;

const SContent = styled.div`
  position: relative;
  height:100%;

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
