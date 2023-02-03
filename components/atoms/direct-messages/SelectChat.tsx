import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

const SelectChat = () => {
  const { t } = useTranslation('page-Chat');

  return (
    <SEmptyInbox>
      <SEmptyInboxIcon>💬</SEmptyInboxIcon>
      <SEmptyInboxText>{t('selectChat')}</SEmptyInboxText>
    </SEmptyInbox>
  );
};

export default SelectChat;

const SEmptyInbox = styled.div`
  text-align: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  line-height: 20px;
`;

const SEmptyInboxIcon = styled.span`
  font-size: 48px;
  line-height: 1;
  margin-bottom: 16px;
`;

const SEmptyInboxText = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  margin-right: 0 auto;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  max-width: 260px;
`;
