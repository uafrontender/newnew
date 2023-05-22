import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';

import SearchInput from '../../atoms/direct-messages/SearchInput';
import NewMessage from './NewMessage';

import { useGetChats } from '../../../contexts/chatContext';
import { useAppState } from '../../../contexts/appStateContext';
import useGoBackOrRedirect from '../../../utils/useGoBackOrRedirect';

const GoBackButton = dynamic(
  () => import('../../atoms/direct-messages/GoBackButton')
);

interface IChatToolbar {
  onChatRoomSelect: (chatRoom: newnewapi.IChatRoom) => void;
}

const ChatToolbar: React.FC<IChatToolbar> = ({ onChatRoomSelect }) => {
  const { resizeMode } = useAppState();

  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const { goBackOrRedirect } = useGoBackOrRedirect();

  const { t } = useTranslation('page-Chat');
  const { setSearchChatroom } = useGetChats();

  const passInputValue = useCallback(
    (str: string) => {
      setSearchChatroom(str);
    },
    [setSearchChatroom]
  );

  const goBackHandler = useCallback(() => {
    goBackOrRedirect('/');
  }, [goBackOrRedirect]);

  const handleChatRoomSelect = useCallback(
    (chatRoom: newnewapi.IChatRoom) => {
      onChatRoomSelect(chatRoom);
    },
    [onChatRoomSelect]
  );

  return (
    <SToolbar isMobile={isMobileOrTablet}>
      {isMobileOrTablet && <GoBackButton onClick={goBackHandler} />}
      <SearchInput
        placeholderText={t('toolbar.searchPlaceholder')}
        style={{ marginRight: '16px', fontSize: '16px' }}
        passInputValue={passInputValue}
      />
      <NewMessage onNewMessageSelect={handleChatRoomSelect} />
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
