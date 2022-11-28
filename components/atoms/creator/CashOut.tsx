/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/jsx-no-target-blank */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { google, newnewapi } from 'newnew-api';
import styled, { css } from 'styled-components';
import moment from 'moment';
import InlineSVG from '../InlineSVG';
import Button from '../Button';
import Text from '../Text';
import { formatNumber } from '../../../utils/format';

import cashOutIcon from '../../../public/images/svg/icons/filled/CashOut.svg';
import stripeTitleIcon from '../../../public/images/svg/icons/filled/StripeTitle.svg';
import { getExpressDashboardLoginLink } from '../../../api/endpoints/stripe';
import { useAppSelector } from '../../../redux-store/store';

interface ICashOut {
  nextCashOutAmount: newnewapi.IMoneyAmount;
  nextCashOutDate: google.protobuf.ITimestamp | null | undefined;
}

const CashOut: React.FC<ICashOut> = ({
  nextCashOutAmount,
  nextCashOutDate,
}) => {
  const { t } = useTranslation('page-Creator');

  const [stripeLink, setStripeLink] = useState<
    newnewapi.GetExpressDashboardLoginLinkResponse | undefined
  >();

  const [isLoading, setIsLoading] = useState<boolean | null>(null);

  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const validateCash = useCallback(
    () =>
      nextCashOutAmount &&
      nextCashOutAmount.usdCents !== undefined &&
      nextCashOutAmount.usdCents !== null &&
      nextCashOutAmount.usdCents > 0,
    [nextCashOutAmount]
  );

  useEffect(() => {
    async function getStripeLink() {
      try {
        setIsLoading(true);
        const payload = new newnewapi.EmptyRequest();
        const res = await getExpressDashboardLoginLink(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        setStripeLink(res.data);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(null);
      }
    }

    if (isLoading === null && validateCash()) {
      getStripeLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, nextCashOutAmount.usdCents]);
  return (
    <SCashOutContainer hasNextCashOutAmount={validateCash()}>
      <SCashOutTopBlock>
        <SInlineSVG
          hide={validateCash() && isMobile}
          svg={cashOutIcon}
          width='48px'
          height='48px'
        />
        <SDescriptionWrapper>
          {nextCashOutAmount && nextCashOutAmount.usdCents ? (
            <SStripeBlock>
              <SStripeBlockText variant={2} weight={600}>
                {`${t('dashboard.earnings.cashOut.amount')} $${formatNumber(
                  nextCashOutAmount?.usdCents / 100 ?? 0,
                  false
                )}`}
              </SStripeBlockText>
              <SStripeBlockText variant={2} weight={600}>
                {t('dashboard.earnings.cashOut.amountSecondLine')}
              </SStripeBlockText>
              <SButtons>
                {stripeLink?.link && (
                  <a href={stripeLink.link} target='_blank'>
                    <SButton view='common'>
                      {t('dashboard.earnings.cashOut.stripeButton')}
                    </SButton>
                  </a>
                )}
                <a href='https://creatorpayouts.newnew.co/' target='_blank'>
                  <SButtonLearnMore>
                    {t('dashboard.earnings.cashOut.submit')}
                  </SButtonLearnMore>
                </a>
              </SButtons>
            </SStripeBlock>
          ) : (
            <SDescription variant={3} weight={600}>
              {t('dashboard.earnings.cashOut.noPayouts')}
            </SDescription>
          )}
          {nextCashOutDate && (
            <SDescription variant={3} weight={600}>
              {t('dashboard.earnings.cashOut.date', {
                date: moment((nextCashOutDate.seconds as number) * 1000).format(
                  'MMM DD YYYY'
                ),
              })}
            </SDescription>
          )}
        </SDescriptionWrapper>
      </SCashOutTopBlock>
      {!stripeLink ? (
        <a href='https://creatorpayouts.newnew.co/' target='_blank'>
          <SButton view='common'>
            {t('dashboard.earnings.cashOut.submit')}
          </SButton>
        </a>
      ) : (
        <SInlineSVG
          isStripe={stripeLink !== undefined}
          svg={stripeTitleIcon}
          width='106px'
          height='44px'
        />
      )}
    </SCashOutContainer>
  );
};

export default CashOut;

interface ISCashOutContainer {
  hasNextCashOutAmount?: boolean;
}

const SCashOutContainer = styled.div<ISCashOutContainer>`
  padding: 16px;
  display: flex;
  background: ${(props) =>
    !props.hasNextCashOutAmount
      ? props.theme.colorsThemed.accent.blue
      : '#6060F6'};
  border-radius: ${(props) => (!props.hasNextCashOutAmount ? '16px' : '24px')};
  flex-direction: column;
  ${(props) =>
    props.hasNextCashOutAmount &&
    css`
      flex-direction: column-reverse;
      align-items: center;
    `}

  ${(props) => props.theme.media.tablet} {
    align-items: center;
    flex-direction: row !important;
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
    /* display: inline; */
  }
`;

const SDescription = styled(Text)`
  color: rgba(255, 255, 255, 0.7);
  /* margin-top: 8px; */
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;
  margin-top: 16px;

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    margin-top: unset;
    margin-left: 16px;
  }
`;

interface ISInlineSVG {
  hide?: boolean;
  isStripe?: boolean;
}

const SInlineSVG = styled(InlineSVG)<ISInlineSVG>`
  min-width: 48px;
  min-height: 48px;
  margin-right: ${(props) => (!props.isStripe ? '8px' : '0')};
  ${(props) =>
    props.hide &&
    css`
      display: none;
    `}

  ${(props) => props.theme.media.tablet} {
    margin-right: 8px;
  }
`;

const SStripeBlock = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  ${(props) => props.theme.media.tablet} {
    text-align: left;
    padding-left: 20px;
  }
`;

const SStripeBlockText = styled(Text)`
  color: #ffffff;
`;

const SButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  button {
    margin: 15px 0 0;
  }

  ${(props) => props.theme.media.tablet} {
    flex-direction: row;
    padding-top: 8px;
    button {
      margin: 0 10px 0 0;
    }
  }
`;

const SButtonLearnMore = styled(Button)`
  background-color: rgba(255, 255, 255, 0.06);
`;
