import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

interface IWelcomeMessage {
  userAlias: string;
}

const WelcomeMessage: React.FC<IWelcomeMessage> = React.memo(
  ({ userAlias }) => {
    const { t } = useTranslation('page-Chat');

    return (
      <SWelcomeMessage>
        <SWelcomeMessageInner>
          <SEmoji>🎉</SEmoji>
          <p>
            {t('chat.welcomeMessage')} {userAlias}
          </p>
        </SWelcomeMessageInner>
      </SWelcomeMessage>
    );
  }
);

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
  p {
    margin: 12px 0 0;
  }
`;
const SWelcomeMessageInner = styled.div`
  max-width: 352px;
  margin: 0 auto;
`;
const SEmoji = styled.span`
  font-size: 48px;
`;
export default WelcomeMessage;
