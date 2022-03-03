import React from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Headline from '../../../atoms/Headline';

import CoinIcon from '../../../../public/images/decision/coin-mock.png';

interface ICfMakeStandardPledgeCard {
  amount: newnewapi.IMoneyAmount;
  grandsVipStatus?: boolean;
  handleOpenMakePledgeForm: () => void;
}

const CfMakeStandardPledgeCard: React.FunctionComponent<ICfMakeStandardPledgeCard> = ({
  amount,
  grandsVipStatus,
  handleOpenMakePledgeForm,
}) => {
  const { t } = useTranslation('decision');

  return (
    <SStandardPledgeCard
      onClick={() => handleOpenMakePledgeForm()}
    >
      {grandsVipStatus ? (
        <SAdditionalLabel>
          { t('CfPost.BackersTab.free_sub') }
        </SAdditionalLabel>
      ) : (
        <SCoinImg
          src={CoinIcon.src}
        />
      )}
      <SCardInfo>
        <SCardAmount
          variant={6}
        >
          {`$${(amount!!.usdCents!! / 100).toFixed(0)}`}
        </SCardAmount>
      </SCardInfo>
    </SStandardPledgeCard>
  );
};

CfMakeStandardPledgeCard.defaultProps = {
  grandsVipStatus: undefined,
};

export default CfMakeStandardPledgeCard;

const SStandardPledgeCard = styled.button`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;

  cursor: pointer;
  transition: 0.2s linear;

  border: transparent;

  height: 108px;
  width: 96px;

  margin: 0px 6px;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 8px;

  &:hover, &:active {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
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
  font-size: 10px;
  line-height: 24px;
  color: #2C2C33;
  text-align: center;

  background-color: ${({ theme }) => theme.colorsThemed.accent.yellow};

  height: 24px;
  padding-left: 8px;
  padding-right: 8px;

  border-radius: 50px;
`;

const SCardAmount = styled(Headline)`
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

const SCoinImg = styled.img`
  height: 24px;
`;
