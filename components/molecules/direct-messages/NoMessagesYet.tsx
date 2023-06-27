import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

const NoMessagesYet: React.FC = React.memo(() => {
  const { t } = useTranslation('page-Chat');

  return (
    <SWelcomeMessage>
      <div>
        <span>👋</span>
        <p>{t('chat.noMessagesFirstLine')}</p>
        <p>{t('chat.noMessagesSecondLine')}</p>
      </div>
    </SWelcomeMessage>
  );
});

const SWelcomeMessage = styled.div`
  position: absolute;
  left: 0;
  top: calc(50% - 50px);
  right: 0;
  padding: 0 20px;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  text-align: center;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  div {
    max-width: 352px;
    margin: 0 auto;
  }
  span {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
    line-height: 1;
  }
  p {
    margin: 0;
    font-weight: 600;
  }
`;
export default NoMessagesYet;
