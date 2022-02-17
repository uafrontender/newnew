/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';

import { useAppSelector } from '../../../redux-store/store';

import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import InlineSvg from '../../atoms/InlineSVG';
import GoBackButton from '../GoBackButton';
import OptionCard from './OptionCard';
import OptionWallet from './OptionWallet';

import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';

interface IPaymentModal {
  isOpen: boolean;
  zIndex: number;
  amount?: string;
  showTocApply?: boolean;
  onClose: () => void;
  handlePayWithWallet?: () => void;
  handlePayWithCardStripeRedirect?: () => void;
}

const PaymentModal: React.FC<IPaymentModal> = ({
  isOpen,
  zIndex,
  amount,
  showTocApply,
  onClose,
  handlePayWithWallet,
  handlePayWithCardStripeRedirect,
  children,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('payment-modal');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [selectedOption, setSelectedOption] = useState<'wallet' | 'card'>('wallet');

  return (
    <Modal show={isOpen} overlayDim additionalZ={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isMobile && <SGoBackButton onClick={() => onClose()} />}
          {!isMobile && (
            <SCloseButton onClick={() => onClose()}>
              <InlineSvg svg={CancelIcon} fill={theme.colorsThemed.text.primary} width="24px" height="24px" />
            </SCloseButton>
          )}
          <SHeaderContainer>{children}</SHeaderContainer>
          <SPaymentMethodTitle variant={3}>{t('paymentMethodTitle')}</SPaymentMethodTitle>
          <SOptionsContainer>
            <OptionWallet selected={selectedOption === 'wallet'} handleClick={() => setSelectedOption('wallet')} />
            <OptionCard selected={selectedOption === 'card'} handleClick={() => setSelectedOption('card')} />
          </SOptionsContainer>
          <SPayButtonDiv>
            <SPayButton
              view="primaryGrad"
              onClick={() => {
                if (selectedOption === 'card') {
                  handlePayWithCardStripeRedirect?.();
                } else {
                  handlePayWithWallet?.();
                }
              }}
            >
              {t('payButton')}
              {amount && ` ${amount}`}
            </SPayButton>
            {showTocApply && (
              <STocApply>
                *{' '}
                <Link href="/terms-and-conditions">
                  <a href="/terms-and-conditions" target="_blank">
                    {t('tocApplyLink')}
                  </a>
                </Link>{' '}
                {t('tocApplyText')}
              </STocApply>
            )}
          </SPayButtonDiv>
        </SContentContainer>
      </SWrapper>
    </Modal>
  );
};

PaymentModal.defaultProps = {
  amount: undefined,
  showTocApply: undefined,
  handlePayWithWallet: () => {},
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

const SContentContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 24px;
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

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;
`;

const SHeaderContainer = styled.div`
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colorsThemed.background.outlines1};

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 24px;
    margin-bottom: 24px;
  }
`;

const SPaymentMethodTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SPayButtonDiv = styled.div`
  position: absolute;
  bottom: 16px;
  width: calc(100% - 32px);

  ${({ theme }) => theme.media.tablet} {
    width: calc(100% - 48px);
  }
`;

const SPayButton = styled(Button)`
  width: 100%;
`;

const STocApply = styled.div`
  margin-top: 16px;
  padding-bottom: 16px;

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

const SOptionsContainer = styled.div``;
