/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import { useTranslation } from 'next-i18next';
import { google, newnewapi } from 'newnew-api';
import styled from 'styled-components';
import moment from 'moment';
import InlineSVG from '../InlineSVG';
import Button from '../Button';
import Text from '../Text';
import { formatNumber } from '../../../utils/format';

import cashOutIcon from '../../../public/images/svg/icons/filled/CashOut.svg';

interface ICashOut {
  nextCashoutAmount: newnewapi.IMoneyAmount;
  nextCashoutDate: google.protobuf.ITimestamp | null | undefined;
}

const CashOut: React.FC<ICashOut> = ({
  nextCashoutAmount,
  nextCashoutDate,
}) => {
  const { t } = useTranslation('creator');
  return (
    <SCashOutContainer>
      <SCashOutTopBlock>
        <SInlineSVG svg={cashOutIcon} width='48px' height='48px' />
        <SDescriptionWrapper>
          {nextCashoutAmount && nextCashoutAmount.usdCents ? (
            <>
              <SDescription variant={3} weight={600}>
                {t('dashboard.earnings.cashOut.amount')}
              </SDescription>
              <SAmount variant={3} weight={600}>
                {`$${formatNumber(
                  nextCashoutAmount?.usdCents / 100 ?? 0,
                  true
                )}`}
              </SAmount>
            </>
          ) : (
            <SDescription variant={3} weight={600}>
              {t('dashboard.earnings.cashOut.noPayouts')}
            </SDescription>
          )}
          {nextCashoutDate && (
            <SDescription variant={3} weight={600}>
              {t('dashboard.earnings.cashOut.date', {
                date: moment((nextCashoutDate.seconds as number) * 1000).format(
                  'MMM DD YYYY'
                ),
              })}
            </SDescription>
          )}
        </SDescriptionWrapper>
      </SCashOutTopBlock>
      <a href='https://creatorpayouts.newnew.co/' target='_blank'>
        <SButton view='primaryGrad'>
          {t('dashboard.earnings.cashOut.submit')}
        </SButton>
      </a>
    </SCashOutContainer>
  );
};

export default CashOut;

const SCashOutContainer = styled.div`
  padding: 16px;
  display: flex;
  background: ${(props) => props.theme.colorsThemed.accent.blue};
  border-radius: 16px;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const SCashOutTopBlock = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const SDescriptionWrapper = styled.div`
  div {
    display: inline;
  }
`;

const SAmount = styled(Text)`
  color: ${(props) => props.theme.colors.white};
  margin-left: 4px;
`;

const SDescription = styled(Text)`
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
`;

const SButton = styled(Button)`
  width: 100%;
  color: ${(props) => props.theme.colors.black};
  padding: 16px 20px;
  margin-top: 16px;
  background: ${(props) => props.theme.colors.white};

  &:after {
    display: none;
  }

  &:focus:enabled,
  &:hover:enabled {
    background: ${(props) => props.theme.colors.white};
  }

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    margin-top: unset;
    margin-left: 16px;
  }
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 48px;
  min-height: 48px;
  margin-right: 8px;
`;
