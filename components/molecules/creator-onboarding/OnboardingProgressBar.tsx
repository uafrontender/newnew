/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useAppSelector } from '../../../redux-store/store';

interface IOnboardingProgressBar {
  numStages: number;
  currentStage: number;
}

const OnboardingProgressBar: React.FunctionComponent<IOnboardingProgressBar> = ({
  numStages,
  currentStage,
}) => {
  const { t } = useTranslation('creator-onboarding');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);

  return (
    <SOnboardingProgressBarContainer>
      <SProgressBar
        progress={(currentStage / numStages) * 100}
      />
    </SOnboardingProgressBarContainer>
  );
};

export default OnboardingProgressBar;

const SOnboardingProgressBarContainer = styled.div`

`;

const SProgressBar = styled.div<{
  progress: number;
}>`
  position: relative;


  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;


    background: linear-gradient(270deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF;
    border-radius: 16px;

    height: 6px;
    width: ${({ progress }) => `${progress}%`};
  }
`;
