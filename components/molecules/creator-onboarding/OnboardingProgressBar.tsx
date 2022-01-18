/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../redux-store/store';

import Text from '../../atoms/Text';
import GoBackButton from '../GoBackButton';

interface IOnboardingProgressBar {
  numStages: number;
  currentStage: number;
}

const OnboardingProgressBar: React.FunctionComponent<IOnboardingProgressBar> = ({
  numStages,
  currentStage,
}) => {
  const { t } = useTranslation('creator-onboarding');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  return (
    <SOnboardingProgressBarContainer>
      <SBackButton
        defer={isMobile ? 250 : undefined}
        onClick={() => router.back()}
      />
      <SText
        variant={3}
        weight={600}
      >
        {currentStage}
        {' '}
        { t('progressbar.of') }
        {' '}
        {numStages}
      </SText>
      <SProgressBar
        progress={(currentStage / numStages) * 100}
      />
    </SOnboardingProgressBarContainer>
  );
};

export default OnboardingProgressBar;

const SOnboardingProgressBarContainer = styled.div`
  padding-bottom: 30px;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 38px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-bottom: 46px;
  }
`;

const SBackButton = styled(GoBackButton)`
  position: absolute;
  top: 16px;
  left: 18px;

  width: fit-content;
  height: fit-content;

  padding: 0px;

  &:active {
    & div > svg {
      transform: scale(0.8);

      transition: .2s ease-in-out;
    }
  }


  ${({ theme }) => theme.media.tablet} {
    display: none;
  }
`;

const SText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin: 18px 0;

  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    margin: 26px 0;

    text-align: right;
    padding-right: 14px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin: 24px 0 14px 0;

    text-align: left;
  }
`;

const SProgressBar = styled.div<{
  progress: number;
}>`
  position: relative;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  height: 6px;

  ${({ theme }) => theme.media.laptop} {
    width: calc(100% - 104px);
  }

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;


    background: linear-gradient(270deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF;
    border-radius: 16px;

    height: 6px;
    width: ${({ progress }) => `${progress}%`};

    transition: .2s linear;
  }
`;
