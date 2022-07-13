/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useState } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';

import { useAppSelector } from '../../../redux-store/store';

import Button from '../../atoms/Button';
import Modal from '../../organisms/Modal';
import InlineSvg from '../../atoms/InlineSVG';
import GoBackButton from '../GoBackButton';

import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import assets from '../../../constants/assets';
import Toggle from '../../atoms/Toggle';
import { RewardContext } from '../../../contexts/rewardContext';
import { formatNumber } from '../../../utils/format';

interface IPaymentModal {
  isOpen: boolean;
  zIndex: number;
  amount?: number;
  showTocApply?: boolean;
  bottomCaption?: React.ReactNode;
  noRewards?: boolean;
  onClose: () => void;
  handlePayWithCardStripeRedirect?: (rewardAmount: number) => void;
  children: React.ReactNode;
}

const PaymentModal: React.FC<IPaymentModal> = ({
  isOpen,
  zIndex,
  amount,
  showTocApply,
  bottomCaption,
  noRewards,
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

  const { rewardBalance, isRewardBalanceLoading } = useContext(RewardContext);
  const [useRewards, setUseRewards] = useState(false);

  const rewardUsed =
    useRewards && rewardBalance?.usdCents && amount
      ? Math.min(rewardBalance.usdCents, amount)
      : 0;

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
          {!noRewards && (
            <RewardContainer>
              <RewardImage src={assets.decision.gold} alt='reward balance' />
              <RewardText>{t('rewardsText')}</RewardText>
              <RewardBalance>
                $
                {rewardBalance?.usdCents
                  ? Math.round(rewardBalance.usdCents / 100)
                  : 0}
              </RewardBalance>
              <Toggle
                checked={useRewards}
                disabled={isRewardBalanceLoading}
                onChange={() => {
                  setUseRewards((curr) => !curr);
                }}
              />
            </RewardContainer>
          )}
          <SPayButtonDiv>
            <SPayButton
              view='primaryGrad'
              onClick={() => {
                handlePayWithCardStripeRedirect?.(rewardUsed);
              }}
            >
              {t('payButton')}
              {amount &&
                ` $${formatNumber(
                  Math.max(amount - rewardUsed, 0) / 100,
                  false
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
  noRewards: undefined,
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

const RewardContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid;
  border-color: ${({ theme }) => theme.colorsThemed.text.primary};
  border-radius: 24px;
  height: 78px;
  margin-bottom: 16px;
  padding-left: 16px;
  padding-right: 18px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;
    padding-left: 20px;
    padding-right: 30px;
  }
`;

const RewardImage = styled.img`
  height: 40px;
  width: 40px;
  margin-right: 16px;
  object-fit: cover;
`;

const RewardText = styled.div`
  ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  margin-right: 8px;
  flex-grow: 1;
`;

const RewardBalance = styled.div`
  ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  margin-right: 20px;
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

const SOptionsContainer = styled.div``;
