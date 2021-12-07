import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import InlineSvg from '../../atoms/InlineSVG';

// Icons
import WalletIcon from '../../../public/images/svg/icons/outlined/Wallet.svg';
import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';

interface ISettingsWallet {
  balance: number;
}

const SettingsWallet: React.FunctionComponent<ISettingsWallet> = ({
  balance,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('profile');

  if (balance === 0) {
    return (
      <SSettingsWalletContainer>
        <SIconConatainer>
          <InlineSvg
            svg={WalletIcon}
            fill={theme.colorsThemed.text.primary}
            width="24px"
            height="24px"
          />
        </SIconConatainer>
        <SBalanceText
          variant={2}
          weight={600}
        >
          { t('Settings.sections.Wallet.empty.balance') }
        </SBalanceText>
        <Headline
          variant={4}
        >
          $0.00
        </Headline>
        <SCaptionText
          variant={2}
          weight={600}
        >
          { t('Settings.sections.Wallet.empty.caption') }
        </SCaptionText>
        <Button
          view="primaryGrad"
        >
          { t('Settings.sections.Wallet.empty.topUpBtn') }
        </Button>
      </SSettingsWalletContainer>
    );
  }

  return (
    <SSettingsWalletContainer>
      I will be the wallet
    </SSettingsWalletContainer>
  );
};

export default SettingsWallet;

const SSettingsWalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  height: 260px;
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
    height: 296px;
    padding: 24px;
  }

  ${({ theme }) => theme.media.desktop} {
    height: 300px;
  }
`;

const SIconConatainer = styled.div`
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
