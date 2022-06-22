/* eslint-disable no-unsafe-optional-chaining */
import React, { useContext, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import { WalletContext } from '../../../contexts/walletContext';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Lottie from '../../atoms/Lottie';
import Headline from '../../atoms/Headline';
import InlineSvg from '../../atoms/InlineSVG';
import TopUpWalletModal from '../../molecules/settings/TopUpWalletModal';

// Icons
import WalletIcon from '../../../public/images/svg/icons/outlined/Wallet.svg';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import { formatNumber } from '../../../utils/format';

interface ISettingsWallet {}

const SettingsWallet: React.FunctionComponent<ISettingsWallet> = () => {
  const theme = useTheme();
  const { t } = useTranslation('page-Profile');

  const { walletBalance, isBalanceLoading } = useContext(WalletContext);

  const [isTopUpWalletModalOpen, setIsTopWalletModalOpen] = useState(false);

  if (isBalanceLoading) {
    return (
      <SSettingsWalletContainer>
        <Lottie
          width={64}
          height={64}
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingAnimation,
          }}
        />
      </SSettingsWalletContainer>
    );
  }

  if (!walletBalance || walletBalance.usdCents === 0) {
    return (
      <SSettingsWalletContainer>
        <SIconContainer>
          <InlineSvg
            svg={WalletIcon}
            fill={theme.colorsThemed.text.primary}
            width='24px'
            height='24px'
          />
        </SIconContainer>
        <SBalanceText variant={2} weight={600}>
          {t('Settings.sections.wallet.balance')}
        </SBalanceText>
        <Headline variant={4}>$0.00</Headline>
        <SCaptionText variant={2} weight={600}>
          {t('Settings.sections.wallet.caption')}
        </SCaptionText>
        <Button
          view='primaryGrad'
          onClick={() => setIsTopWalletModalOpen(true)}
        >
          {t('Settings.sections.wallet.button.topUp')}
        </Button>
        <TopUpWalletModal
          zIndex={12}
          isOpen={isTopUpWalletModalOpen}
          onClose={() => setIsTopWalletModalOpen(false)}
        />
      </SSettingsWalletContainer>
    );
  }

  return (
    <SSettingsWalletContainer>
      <SText variant={2}>{t('Settings.sections.wallet.balance')}</SText>
      <SActionDiv>
        <Headline variant={4}>
          ${formatNumber(walletBalance?.usdCents / 100 ?? 0, false)}
        </Headline>
        <Button
          view='primaryGrad'
          onClick={() => setIsTopWalletModalOpen(true)}
        >
          {t('Settings.sections.wallet.button.topUp')}
        </Button>
      </SActionDiv>
      <TopUpWalletModal
        zIndex={12}
        isOpen={isTopUpWalletModalOpen}
        onClose={() => setIsTopWalletModalOpen(false)}
      />
    </SSettingsWalletContainer>
  );
};

export default SettingsWallet;

const SSettingsWalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  max-height: 260px;
  padding: 16px;

  border-radius: ${({ theme }) => theme.borderRadius.large};
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    max-height: 296px;
    padding: 24px;
  }

  ${({ theme }) => theme.media.desktop} {
    max-height: 300px;
  }
`;

const SIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 50%;
  height: 48px;
  width: 48px;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};
  padding: 12px;

  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;
  }
`;

const SBalanceText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin-bottom: 2px;
`;

const SCaptionText = styled(Text)`
  text-align: center;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  margin-top: 8px;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;
  }
`;

const SText = styled(Text)`
  text-align: left;
  width: 100%;
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SActionDiv = styled.div`
  width: 100%;

  display: flex;
  text-align: center;
  justify-content: space-between;

  h4 {
    line-height: 48px;
  }
`;
