/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import GoBackButton from '../GoBackButton';
import Logo from '../Logo';
import { useAppState } from '../../../contexts/appStateContext';
import useGoBackOrRedirect from '../../../utils/useGoBackOrRedirect';

const OnboardingMobileHeader: React.FunctionComponent = () => {
  const { goBackOrRedirect } = useGoBackOrRedirect();
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const handleBack = useCallback(() => {
    goBackOrRedirect('/');
  }, [goBackOrRedirect]);

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
      <SBackButton defer={isMobile ? 250 : undefined} onClick={handleBack} />
    </SOnboardingProgressBarContainer>
  );
};

export default OnboardingMobileHeader;

const SOnboardingProgressBarContainer = styled.div`
  padding-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 58px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-bottom: 0;
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
