/* eslint-disable no-nested-ternary */
import React from 'react';
import Image from 'next/image';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../../../../atoms/Text';

import assets from '../../../../../constants/assets';

const NoResults: React.FC = React.memo(() => {
  // TODO: add this line from page-Creator to page-Notification for other languages as well
  const { t } = useTranslation('page-Creator');
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
          width={theme.name === 'dark' ? 110 : 54}
          height={theme.name === 'dark' ? 110 : 74}
        />
        <SText variant={3} weight={600}>
          {t('noNotifications')}
        </SText>
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

const SText = styled(Text)`
  margin: 20px auto 0;
  text-align: center;
  white-space: pre-line;
`;
