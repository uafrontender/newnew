import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

interface INoResults {
  text: string;
}

const NoResults: React.FC<INoResults> = ({ text }) => {
  const { t } = useTranslation('page-Chat');

  return (
    <SEmptyInbox>
      <SEmptyInboxIcon>👀</SEmptyInboxIcon>
      <SEmptyInboxText>
        {t('modal.newMessage.noResultsText')} “{text}”.
      </SEmptyInboxText>
      <SEmptyInboxText>
        {t('modal.newMessage.noResultsSearchText')}
      </SEmptyInboxText>
    </SEmptyInbox>
  );
};

export default NoResults;

const SEmptyInbox = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  align-items: center;
  display: flex;
  flex-direction: column;
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
  margin-right: 0 auto;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  max-width: 260px;

  word-break: break-word;
`;
