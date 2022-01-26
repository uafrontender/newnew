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
        width={isMobile ? 232 : 206}
        height={isMobile ? 240 : 202}
        objectFit="cover"
      />
      <SContent>
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
      </SContent>
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

  ${(props) => props.theme.media.tablet} {
    padding: 24px;
    flex-direction: row-reverse;
    justify-content: space-between;
  }
`;

const SContent = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    width: 100%;
    max-width: calc(100% - 222px);
    align-items: flex-start;
  }
`;

const STitle = styled(Headline)`
  margin-top: 16px;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;
  margin-top: 16px;

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    margin-top: 20px;
  }
`;

const SDescriptionWrapper = styled.div`
  margin-top: 8px;

  p {
    display: inline;
  }

  ${(props) => props.theme.media.tablet} {
    margin-top: 12px;
  }
`;

const SDescription = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SLearnMore = styled.p`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  cursor: pointer;
  font-size: 14px;
  line-height: 24px;
  margin-left: 5px;
`;
