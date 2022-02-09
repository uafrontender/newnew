import React from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppSelector } from '../../../redux-store/store';


import Headline from '../../atoms/Headline';
import Button from '../../atoms/Button';
import GoBackButton from '../GoBackButton';

interface IOnboardingSectionSubrate {
  onboardingState: newnewapi.GetMyOnboardingStateResponse;
}

const OnboardingSectionSubrate: React.FunctionComponent<IOnboardingSectionSubrate> = ({
  onboardingState,
}) => {
  const router = useRouter();
  const { t } = useTranslation('creator-onboarding');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleSubmit = () => {
    console.log(onboardingState);
    router.push('/creator/dashboard');
  };

  return (
    <SContainer>
      {isMobile && (
        <SGoBackButton
          onClick={() => router.back()}
        />
      )}
      <SHeadline
          variant={5}
        >
        <span>
          {t('SubrateSection.heading')}
        </span>
      </SHeadline>
      <SControlsDiv>
        {!isMobile && (
          <GoBackButton
            noArrow
            onClick={() => router.back()}
          >
            { t('AboutSection.backButton') }
          </GoBackButton>
        )}
        <Button
          view="primaryGrad"
          style={{
            width: isMobile ? '100%' : 'initial',
          }}
          onClick={() => handleSubmit()}
        >
          {isMobile ? (
            t('AboutSection.submitMobile')
          ) : t('AboutSection.submitDesktop') }
        </Button>
      </SControlsDiv>
    </SContainer>
  );
};

export default OnboardingSectionSubrate;


const SContainer = styled.div`
  padding-left: 16px;
  padding-right: 16px;

  padding-bottom: 88px;

  z-index: 2;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 0;

    padding-left: 152px;
    padding-right: 152px;

    margin-bottom: 44px;

    margin-top: 114px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: fit-content;

    padding-left: 0;
    padding-right: 104px;

    margin-bottom: 190px;
    margin-top: 44px;
  }
`;

const SGoBackButton = styled(GoBackButton)`
  padding-top: 16px;
  padding-bottom: 22px;
  margin-left: -4px;
`;

const SControlsDiv = styled.div`
  width: 100%;
  margin-top: 80%;

  display: flex;
  justify-content: space-between;


  button {
    width: 100%;
    height: 56px;
  }

  ${({ theme }) => theme.media.tablet} {
    position: static;
    margin-top: 24px;

    margin-left: initial;
    width: 100%;

    button {
      width: 170px;
      height: 48px;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    margin-top: 80%;
  }
`;

const SHeadline = styled(Headline)`
  display: flex;
  align-items: flex-start;

  margin-bottom: 40px;

  span {
    position: relative;
    top: 3px;
  }
`;
