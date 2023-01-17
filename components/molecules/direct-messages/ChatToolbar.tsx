import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import SearchInput from '../../atoms/direct-messages/SearchInput';
import { useAppSelector } from '../../../redux-store/store';
import NewMessage from './NewMessage';
import { useGetChats } from '../../../contexts/chatContext';

const GoBackButton = dynamic(
  () => import('../../atoms/direct-messages/GoBackButton')
);

const ChatToolbar: React.FC = () => {
  const { resizeMode } = useAppSelector((state) => state.ui);
  const { t } = useTranslation('page-Chat');
  const {
    setSearchChatroom,
    setActiveTab,
    activeTab,
    mobileChatOpened,
    setMobileChatOpened,
  } = useGetChats();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  const passInputValue = useCallback(
    (str: string) => {
      if (activeTab && str.length > 0) setActiveTab(undefined);
      setSearchChatroom(str);
    },
    [activeTab, setActiveTab, setSearchChatroom]
  );

  const goBackHandler = useCallback(() => {
    if (mobileChatOpened) {
      setMobileChatOpened(false);
    }
  }, [mobileChatOpened, setMobileChatOpened]);
  return (
    <SToolbar isMobile={isMobileOrTablet}>
      {isMobileOrTablet &&
        (!mobileChatOpened ? (
          <Link href='/'>
            <a>
              <GoBackButton onClick={goBackHandler} />
            </a>
          </Link>
        ) : (
          <GoBackButton onClick={goBackHandler} />
        ))}
      <SearchInput
        placeholderText={t('toolbar.searchPlaceholder')}
        style={{ marginRight: '16px', fontSize: '16px' }}
        passInputValue={passInputValue}
      />
      <NewMessage />
    </SToolbar>
  );
};

export default ChatToolbar;

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
