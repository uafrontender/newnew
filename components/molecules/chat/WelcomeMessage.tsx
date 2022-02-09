import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

interface IWelcomeMessage {
  userAlias: string;
}

const WelcomeMessage: React.FC<IWelcomeMessage> = ({ userAlias }) => {
  const { t } = useTranslation('chat');

  return (
    <SWelcomeMessage>
      <div>
        <span>🎉</span>
        <p>
          {t('chat.welcome-message')} @{userAlias}.
        </p>
      </div>
    </SWelcomeMessage>
  );
};
const SWelcomeMessage = styled.div`
  position: absolute;
  left: 0;
  top: 48px;
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
  }
  p {
    margin: 12px 0 0;
  }
`;
export default WelcomeMessage;
