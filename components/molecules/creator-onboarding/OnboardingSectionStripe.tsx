/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useAppSelector } from '../../../redux-store/store';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import { fetchSetStripeLinkCreator } from '../../../api/endpoints/payments';

import Headline from '../../atoms/Headline';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';
import GoBackButton from '../GoBackButton';

import StripeLogo from '../../../public/images/svg/StripeLogo.svg';
import StripeLogoS from '../../../public/images/svg/icons/filled/StripeLogoS.svg';
import VerificationPassedInverted from '../../../public/images/svg/icons/filled/VerificationPassedInverted.svg';
import { Mixpanel } from '../../../utils/mixpanel';

const getStripeButtonTextKey = (
  stripeConnectStatus:
    | newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
    | undefined
    | null
) => {
  switch (stripeConnectStatus) {
    case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
      .PROCESSING: {
      return 'stripeSection.button.stripeConnecting';
    }
    case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
      .CONNECTED_ALL_GOOD: {
      return 'stripeSection.button.stripeConnectedLink';
    }
    case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
      .CONNECTED_NEEDS_ATTENTION: {
      return 'stripeSection.button.requireInformation';
    }
    case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
      .NOT_CONNECTED:
    default: {
      return 'stripeSection.button.requestSetupLink';
    }
  }
};

const OnboardingSectionStripe: React.FunctionComponent = () => {
  const router = useRouter();
  const theme = useTheme();
  // const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { t } = useTranslation('page-CreatorOnboarding');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { showErrorToastPredefined } = useErrorToasts();

  const { stripeConnectStatus } = user.creatorData?.options || {};

  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [isConnectedToStripe, setIsConnectedToStripe] = useState(false);
  const [stripeNeedAttention, setStripeNeedAttention] = useState(false);

  useEffect(() => {
    switch (stripeConnectStatus) {
      case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
        .PROCESSING: {
        setStripeProcessing(true);
        setIsConnectedToStripe(false);
        setStripeNeedAttention(false);
        break;
      }
      case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
        .CONNECTED_ALL_GOOD: {
        setStripeProcessing(false);
        setIsConnectedToStripe(true);
        setStripeNeedAttention(false);

        break;
      }
      case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
        .CONNECTED_NEEDS_ATTENTION: {
        setStripeProcessing(false);
        setIsConnectedToStripe(false);
        setStripeNeedAttention(true);

        break;
      }
      default: {
        setStripeProcessing(false);
        setIsConnectedToStripe(false);
        setStripeNeedAttention(false);
      }
    }
  }, [stripeConnectStatus]);

  const handleRedirectToStripeSetup = async () => {
    try {
      const locationUrl = window.location.href;
      const payload = new newnewapi.SetupStripeCreatorAccountRequest({
        refreshUrl: locationUrl,
        returnUrl: locationUrl,
      });

      const res = await fetchSetStripeLinkCreator(payload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      const url = res.data.setupUrl;
      window.location.href = url;
    } catch (err) {
      console.error(err);
      showErrorToastPredefined(undefined);
    }
  };

  return (
    <SContainer>
      {isMobile && <SGoBackButton onClick={() => router.back()} />}
      <SHeadline variant={5}>
        <span>{t('stripeSection.titleSetUpStripe')}</span>
        <InlineSvg svg={StripeLogo} width='80px' />
      </SHeadline>
      <SUl>
        <li>{t('stripeSection.bullets.1')}</li>
        <li>{t('stripeSection.bullets.2')}</li>
        <li>{t('stripeSection.bullets.3')}</li>
      </SUl>
      <SButton
        view={stripeNeedAttention ? 'danger' : 'primaryGrad'}
        isConnectedToStripe={isConnectedToStripe || stripeProcessing}
        style={{
          ...(isConnectedToStripe
            ? {
                background: theme.colorsThemed.accent.success,
                cursor: 'default',
              }
            : {}),
        }}
        onClick={() => {
          if (isConnectedToStripe || stripeProcessing) {
            return;
          }

          Mixpanel.track('Redirect to Stripe', {
            _button: getStripeButtonTextKey(stripeConnectStatus),
            _stage: 'Onboarding',
            _component: 'OnboardingSectionStripe',
          });

          handleRedirectToStripeSetup();
        }}
      >
        <InlineSvg
          svg={isConnectedToStripe ? VerificationPassedInverted : StripeLogoS}
          width='24px'
          height='24px'
        />
        <span>{t(getStripeButtonTextKey(stripeConnectStatus))}</span>
      </SButton>
      <SControlsDiv>
        {!isMobile && (
          <Link href='/creator/dashboard'>
            <a>
              <GoBackButton
                noArrow
                onClick={() => {
                  Mixpanel.track('Navigation Item Clicked', {
                    _stage: 'Onboarding',
                    _component: 'OnboardingSectionStripe',
                    _target: '/creator/dashboard',
                  });
                }}
              >
                {t('aboutSection.button.back')}
              </GoBackButton>
            </a>
          </Link>
        )}
        {/* <Link href='/creator-onboarding-subrate'>
          <a>
            <Button
              view='primaryGrad'
              disabled={!isConnectedToStripe}
              style={{
                width: isMobile ? '100%' : 'initial',
              }}
            >
              {t('stripeSection.button.submit')}
            </Button>
          </a>
        </Link> */}
      </SControlsDiv>
    </SContainer>
  );
};

export default OnboardingSectionStripe;

const SContainer = styled.div`
  padding: 0 20px 20px;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.media.tablet} {
    padding: 114px 152px 44px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: fit-content;
    padding-left: 0;
    padding-right: 104px;
    padding-top: 44px;
  }
`;

const SGoBackButton = styled(GoBackButton)`
  padding-top: 16px;
  padding-bottom: 22px;
  margin-left: -4px;
`;

const SControlsDiv = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  a,
  button {
    width: 100%;
    height: 56px;
  }

  ${({ theme }) => theme.media.tablet} {
    position: static;
    margin-left: initial;
    width: 100%;
    padding: 0;
    a,
    button {
      width: 170px;
      height: 48px;
    }
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

const SUl = styled.ul`
  padding-left: 16px;

  margin-bottom: 24px;
  li {
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: ${({ theme }) => theme.colorsThemed.text.primary};

    margin-bottom: 8px;
  }
`;

const SButton = styled(Button)<{
  isConnectedToStripe: boolean;
}>`
  margin-bottom: 24px;
  width: 100%;
  cursor: pointer;

  ${({ theme }) => theme.media.tablet} {
    width: 256px;
  }

  span {
    display: flex;

    span {
      position: relative;
      top: 1px;
    }
  }

  ${({ isConnectedToStripe }) =>
    isConnectedToStripe
      ? css`
          &:after {
            display: none;
          }
        `
      : ''};
`;
