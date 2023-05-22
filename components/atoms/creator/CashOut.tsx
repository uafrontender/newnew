import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { google, newnewapi } from 'newnew-api';
import styled from 'styled-components';
import moment from 'moment';
import { useRouter } from 'next/dist/client/router';

import InlineSVG from '../InlineSVG';
import Button from '../Button';
import Text from '../Text';
import { formatNumber } from '../../../utils/format';

import cashOutIcon from '../../../public/images/svg/icons/filled/CashOut.svg';
import stripeTitleIcon from '../../../public/images/svg/icons/filled/StripeTitle.svg';
import getExpressDashboardLoginLink from '../../../api/endpoints/stripe';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';
import NoCashOut from './NoCashOut';

interface ICashOut {
  nextCashOutAmount: newnewapi.IMoneyAmount;
  nextCashOutDate: google.protobuf.ITimestamp | null | undefined;
}

const CashOut: React.FC<ICashOut> = ({
  nextCashOutAmount,
  nextCashOutDate,
}) => {
  const { t } = useTranslation('page-Creator');
  const { locale } = useRouter();

  const [stripeLink, setStripeLink] = useState<
    newnewapi.GetExpressDashboardLoginLinkResponse | undefined
  >();

  const [isLoading, setIsLoading] = useState<boolean | null>(null);

  const { resizeMode } = useAppState();

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

        if (!res.data || res.error) {
          throw new Error(res.error?.message ?? 'Request failed');
        }

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

  if (!nextCashOutAmount?.usdCents || !validateCash()) {
    return <NoCashOut />;
  }

  return (
    <SCashOutContainer>
      <SCashOutBlockLeft>
        <SStripeBlockTop>
          <SInlineSVG svg={cashOutIcon} width='48px' height='48px' />

          {isMobile ? (
            <SStripeBlockText variant={2} weight={600}>
              {`${t('dashboard.earnings.cashOut.nextPayout', {
                amount: formatNumber(
                  (nextCashOutAmount?.usdCents ?? 0) / 100,
                  false
                ),
                date: moment((nextCashOutDate?.seconds as number) * 1000)
                  .locale(locale || 'en-US')
                  .format('MMM DD YYYY'),
              })} `}
            </SStripeBlockText>
          ) : (
            <div>
              <SStripeBlockText variant={2} weight={600}>
                {`${t('dashboard.earnings.cashOut.amount')} $${formatNumber(
                  (nextCashOutAmount?.usdCents ?? 0) / 100,
                  false
                )}`}
              </SStripeBlockText>
              <SStripeBlockText variant={2} weight={600}>
                {t('dashboard.earnings.cashOut.amountSecondLine')}
              </SStripeBlockText>
            </div>
          )}
        </SStripeBlockTop>

        <SButtons>
          {stripeLink?.link && (
            <a href={stripeLink.link} target='_blank' rel='noreferrer'>
              <SButton view='common'>
                {t('dashboard.earnings.cashOut.stripeButton')}
              </SButton>
            </a>
          )}
          <SButtonLearnMoreLink
            href='https://creatorpayouts.newnew.co/'
            target='_blank'
          >
            <SButtonLearnMore
              onClick={() => {
                Mixpanel.track('Navigation Item Clicked', {
                  _stage: 'Dashboard',
                  _button: 'Learn More',
                  _target: 'https://creatorpayouts.newnew.co/',
                });
              }}
            >
              {t('dashboard.earnings.cashOut.submit')}
            </SButtonLearnMore>
          </SButtonLearnMoreLink>
        </SButtons>

        {nextCashOutDate && (
          <SDescriptionAutoPayout variant={3} weight={600}>
            *
            {t('dashboard.earnings.cashOut.date', {
              date: moment((nextCashOutDate.seconds as number) * 1000)
                .locale(locale || 'en-US')
                .format('MMM DD YYYY'),
            })}
          </SDescriptionAutoPayout>
        )}
      </SCashOutBlockLeft>

      <SCashOutBlockRight>
        <SInlineSVG isStripe svg={stripeTitleIcon} width='96px' height='40px' />
      </SCashOutBlockRight>
    </SCashOutContainer>
  );
};

export default CashOut;

const SCashOutContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;

  background: #5a67ed;
  border-radius: 16px;

  ${(props) => props.theme.media.tablet} {
    padding: 32px 24px;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const SCashOutBlockLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${(props) => props.theme.media.tablet} {
    align-items: flex-start;
  }
`;

const SCashOutBlockRight = styled.div`
  display: none;

  ${(props) => props.theme.media.tablet} {
    display: flex;
    align-items: flex-end;
    height: 100%;
  }
`;

const SStripeBlockTop = styled.div`
  display: flex;
  align-items: center;
`;

const SDescriptionAutoPayout = styled(Text)`
  display: none;

  color: rgba(255, 255, 255, 0.7);
  margin-top: 12px;

  ${(props) => props.theme.media.tablet} {
    display: block;
  }
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
  isStripe?: boolean;
}

const SInlineSVG = styled(InlineSVG)<ISInlineSVG>`
  min-width: 48px;
  min-height: 48px;
  margin-right: ${(props) => (!props.isStripe ? '8px' : '0')};

  ${(props) => props.theme.media.tablet} {
    margin-right: ${(props) => (!props.isStripe ? '12px' : '0')};
  }
`;

const SStripeBlockText = styled(Text)`
  color: #ffffff;
`;

const SButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  a {
    width: 100%;
  }

  ${(props) => props.theme.media.tablet} {
    flex-direction: row;
    margin-top: 24px;

    button {
      margin: 0 16px 0 0;
    }
  }
`;

const SButtonLearnMoreLink = styled.a`
  display: none;

  ${(props) => props.theme.media.tablet} {
    display: block;
  }
`;

const SButtonLearnMore = styled(Button)`
  background-color: rgba(255, 255, 255, 0.06);
`;
