/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled, { useTheme } from 'styled-components';

import { useAppSelector } from '../../../redux-store/store';
import { getTopUpWalletSessionUrl } from '../../../api/endpoints/payments';

import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import InlineSvg from '../../atoms/InlineSVG';
import GoBackButton from '../GoBackButton';

import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import TopUpWalletSlider from '../../atoms/settings/TopUpWalletSlider';
import TopUpWalletInput from '../../atoms/settings/TopUpWalletInput';

interface ITopUpWalletModal {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
}

const TopUpWalletModal: React.FunctionComponent<ITopUpWalletModal> = ({
  isOpen,
  zIndex,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('profile');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [amount, setAmount] = useState(5);

  const handleSubmit = async () => {
    try {
      const payload = new newnewapi.TopUpWalletRequest({
        successUrl: `${window.location.href}`,
        cancelUrl: `${window.location.href}`,
        topUpAmount: {
          usdCents: amount * 100,
        },
      });

      const res = await getTopUpWalletSessionUrl(payload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      window.location.href = res.data.sessionUrl;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal show={isOpen} overlaydim additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e: any) => {
            e.stopPropagation();
          }}
        >
          {isMobile && (
            <SGoBackButton onClick={() => onClose()}>
              {t('Settings.sections.Wallet.TopUpWalletModal.heading')}
            </SGoBackButton>
          )}
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
          {!isMobile && (
            <SHeaderContainer>
              {t('Settings.sections.Wallet.TopUpWalletModal.heading')}
            </SHeaderContainer>
          )}
          <TopUpWalletInput
            isOpen={isOpen}
            value={amount}
            onChange={(newValue: number) => setAmount(newValue)}
          />
          {!isMobile && (
            <TopUpWalletSlider
              value={amount}
              min={0}
              max={5000}
              step={5}
              onChange={(newValue: number) => setAmount(newValue)}
              handleIncrement={() => {
                if (amount + 100 > 5000) {
                  setAmount(5000);
                  return;
                }
                setAmount(amount + 100);
              }}
              handleDecrement={() => {
                if (amount - 100 <= 0) {
                  setAmount(0);
                  return;
                }
                setAmount(amount - 100);
              }}
            />
          )}
          {!isMobile && (
            <SControlsDiv>
              <SCancelButton view='transparent' onClick={() => onClose()}>
                {t(
                  'Settings.sections.Wallet.TopUpWalletModal.cancelButtonDesktop'
                )}
              </SCancelButton>
              <Button
                view='primaryGrad'
                disabled={amount <= 4}
                onClick={() => handleSubmit()}
              >
                {t(
                  'Settings.sections.Wallet.TopUpWalletModal.checkoutButtonDesktop'
                )}
              </Button>
            </SControlsDiv>
          )}
          {isMobile && (
            <SButtonCheckoutMobile
              view='primaryGrad'
              disabled={amount <= 4}
              onClick={() => handleSubmit()}
            >
              {t(
                'Settings.sections.Wallet.TopUpWalletModal.checkoutButtonMobile'
              )}
            </SButtonCheckoutMobile>
          )}
        </SContentContainer>
      </SWrapper>
    </Modal>
  );
};

export default TopUpWalletModal;

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
    height: 304px;
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
  top: 26px;
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
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 24px;
    margin-bottom: 24px;
  }
`;

// Controls
const SButtonCheckoutMobile = styled(Button)`
  position: fixed;
  bottom: 16px;
  left: 16px;

  height: 56px;
  width: calc(100% - 32px);
`;

const SControlsDiv = styled.div`
  display: flex;
  justify-content: space-between;

  margin-top: 24px;
`;

const SCancelButton = styled(Button)``;
