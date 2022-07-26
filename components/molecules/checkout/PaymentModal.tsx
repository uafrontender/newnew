/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { toast } from 'react-toastify';

import { useAppSelector } from '../../../redux-store/store';

import Button from '../../atoms/Button';
import Modal from '../../organisms/Modal';
import InlineSvg from '../../atoms/InlineSVG';
import GoBackButton from '../GoBackButton';

import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import { formatNumber } from '../../../utils/format';

interface IReCaptchaRes {
  success?: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  errors?: Array<string> | string;
}

interface IPaymentModal {
  isOpen: boolean;
  zIndex: number;
  amount?: number;
  showTocApply?: boolean;
  bottomCaption?: React.ReactNode;
  onClose: () => void;
  handlePayWithCardStripeRedirect?: () => void;
  children: React.ReactNode;
}

const PaymentModal: React.FC<IPaymentModal> = ({
  isOpen,
  zIndex,
  amount,
  showTocApply,
  bottomCaption,
  onClose,
  handlePayWithCardStripeRedirect,
  children,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('modal-PaymentModal');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handlePayWithCaptchaProtection = async () => {
    try {
      if (!executeRecaptcha) {
        throw new Error('executeRecaptcha not available');
      }

      const recaptchaToken = await executeRecaptcha();

      if (recaptchaToken) {
        const res = await fetch('/api/post_recaptcha_query', {
          method: 'POST',
          body: JSON.stringify({
            recaptchaToken,
          }),
        });

        const jsonRes: IReCaptchaRes = await res.json();

        if (jsonRes?.success && jsonRes?.score && jsonRes?.score > 0.5) {
          handlePayWithCardStripeRedirect?.();
        } else {
          throw new Error(
            jsonRes?.errors
              ? Array.isArray(jsonRes?.errors)
                ? jsonRes.errors[0]?.toString()
                : jsonRes.errors?.toString()
              : 'ReCaptcha failed'
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('toastErrors.generic');
    }
  };

  return (
    <Modal show={isOpen} overlaydim additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          showTocApply={showTocApply ?? false}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isMobile && <SGoBackButton onClick={() => onClose()} />}
          {!isMobile && (
            <SCloseButton onClick={() => onClose()}>
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SCloseButton>
          )}
          <SHeaderContainer>{children}</SHeaderContainer>
          <SPayButtonDiv>
            <SPayButton
              view='primaryGrad'
              onClick={() => handlePayWithCaptchaProtection()}
            >
              {t('payButton')}
              {amount &&
                ` $${formatNumber(
                  Math.max(amount, 0) / 100,
                  amount % 1 === 0
                )}`}
            </SPayButton>
            {bottomCaption || null}
            {showTocApply && (
              <STocApply>
                *{' '}
                <Link href='https://terms.newnew.co'>
                  <a href='https://terms.newnew.co' target='_blank'>
                    {t('tocApplyLink')}
                  </a>
                </Link>{' '}
                {t('tocApplyText')}
              </STocApply>
            )}
            {
              // TODO: re-enable / move / make final decision
              /* <STocApplyReCaptcha>
              {t('reCaptchaTos.siteProtectedBy')}{' '}
              <a target='_blank' href='https://policies.google.com/privacy'>
                {t('reCaptchaTos.privacyPolicy')}
              </a>{' '}
              {t('reCaptchaTos.and')}{' '}
              <a target='_blank' href='https://policies.google.com/terms'>
                {t('reCaptchaTos.tos')}
              </a>{' '}
              {t('reCaptchaTos.apply')}
            </STocApplyReCaptcha> */
            }
          </SPayButtonDiv>
        </SContentContainer>
      </SWrapper>
    </Modal>
  );
};

PaymentModal.defaultProps = {
  amount: undefined,
  showTocApply: undefined,
  bottomCaption: null,
  handlePayWithCardStripeRedirect: () => {},
};

export default PaymentModal;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const SContentContainer = styled.div<{
  showTocApply: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: fit-content;
    /* min-height: 360px; */
    /* max-height: 480px; */
    margin: auto;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 24px;
    /* padding-bottom: 116px; */
  }
`;

const SGoBackButton = styled(GoBackButton)`
  padding-top: 8px;
  padding-bottom: 22px;
  margin-left: -4px;
`;

const SCloseButton = styled.button`
  position: absolute;
  right: 24px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: fit-content;
  border: transparent;
  background: transparent;

  background: ${({ theme }) =>
    theme.name === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  padding: 8px;
  border-radius: 11px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;
`;

const SHeaderContainer = styled.div`
  margin-bottom: 16px;
  flex-grow: 1;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;
  }
`;

const SPayButtonDiv = styled.div`
  /* position: absolute;
  bottom: 16px;
  width: calc(100% - 32px);

  ${({ theme }) => theme.media.tablet} {
    width: calc(100% - 48px);
  } */

  width: 100%;
`;

const SPayButton = styled(Button)`
  width: 100%;
`;

const STocApply = styled.div`
  margin-top: 16px;
  /* padding-bottom: 16px; */

  text-align: center;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  a {
    font-weight: 600;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover,
    &:focus {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};

      transition: 0.2s ease;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 20px;
  }
`;

const STocApplyReCaptcha = styled.div`
  margin-top: 4px;

  text-align: center;

  font-weight: 600;
  font-size: 8px;
  line-height: 10px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  a {
    font-weight: 600;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover,
    &:focus {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};

      transition: 0.2s ease;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 8px;
    line-height: 12px;
  }
`;
