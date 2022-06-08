/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
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
import { updateMe } from '../../../api/endpoints/user';

interface IDashboardSectionStripe {
  isConnectedToStripe: boolean;
  stripeConnectStatus:
    | newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
    | undefined;
}

const DashboardSectionStripe: React.FC<IDashboardSectionStripe> = React.memo(
  ({ isConnectedToStripe, stripeConnectStatus }) => {
    const router = useRouter();
    const theme = useTheme();
    const { t } = useTranslation('creator');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const [stripeProcessing, setStripeProcessing] = useState(false);
    const [loadingStripeProcessing, setLoadingStripeProcessing] =
      useState(false);

    const handleStripeProcessing = useCallback(async () => {
      if (loadingStripeProcessing) return;
      try {
        setLoadingStripeProcessing(true);

        const payload = new newnewapi.UpdateMeRequest({
          isStripeAccountProcessing: stripeProcessing,
        });

        const updateMeRes = await updateMe(payload);

        if (!updateMeRes.data || updateMeRes.error)
          throw new Error(updateMeRes.error?.message ?? 'Request failed');
        setLoadingStripeProcessing(false);
      } catch (err) {
        console.log(err);
        setLoadingStripeProcessing(false);
      }
    }, [loadingStripeProcessing, stripeProcessing]);

    useEffect(() => {
      if (
        router &&
        router.query &&
        !isConnectedToStripe &&
        stripeConnectStatus === 4
      ) {
        if (router.query.query && router.query.query === 'stripe_processing') {
          setStripeProcessing(true);
        }
      }
      console.log(stripeConnectStatus);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query, isConnectedToStripe, stripeConnectStatus]);

    useEffect(() => {
      if (stripeProcessing && !loadingStripeProcessing) {
        handleStripeProcessing();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stripeProcessing, loadingStripeProcessing]);

    const handleRedirectToStripesetup = async () => {
      try {
        let returnUrl = window.location.href;
        if (!window.location.href.includes('stripe_processing')) {
          returnUrl = `${window.location.href}?query=stripe_processing`;
        }
        const payload = new newnewapi.SetupStripeCreatorAccountRequest({
          refreshUrl: window.location.href,
          returnUrl,
        });

        const res = await fetchSetStripeLinkCreator(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        const url = res.data.setupUrl;
        window.location.href = url;
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <SContainer>
        {isMobile && <SGoBackButton onClick={() => router.back()} />}
        <SHeadline variant={5}>
          <span>{t('stripe.title-set-up-stripe')}</span>
          <InlineSvg svg={StripeLogo} width='80px' />
        </SHeadline>
        <SUl>
          <li>{t('stripe.bullets.1')}</li>
          <li>{t('stripe.bullets.2')}</li>
          <li>{t('stripe.bullets.3')}</li>
        </SUl>
        <SButtons>
          <SButton
            view='primaryGrad'
            isConnectedToStripe={
              isConnectedToStripe && stripeConnectStatus !== 4
            }
            style={{
              ...(isConnectedToStripe && stripeConnectStatus !== 4
                ? {
                    background: theme.colorsThemed.accent.success,
                  }
                : {}),
            }}
            onClick={() => {
              if (!isConnectedToStripe && stripeConnectStatus !== 4) {
                handleRedirectToStripesetup();
              }
            }}
          >
            <InlineSvg
              svg={
                !isConnectedToStripe && stripeConnectStatus !== 4
                  ? StripeLogoS
                  : VerificationPassedInverted
              }
              width='24px'
              height='24px'
            />
            <span>
              {isConnectedToStripe
                ? stripeConnectStatus === 4
                  ? t('stripe.stripeConnecting')
                  : t('stripe.stripeConnectedLinkBtn')
                : t('stripe.requestSetupLinkBtn')}
            </span>
          </SButton>
          {isConnectedToStripe && (
            <SButtonUpdate
              view='transparent'
              onClick={() => {
                handleRedirectToStripesetup();
              }}
            >
              {t('stripe.updateButton')}
            </SButtonUpdate>
          )}
        </SButtons>
        <SControlsDiv>
          {!isMobile && (
            <Link href='/creator/dashboard'>
              <a>
                <GoBackButton noArrow onClick={() => {}}>
                  {t('stripe.backButton')}
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
                {isMobile
                  ? t('stripe.submitMobile')
                  : t('stripe.submitDesktop')}
              </Button>
            </a>
          </Link>
        </SControlsDiv>
      </SContainer>
    );
  }
);

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

  ${({ theme }) => theme.media.laptop} {
    padding-right: 60px;
  }

  ${({ theme }) => theme.media.desktop} {
    padding-right: 130px;
  }
`;

const SHeadline = styled(Headline)`
  display: flex;
  align-items: flex-start;
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
}>`
  margin-bottom: 24px;
  font-size: 16px;
  margin-right: 32px;
  span {
    display: flex;

    span {
      position: relative;
      top: 1px;
      margin-left: 10px;
    }
  }

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
