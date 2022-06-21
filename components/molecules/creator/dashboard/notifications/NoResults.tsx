/* eslint-disable no-nested-ternary */
import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import emptyFolder from '../../../../../public/images/notifications/no-results.png';

const NoResults: React.FC = React.memo(() => {
  // TODO: add this line from page-Creator to page-Notification for other languages as well
  const { t } = useTranslation('page-Creator');

  return (
    <SContainer>
      <SWrapper>
        <Image
          src={emptyFolder}
          alt={t('noNotifications')}
          width={110}
          height={110}
        />
        <SText>{t('noNotifications')}</SText>
      </SWrapper>
    </SContainer>
  );
});

export default NoResults;

const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 400px);
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 14px;
`;

const SWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: auto 0;
  max-width: 400px;
  padding: 20px 10px;
`;

const SText = styled.p`
  margin: 20px auto 0;
  font-size: 20px;
  font-weight: bold;
  line-height: 28px;
  text-align: center;
  white-space: pre-line;
`;
