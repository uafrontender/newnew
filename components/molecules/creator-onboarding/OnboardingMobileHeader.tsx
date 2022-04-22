/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { useAppSelector } from '../../../redux-store/store';

import GoBackButton from '../GoBackButton';
import Logo from '../Logo';

const OnboardingMobileHeader: React.FunctionComponent = () => {
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  return (
    <SOnboardingProgressBarContainer>
      {isTablet ? (
        <Logo
          style={{
            marginTop: 12,
            marginLeft: 32,
          }}
        />
      ) : null}
      <SBackButton
        defer={isMobile ? 250 : undefined}
        onClick={() => router.back()}
      />
    </SOnboardingProgressBarContainer>
  );
};

export default OnboardingMobileHeader;

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
  margin-top: 16px;
  margin-left: 18px;
  margin-bottom: 20px;

  width: fit-content;
  height: fit-content;

  padding: 0px;

  &:active {
    & div > svg {
      transform: scale(0.8);

      transition: 0.2s ease-in-out;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    display: none;
  }
`;
