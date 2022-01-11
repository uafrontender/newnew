import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import React from 'react';
import styled, { css } from 'styled-components';
import Button from '../../../atoms/Button';

interface ICfMakeStandardPledgeCard {
  amount: newnewapi.IMoneyAmount;
  disabled?: boolean;
  isHighest?: boolean;
  grandsVipStatus?: boolean;
  handleOpenMakePledgeForm: () => void;
}

const CfMakeStandardPledgeCard: React.FunctionComponent<ICfMakeStandardPledgeCard> = ({
  amount,
  disabled,
  isHighest,
  grandsVipStatus,
  handleOpenMakePledgeForm,
}) => {
  const { t } = useTranslation('decision');

  return (
    <SStandardPledgeCard
      disabled={disabled}
    >
      <SCardInfo>
        {isHighest ? (
          <SAdditionalLabel>
            { t('Highest') }
          </SAdditionalLabel>
        ) : null}
        {grandsVipStatus ? (
          <SAdditionalLabel>
            { t('+ VIP Sub') }
          </SAdditionalLabel>
        ) : null}
        <SCardAmount>
          {`$${(amount!!.usdCents!! / 100).toFixed(0)}`}
        </SCardAmount>
      </SCardInfo>
      <SMakePledgeButton
        view="secondary"
        disabled={disabled}
        onClick={() => handleOpenMakePledgeForm()}
      >
        { t('Pledge') }
      </SMakePledgeButton>
    </SStandardPledgeCard>
  );
};

CfMakeStandardPledgeCard.defaultProps = {
  disabled: undefined,
  isHighest: undefined,
  grandsVipStatus: undefined,
};

export default CfMakeStandardPledgeCard;

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

const SAdditionalLabel = styled.div`
  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  opacity: 0.6;

  text-align: center;

  ${({ theme }) => theme.media.tablet} {

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
