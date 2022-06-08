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
import GoBackButton from '../GoBackButton';

import StripeLogo from '../../../public/images/svg/StripeLogo.svg';
import StripeLogoS from '../../../public/images/svg/icons/filled/StripeLogoS.svg';
import VerificationPassedInverted from '../../../public/images/svg/icons/filled/VerificationPassedInverted.svg';
import { updateMe } from '../../../api/endpoints/user';
// import { setUserData } from '../../../redux-store/slices/userStateSlice';

interface IOnboardingSectionStripe {
  isConnectedToStripe: boolean;
  stripeConnectStatus:
    | newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
    | undefined;
}

const OnboardingSectionStripe: React.FunctionComponent<IOnboardingSectionStripe> =
  ({ isConnectedToStripe, stripeConnectStatus }) => {
    const router = useRouter();
    const theme = useTheme();
    const { t } = useTranslation('creator-onboarding');
    // const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
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

        console.log(payload, updateMeRes);

        // dispatch(
        //   setUserData({
        //     bio: updateMeRes.data.me?.bio,
        //   })
        // );

        setLoadingStripeProcessing(false);
      } catch (err) {
        console.log(err);
        setLoadingStripeProcessing(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
        console.log(user.creatorData?.options);

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
          <span>{t('StripeSection.title-set-up-stripe')}</span>
          <InlineSvg svg={StripeLogo} width='80px' />
        </SHeadline>
        <SUl>
          <li>{t('StripeSection.bullets.1')}</li>
          <li>{t('StripeSection.bullets.2')}</li>
          <li>{t('StripeSection.bullets.3')}</li>
        </SUl>
        <SButton
          view='primaryGrad'
          isConnectedToStripe={isConnectedToStripe && stripeConnectStatus !== 4}
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
                ? t('StripeSection.stripeConnecting')
                : t('StripeSection.stripeConnectedLinkBtn')
              : t('StripeSection.requestSetupLinkBtn')}
          </span>
        </SButton>
        <SControlsDiv>
          {!isMobile && (
            <Link href='/creator/dashboard'>
              <a>
                <GoBackButton noArrow onClick={() => {}}>
                  {t('AboutSection.backButton')}
                </GoBackButton>
              </a>
            </Link>
          )}
          <Link href='/creator-onboarding-subrate'>
            <a>
              <Button
                view='primaryGrad'
                disabled={!isConnectedToStripe}
                style={{
                  width: isMobile ? '100%' : 'initial',
                }}
              >
                {isMobile
                  ? t('StripeSection.submitMobile')
                  : t('StripeSection.submitDesktop')}
              </Button>
            </a>
          </Link>
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
          cursor: default;
        `
      : ''};
`;
