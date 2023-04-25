import React from 'react';
import { newnewapi } from 'newnew-api';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useGetChats } from '../../../contexts/chatContext';

interface IFunctionProps {
  activeTab: newnewapi.ChatRoom.MyRole;
  changeActiveTab: (arg: newnewapi.ChatRoom.MyRole) => void;
}

const ChatListTabs: React.FC<IFunctionProps> = ({
  activeTab,
  changeActiveTab,
}) => {
  const { t } = useTranslation('page-Chat');
  const { unreadCountForCreator, unreadCountForUser } = useGetChats();

  return (
    <STabs>
      <STab
        active={activeTab === newnewapi.ChatRoom.MyRole.CREATOR}
        onClick={() => changeActiveTab(newnewapi.ChatRoom.MyRole.CREATOR)}
      >
        {t('userTypes.bundleOwners')}
        {unreadCountForCreator > 0 && (
          <SUnreadCount>{unreadCountForCreator}</SUnreadCount>
        )}
      </STab>
      <STab
        active={activeTab === newnewapi.ChatRoom.MyRole.SUBSCRIBER}
        onClick={() => changeActiveTab(newnewapi.ChatRoom.MyRole.SUBSCRIBER)}
      >
        {t('userTypes.creators')}
        {unreadCountForUser > 0 && (
          <SUnreadCount>{unreadCountForUser}</SUnreadCount>
        )}
      </STab>
    </STabs>
  );
};

export default ChatListTabs;

const STabs = styled.div`
  display: flex;
  text-align: center;
  align-items: stretch;
  place-content: stretch;
  margin-bottom: 16px;
  font-size: 14px;
`;

const SUnreadCount = styled.span`
  background: ${({ theme }) => theme.colorsThemed.accent.pink};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.white};
  padding: 0 6px;
  min-width: 20px;
  text-align: center;
  line-height: 20px;
  font-weight: 700;
  font-size: 10px;
  margin-left: 6px;
`;

interface ISTab {
  active: boolean;
}
const STab = styled.div<ISTab>`
  width: calc(100% / 2);
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  ${(props) => {
    if (props.active) {
      return css`
        font-weight: bold;
        position: relative;
        &:after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 4px;
          background: ${props.theme.name === 'light'
            ? props.theme.gradients.blueHorizontal
            : props.theme.colors.white};
          ${({ theme }) => theme.colors.white};
          border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
          border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
        }
      `;
    }
    return css`
      font-weight: normal;
    `;
  }}
`;
