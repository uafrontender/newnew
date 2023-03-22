import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

const EmptyInbox: React.FC = React.memo(() => {
  const { t } = useTranslation('page-Chat');

  return (
    <SEmptyInbox>
      <SEmptyInboxIcon>📥</SEmptyInboxIcon>
      <SEmptyInboxTitle>{t('emptyInbox.title')}</SEmptyInboxTitle>
      <SEmptyInboxText>{t('emptyInbox.text')}</SEmptyInboxText>
    </SEmptyInbox>
  );
});

export default EmptyInbox;

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

const SEmptyInboxTitle = styled.strong`
  font-size: 16px;
  margin-bottom: 4px;
  font-weight: 600;
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
`;

const SEmptyInboxText = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 14px;
  margin-right: 0 auto;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  max-width: 260px;
`;
