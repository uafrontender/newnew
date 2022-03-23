import React from 'react';
import styled, { css, useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppSelector } from '../../../redux-store/store';

import { fetchSetStripeLinkCreator } from '../../../api/endpoints/payments';

import Headline from '../../atoms/Headline';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

import StripeLogo from '../../../public/images/svg/StripeLogo.svg';
import StripeLogoS from '../../../public/images/svg/icons/filled/StripeLogoS.svg';
import VerificationPassedInverted from '../../../public/images/svg/icons/filled/VerificationPassedInverted.svg';
import GoBackButton from '../../molecules/GoBackButton';

interface IDashboardSectionStripe {
  isConnectedToStripe: boolean;
}

const DashboardSectionStripe: React.FC<IDashboardSectionStripe> = ({ isConnectedToStripe }) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('creator');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleRedirectToStripesetup = async () => {
    try {
      const payload = new newnewapi.SetupStripeCreatorAccountRequest({
        refreshUrl: window.location.href,
        returnUrl: window.location.href,
      });

      const res = await fetchSetStripeLinkCreator(payload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

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
        <InlineSvg svg={StripeLogo} width="80px" />
      </SHeadline>
      <SUl>
        <li>{t('stripe.bullets.1')}</li>
        <li>{t('stripe.bullets.2')}</li>
        <li>{t('stripe.bullets.3')}</li>
      </SUl>
      <SButtons>
        <SButton
          view="primaryGrad"
          isConnectedToStripe={isConnectedToStripe}
          style={{
            ...(isConnectedToStripe
              ? {
                  background: theme.colorsThemed.accent.success,
                }
              : {}),
          }}
          onClick={() => {
            if (!isConnectedToStripe) {
              handleRedirectToStripesetup();
            }
          }}
        >
          <InlineSvg svg={!isConnectedToStripe ? StripeLogoS : VerificationPassedInverted} width="24px" height="24px" />
          <span>{isConnectedToStripe ? t('stripe.stripeConnectedLinkBtn') : t('stripe.requestSetupLinkBtn')}</span>
        </SButton>
        <SButtonUpdate
          view="transparent"
          onClick={() => {
            handleRedirectToStripesetup();
          }}
        >
          {t('stripe.updateButton')}
        </SButtonUpdate>
      </SButtons>
      <SControlsDiv>
        {!isMobile && (
          <GoBackButton noArrow onClick={() => router.back()}>
            {t('stripe.backButton')}
          </GoBackButton>
        )}
        <Button
          view="primaryGrad"
          disabled={!isConnectedToStripe}
          style={{
            width: isMobile ? '100%' : 'initial',
          }}
          onClick={() => router.back()}
        >
          {isMobile ? t('stripe.submitMobile') : t('stripe.submitDesktop')}
        </Button>
      </SControlsDiv>
    </SContainer>
  );
};

export default DashboardSectionStripe;

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
  font-weight: 600;
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
  border: 1px solid ${(props) => (props.theme.name === 'light' ? '#2C2C33' : props.theme.colors.white)};
  cursor: pointer;
  &:hover {
    background: ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colorsThemed.background.secondary
        : props.theme.colors.white} !important;
    color: #434956;
  }
`;
