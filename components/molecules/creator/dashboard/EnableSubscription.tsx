import React, { useCallback } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';

import { useAppSelector } from '../../../../redux-store/store';

import acImage from '../../../../public/images/creation/AC.png';

export const EnableSubscription = () => {
  const { t } = useTranslation('creator');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleSubmit = useCallback(() => {
    console.log('subscribe');
  }, []);
  const handleLearnMore = useCallback(() => {
    console.log('learn more');
  }, []);

  return (
    <SContainer>
      <Image
        src={acImage}
        alt="Enable subscription"
        width={isMobile ? 232 : 120}
        height={isMobile ? 240 : 120}
        objectFit="cover"
      />
      <STitle variant={6}>
        {t('dashboard.enableSubscription.title')}
      </STitle>
      <SDescriptionWrapper>
        <SDescription variant={3} weight={600}>
          {t('dashboard.enableSubscription.description')}
        </SDescription>
        <SLearnMore onClick={handleLearnMore}>
          {t('dashboard.enableSubscription.learnMore')}
        </SLearnMore>
      </SDescriptionWrapper>
      <SButton
        view="primaryGrad"
        onClick={handleSubmit}
      >
        {t('dashboard.enableSubscription.submit')}
      </SButton>
    </SContainer>
  );
};

export default EnableSubscription;

const SContainer = styled.div`
  padding: 16px;
  display: flex;
  background: ${(props) => (props.theme.name === 'light' ? props.theme.colorsThemed.background.primary : props.theme.colorsThemed.background.secondary)};
  align-items: center;
  border-radius: 16px;
  flex-direction: column;
  justify-content: center;
`;

const STitle = styled(Headline)`
  margin-top: 16px;
`;

const SButton = styled(Button)`
  width: 100%;
  margin-top: 16px;
`;

const SDescriptionWrapper = styled.div`
  p {
    display: inline;
  }
`;

const SDescription = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 8px;
`;

const SLearnMore = styled.p`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  cursor: pointer;
  font-size: 14px;
  line-height: 24px;
  margin-left: 5px;
`;
