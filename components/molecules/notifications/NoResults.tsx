/* eslint-disable no-nested-ternary */
import React from 'react';
import Image from 'next/image';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import assets from '../../../constants/assets';

const NoResults: React.FC = React.memo(() => {
  // TODO: add this line from page-Creator to page-Notification for other languages as well
  const { t } = useTranslation('page-Notifications');
  const theme = useTheme();

  return (
    <SContainer>
      <SWrapper>
        <Image
          src={
            theme.name === 'dark'
              ? assets.floatingAssets.darkSubMC
              : assets.floatingAssets.lightSubMC
          }
          alt={t('noNotifications')}
          width={theme.name === 'dark' ? 110 : 55}
          height={theme.name === 'dark' ? 110 : 70}
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
  height: 55vh;
  max-height: 370px;
  margin-top: 12px;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 14px;
  border: 2px solid
    ${({ theme }) =>
      theme.name === 'dark'
        ? theme.colors.darkGray
        : theme.colorsThemed.background.outlines1};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-top: 20px;
  }
`;

const SWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: auto 0;
  max-width: 400px;
  padding: 20px 15px;

  ${({ theme }) => theme.media.mobileM} {
    padding: 20px 48px;
  }
`;

const SText = styled.p`
  margin: 20px auto 0;
  font-size: 16px;
  font-weight: bold;
  line-height: 20px;
  text-align: center;
  white-space: pre-line;
`;
