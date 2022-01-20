import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';
import Button from '../../../atoms/Button';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';

interface ICfMakeCustomPledgeCard {
  disabled?: boolean;
  isSelected?: boolean;
  customAmount: string;
  handleSetCustomAmount: (newValue: string) => void;
  handleOpenMakePledgeForm: () => void;
}

const CfMakeCustomPledgeCard: React.FunctionComponent<ICfMakeCustomPledgeCard> = ({
  disabled,
  isSelected,
  customAmount,
  handleSetCustomAmount,
  handleOpenMakePledgeForm,
}) => {
  const { t } = useTranslation('decision');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (disabled || !isSelected) {
      handleSetCustomAmount('');
      setIsActive(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  return (
    <SStandardPledgeCard
      disabled={disabled}
    >
      <SCardInfo>
        {isActive ? (
          <BidAmountTextInput
            value={customAmount.toString()}
            minAmount={1}
            inputAlign="center"
            style={{
              minWidth: '12px',
              maxWidth: '48px',
            }}
            onChange={handleSetCustomAmount}
          />
        ) : (
          <SCardAmount>
            { t('Custom') }
          </SCardAmount>
        )}
      </SCardInfo>
      <SMakePledgeButton
        view="secondary"
        disabled={disabled}
        onClick={() => {
          handleOpenMakePledgeForm();
          setIsActive(true);
        }}
      >
        { t('Pledge') }
      </SMakePledgeButton>
    </SStandardPledgeCard>
  );
};

CfMakeCustomPledgeCard.defaultProps = {
  disabled: undefined,
  isSelected: undefined,
};

export default CfMakeCustomPledgeCard;

const SStandardPledgeCard = styled.div<{
  disabled?: boolean;
  isHighest?: boolean;
  grandsVipStatus?: boolean;
}>`
  display: flex;
  gap: 8px;

  background-color: transparent;

  ${({ disabled }) => (disabled
    ? (
      css`
        opacity: 0.5;
      `
    ) : null)}

  ${({ theme }) => theme.media.tablet} {
    flex-direction: column;
    justify-content: flex-end;
    align-items: stretch;
    height: 108px;
    background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    padding: 8px;
  }
`;

const SCardInfo = styled.div`
  width: 80%;
  background: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.tablet} {
    width: auto;

    padding: 0px 12px;
    color: ${({ theme }) => theme.colorsThemed.text.secondary};
    background: transparent;
  }
`;

const SCardAmount = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  text-align: center;
  vertical-align: bottom;

  ${({ theme }) => theme.media.tablet} {
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
  }
`;

const SMakePledgeButton = styled(Button)<{
  highlighted?: boolean;
}>`
  width: auto;
  background: ${({ highlighted, theme }) => (highlighted ? theme.colorsThemed.background.primary : theme.colorsThemed.background.secondary)};

  ${({ theme }) => theme.media.tablet} {
    width: auto;
    min-height: 40px;

    padding: 8px 16px;

    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover:enabled, &:focus:enabled {
      background: ${({ highlighted, theme }) => (highlighted ? theme.colorsThemed.background.primary : 'transparent')};
      color: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
`;
