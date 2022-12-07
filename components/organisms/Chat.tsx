/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-expressions */
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useUpdateEffect } from 'react-use';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import ChatList from '../molecules/chat/ChatList';
import ChatArea from '../molecules/chat/ChatArea';
import SearchInput from '../atoms/chat/SearchInput';
import NewMessage from '../molecules/chat/NewMessage';
import { IChatData } from '../interfaces/ichat';
import { useAppSelector } from '../../redux-store/store';
import { useOverlayMode } from '../../contexts/overlayModeContext';

const GoBackButton = dynamic(() => import('../molecules/GoBackButton'));

interface IChat {
  username?: string;
  setupIntentClientSecretFromRedirect?: string;
  saveCardFromRedirect?: boolean;
  resetStripeSetupIntent: () => void;
}

export const Chat: React.FC<IChat> = ({
  username,
  setupIntentClientSecretFromRedirect,
  saveCardFromRedirect,
  resetStripeSetupIntent,
}) => {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [chatData, setChatData] = useState<IChatData>({
    chatRoom: null,
    showChatList: null,
  });

  const { t } = useTranslation('page-Chat');
  const [chatListHidden, setChatListHidden] = useState<boolean | undefined>(
    undefined
  );
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  const [newMessage, setNewMessage] = useState<
    newnewapi.IChatMessage | null | undefined
  >();
  const [searchText, setSearchText] = useState<string>('');
  const [newLastMessage, setNewLastMessage] = useState<{
    chatId: number | Long.Long | null | undefined;
  } | null>(null);

  const { enableOverlayMode, disableOverlayMode } = useOverlayMode();

  const showChatList = () => {
    setChatListHidden(false);
  };

  const updateLastMessage = (data: any) => {
    setNewLastMessage(data);
  };

  const openChat = useCallback(
    ({ chatRoom }: IChatData) => {
      let route = '';
      if (chatRoom?.visavis?.user?.username) {
        chatRoom.kind === 1
          ? (route =
              chatRoom.myRole === 2
                ? chatRoom?.visavis?.user?.username
                : `${chatRoom?.visavis?.user?.username}-cr`)
          : (route = `${chatRoom?.visavis?.user?.username}-announcement`);
      } else {
        chatRoom && chatRoom.kind === 4 && chatRoom.myRole === 2
          ? (route = `${user.userData?.username}-announcement`)
          : '';
      }

      router.push(`/direct-messages/${route}`);
      setChatData({ chatRoom, showChatList });
      if (isMobileOrTablet) setChatListHidden(true);
    },
    [router, user.userData?.username, isMobileOrTablet]
  );

  useEffect(() => {
    if (isMobileOrTablet && username && username !== '-mobile') {
      setChatListHidden(true);
    } else {
      setChatListHidden(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileOrTablet]);

  useUpdateEffect(() => {
    if (newMessage) {
      setNewMessage(null);
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [newMessage]);

  const passInputValue = useCallback((str: string) => setSearchText(str), []);

  useEffect(() => {
    if (isMobileOrTablet) {
      enableOverlayMode();
    }

    return () => {
      disableOverlayMode();
    };
  }, [isMobileOrTablet]);

  return (
    <SContainer>
      <SSidebar hidden={chatListHidden !== undefined && chatListHidden}>
        <SToolbar isMobile={isMobileOrTablet}>
          {isMobileOrTablet && (
            <Link href='/'>
              <a>
                <GoBackButton onClick={() => {}} />
              </a>
            </Link>
          )}
          <SearchInput
            placeholderText={t('toolbar.searchPlaceholder')}
            style={{ marginRight: '16px', fontSize: '16px' }}
            passInputValue={passInputValue}
          />
          <NewMessage openChat={openChat} />
        </SToolbar>
        <ChatList
          searchText={searchText}
          openChat={openChat}
          username={username}
          switchedTab={() => setChatListHidden(false)}
          newLastMessage={newLastMessage}
        />
      </SSidebar>
      <SContent>
        <ChatArea
          key={chatData.chatRoom?.id?.toString()}
          {...chatData}
          showChatList={showChatList}
          updateLastMessage={updateLastMessage}
        />
      </SContent>
    </SContainer>
  );
};

export default Chat;

Chat.defaultProps = {
  username: '',
};

const SContainer = styled.div`
  position: relative;
  min-height: 700px;
  height: 100%;
  margin: -20px -16px;
  display: flex;

  ${(props) => props.theme.media.laptop} {
    margin: -20px 0;
    height: calc(100vh - 500px);
  }
`;

interface ISSidebar {
  hidden: boolean;
}

const SSidebar = styled.div<ISSidebar>`
  padding-top: 16px;
  height: 100%;

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
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  z-index: 18;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  position: fixed;
  padding: 0 0 20px;
  width: 100vw;

  ${(props) => props.theme.media.laptop} {
    width: calc(100% - 384px);
    margin-left: auto;
    border-radius: ${(props) => props.theme.borderRadius.large};
    position: relative;
    padding: 0 0 24px;
    z-index: initial;
  }
`;
