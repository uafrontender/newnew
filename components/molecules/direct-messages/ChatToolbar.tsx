import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import SearchInput from '../../atoms/direct-messages/SearchInput';
import NewMessage from './NewMessage';

import { useGetChats } from '../../../contexts/chatContext';
import { useAppState } from '../../../contexts/appStateContext';

const GoBackButton = dynamic(
  () => import('../../atoms/direct-messages/GoBackButton')
);

const ChatToolbar: React.FC = () => {
  const { resizeMode } = useAppState();
  const router = useRouter();

  const { t } = useTranslation('page-Chat');
  const { setSearchChatroom, mobileChatOpened, setMobileChatOpened } =
    useGetChats();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  const passInputValue = useCallback(
    (str: string) => {
      setSearchChatroom(str);
    },
    [setSearchChatroom]
  );

  const goBackHandler = useCallback(() => {
    if (mobileChatOpened) {
      setMobileChatOpened(false);
    }
    router.push('/');
  }, [mobileChatOpened, router, setMobileChatOpened]);

  return (
    <SToolbar isMobile={isMobileOrTablet}>
      {isMobileOrTablet && <GoBackButton onClick={goBackHandler} />}
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
