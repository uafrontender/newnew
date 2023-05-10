import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import SearchInput from '../../atoms/direct-messages/SearchInput';
import NewMessage from './NewMessage';

import { useGetChats } from '../../../contexts/chatContext';
import { useAppState } from '../../../contexts/appStateContext';
import { useAppSelector } from '../../../redux-store/store';

const GoBackButton = dynamic(
  () => import('../../atoms/direct-messages/GoBackButton')
);

const ChatToolbar: React.FC = () => {
  const { resizeMode } = useAppState();

  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const { t } = useTranslation('page-Chat');
  const { setSearchChatroom } = useGetChats();

  const passInputValue = useCallback(
    (str: string) => {
      setSearchChatroom(str);
    },
    [setSearchChatroom]
  );

  const goBackHandler = useCallback(() => {
    router.back();
  }, [router]);

  const handleChatRoomSelect = useCallback(
    (chatRoom: newnewapi.IChatRoom) => {
      if (
        chatRoom?.myRole === newnewapi.ChatRoom.MyRole.CREATOR &&
        chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE
      ) {
        router.replace(`${user.userData?.username}-announcement`, undefined, {
          shallow: true,
        });
      } else if (chatRoom?.myRole === newnewapi.ChatRoom.MyRole.CREATOR) {
        router.replace(
          `${chatRoom.visavis?.user?.username}-bundle`,
          undefined,
          {
            shallow: true,
          }
        );
      } else {
        router.replace(`${chatRoom.visavis?.user?.username}`, undefined, {
          shallow: true,
        });
      }
    },
    [router, user.userData?.username]
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
