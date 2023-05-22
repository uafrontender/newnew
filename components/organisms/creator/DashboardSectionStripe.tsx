/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import { useAppSelector } from '../../../redux-store/store';

import { fetchSetStripeLinkCreator } from '../../../api/endpoints/payments';

import Headline from '../../atoms/Headline';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

import StripeLogo from '../../../public/images/svg/StripeLogo.svg';
import StripeLogoS from '../../../public/images/svg/icons/filled/StripeLogoS.svg';
import VerificationPassedInverted from '../../../public/images/svg/icons/filled/VerificationPassedInverted.svg';
import GoBackButton from '../../molecules/GoBackButton';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';
import opnUrlInNewTab from '../../../utils/openUrlInNewTab';
import useGoBackOrRedirect from '../../../utils/useGoBackOrRedirect';

const getStripeButtonTextKey = (
  stripeConnectStatus:
    | newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
    | undefined
    | null
) => {
  switch (stripeConnectStatus) {
    case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
      .PROCESSING: {
      return 'stripe.button.stripeConnecting';
    }
    case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
      .CONNECTED_ALL_GOOD: {
      return 'stripe.button.stripeConnectedLink';
    }
    case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
      .CONNECTED_NEEDS_ATTENTION: {
      return 'stripe.button.requireInformation';
    }
    case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
      .NOT_CONNECTED:
    default: {
      return 'stripe.button.requestSetupLink';
    }
  }
};

const DashboardSectionStripe: React.FC = React.memo(() => {
  const { goBackOrRedirect } = useGoBackOrRedirect();
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const { t } = useTranslation('page-Creator');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { stripeConnectStatus } = user.creatorData?.options || {};

  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [isConnectedToStripe, setIsConnectedToStripe] = useState(false);
  const [stripeNeedAttention, setStripeNeedAttention] = useState(false);

  useEffect(() => {
    switch (stripeConnectStatus) {
      case newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
        .PROCESSING: {
        setStripeProcessing(true);
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
      // On close stripe in new tab return to dashboard
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const locationUrl = `${baseUrl}/creator/dashboard`;
      const payload = new newnewapi.SetupStripeCreatorAccountRequest({
        refreshUrl: locationUrl,
        returnUrl: locationUrl,
      });

      const res = await fetchSetStripeLinkCreator(payload);

      if (!res.data || res.error) {
        throw new Error(res.error?.message ?? 'Request failed');
      }

      const url = res.data.setupUrl;
      // Open in a separate tab to keep navigation history intact
      opnUrlInNewTab(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SContainer>
      {isMobile && (
        <SGoBackButton onClick={() => goBackOrRedirect('/creator/dashboard')} />
      )}
      <SHeadline variant={5}>
        <span>{t('stripe.titleSetUpStripe')}</span>
        <SInlineSvg svg={StripeLogo} width='80px' />
      </SHeadline>
      <SUl>
        <li>{t('stripe.bullets.1')}</li>
        <li>{t('stripe.bullets.2')}</li>
        <li>{t('stripe.bullets.3')}</li>
      </SUl>
      <SButtons>
        <SButton
          view={stripeNeedAttention ? 'danger' : 'primaryGrad'}
          isConnectedToStripe={isConnectedToStripe || stripeProcessing}
          stripeNeedAttention={stripeNeedAttention}
          style={{
            ...(isConnectedToStripe
              ? {
                  background: theme.colorsThemed.accent.success,
                }
              : {}),
          }}
          onClick={() => {
            if (!isConnectedToStripe && !stripeProcessing) {
              Mixpanel.track('Redirect to Stripe', {
                _button: getStripeButtonTextKey(stripeConnectStatus),
                _stage: 'Dashboard',
                _component: 'DashboardSectionStripe',
              });
              handleRedirectToStripeSetup();
            }
          }}
        >
          <InlineSvg
            svg={isConnectedToStripe ? VerificationPassedInverted : StripeLogoS}
            width='24px'
            height='24px'
          />
          <span>{t(getStripeButtonTextKey(stripeConnectStatus))}</span>
        </SButton>
        {isConnectedToStripe && (
          <SButtonUpdate
            view='transparent'
            onClick={() => {
              Mixpanel.track('Redirect to Stripe', {
                _button: 'Update payment info',
                _stage: 'Dashboard',
                _component: 'DashboardSectionStripe',
              });
              handleRedirectToStripeSetup();
            }}
          >
            {t('stripe.button.update')}
          </SButtonUpdate>
        )}
      </SButtons>
      <SControlsDiv>
        {!isMobile && (
          <Link href='/creator/dashboard'>
            <a>
              <GoBackButton noArrow onClick={() => {}}>
                {t('stripe.button.back')}
              </GoBackButton>
            </a>
          </Link>
        )}
        <Link href={!isConnectedToStripe ? '' : '/creator/dashboard'}>
          <a>
            <Button
              view='primaryGrad'
              disabled={!isConnectedToStripe}
              style={{
                width: isMobile ? '100%' : 'initial',
              }}
            >
              {t('stripe.button.submit')}
            </Button>
          </a>
        </Link>
      </SControlsDiv>
    </SContainer>
  );
});

export default DashboardSectionStripe;

const SContainer = styled.div`
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 88px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100vh;

  ${({ theme }) => theme.media.tablet} {
    padding: 127px 32px 44px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding: 44px 0 19px;
  }
  ${({ theme }) => theme.media.desktop} {
    padding: 44px 0 19px;
  }
`;

const SGoBackButton = styled(GoBackButton)`
  padding-top: 16px;
  padding-bottom: 22px;
  margin-left: -4px;
  display: flex;
`;

const SControlsDiv = styled.div`
  width: 100%;
  margin-top: auto;

  /* display: none; */
  justify-content: space-between;

  button {
    width: 100%;
    height: 56px;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
    display: flex;
    button {
      width: 170px;
      height: 48px;
    }
  }

  ${({ theme }) => theme.media.laptopM} {
    padding-right: 60px;
  }

  ${({ theme }) => theme.media.desktop} {
    padding-right: 130px;
  }
`;

const SHeadline = styled(Headline)`
  display: inline-block;
  font-weight: 600;
  margin-bottom: 40px;
  font-size: 24px;

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

const SButtons = styled.div`
  display: flex;
`;

const SButton = styled(Button)<{
  isConnectedToStripe?: boolean;
  stripeNeedAttention?: boolean;
}>`
  margin-bottom: 24px;
  font-size: 16px;
  margin-right: 24px;
  span {
    display: flex;

    span {
      position: relative;
      top: 1px;
      margin-left: 10px;
    }
  }

  ${({ stripeNeedAttention }) =>
    stripeNeedAttention
      ? css`
          &&& {
            &:hover {
              box-shadow: none;
            }
          }
        `
      : ''};

  ${({ isConnectedToStripe }) =>
    isConnectedToStripe
      ? css`
          &:after {
            display: none;
          }
          cursor: default;
        `
      : ''};
`;

const SButtonUpdate = styled(SButton)`
  border: 1px solid
    ${(props) =>
      props.theme.name === 'light' ? '#2C2C33' : props.theme.colors.white};
  cursor: pointer;
  background: ${(props) =>
    props.theme.name === 'light' && props.theme.colors.white} !important;
  color: ${(props) => props.theme.name === 'light' && '#434956'} !important;
  &:hover {
    background: ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colorsThemed.background.secondary
        : props.theme.colors.white} !important;
    color: #434956;
  }

  position: absolute;
  bottom: 16px;
  left: 0;
  margin: 0 16px;
  width: calc(100% - 32px);

  ${({ theme }) => theme.media.tablet} {
    position: static;
    width: auto;
    margin: 0 0 24px;
    text-align: center;
  }
`;

const SInlineSvg = styled(InlineSvg)`
  display: inline-block;
  vertical-align: middle;
  height: 35px;
`;
