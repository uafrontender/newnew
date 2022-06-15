/* eslint-disable no-unsafe-optional-chaining */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import moment from 'moment';

import Text from '../../../atoms/Text';
import Caption from '../../../atoms/Caption';
import Headline from '../../../atoms/Headline';
import DropDown from '../../../atoms/creator/DropDown';
import CashOut from '../../../atoms/creator/CashOut';

import MakeDecision from '../../../atoms/creator/MakeDecision';
import { getMyEarnings } from '../../../../api/endpoints/payments';
import dateToTimestamp from '../../../../utils/dateToTimestamp';
import { formatNumber } from '../../../../utils/format';
import loadingAnimation from '../../../../public/animations/logo-loading-blue.json';
import Lottie from '../../../atoms/Lottie';

interface IFunctionProps {
  hasMyPosts: boolean;
  earnings: newnewapi.GetMyEarningsResponse | undefined;
}

export const Earnings: React.FC<IFunctionProps> = ({
  hasMyPosts,
  earnings,
}) => {
  const { t } = useTranslation('page-Creator');
  const [filter, setFilter] = useState('7_days');
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const [myEarnings, setMyEarnings] =
    useState<newnewapi.GetMyEarningsResponse | undefined>();
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    async function fetchMyEarnings() {
      try {
        setIsLoading(true);
        const payload = new newnewapi.GetMyEarningsRequest({
          beginDate: dateToTimestamp(
            moment()
              .subtract(
                filter.split('_')[0],
                filter.split('_')[1] as moment.unitOfTime.DurationConstructor
              )
              .startOf('day')
          ),
          endDate: dateToTimestamp(new Date()),
        });
        const res = await getMyEarnings(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        setMyEarnings(res.data);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(null);
      }
    }
    if (isLoading === null) {
      fetchMyEarnings();
    }
    if (initialLoad) {
      setMyEarnings(earnings);
      setInitialLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (myEarnings) {
      let sum = 0;
      if (myEarnings.auEarnings?.usdCents)
        sum += myEarnings.auEarnings?.usdCents;
      if (myEarnings.cfEarnings?.usdCents)
        sum += myEarnings.cfEarnings?.usdCents;
      if (myEarnings.mcEarnings?.usdCents)
        sum += myEarnings.mcEarnings?.usdCents;
      if (myEarnings.auEarnings?.usdCents)
        sum += myEarnings.auEarnings?.usdCents;
      setTotalEarnings(sum);
    }
  }, [myEarnings]);

  const collection = useMemo(
    () => [
      {
        id: 'ac',
      },
      {
        id: 'cf',
      },
      {
        id: 'mc',
      },
      {
        id: 'subscriptions',
      },
    ],
    []
  );
  const filterOptions = useMemo(
    () => [
      {
        id: '0_days',
        label: t('dashboard.earnings.filter.today'),
      },
      {
        id: '1_days',
        label: t('dashboard.earnings.filter.yesterday'),
      },
      {
        id: '7_days',
        label: t('dashboard.earnings.filter.last_7_days'),
      },
      {
        id: '30_days',
        label: t('dashboard.earnings.filter.last_30_days'),
      },
      {
        id: '90_days',
        label: t('dashboard.earnings.filter.last_90_days'),
      },
      {
        id: '12_months',
        label: t('dashboard.earnings.filter.last_12_months'),
      },
    ],
    [t]
  );

  const getValue = useCallback(
    (id: string) => {
      switch (id) {
        case 'ac':
          return myEarnings?.auEarnings?.usdCents
            ? `$${formatNumber(
                myEarnings.auEarnings.usdCents / 100 ?? 0,
                true
              )}`
            : '$0.00';

        case 'cf':
          return myEarnings?.cfEarnings?.usdCents
            ? `$${formatNumber(
                myEarnings.cfEarnings.usdCents / 100 ?? 0,
                true
              )}`
            : '$0.00';

        case 'mc':
          return myEarnings?.mcEarnings?.usdCents
            ? `$${formatNumber(
                myEarnings.mcEarnings.usdCents / 100 ?? 0,
                true
              )}`
            : '$0.00';

        case 'subscriptions':
          return myEarnings?.subsEarnings?.usdCents
            ? `$${formatNumber(
                myEarnings.subsEarnings.usdCents / 100 ?? 0,
                true
              )}`
            : '$0.00';

        default:
          return '$0.00';
      }
    },
    [myEarnings]
  );

  const renderListItem = useCallback(
    (item) => (
      <SListItem key={`list-item-earnings-${item.id}`}>
        <SListItemTitle variant={2} weight={700}>
          {t(`dashboard.earnings.list.${item.id}`)}
        </SListItemTitle>
        <SListItemValue variant={6}>{getValue(item.id)}</SListItemValue>
      </SListItem>
    ),
    [t, getValue]
  );

  const handleChangeFilter = (e: any) => {
    if (filter !== e) {
      setIsLoading(null);
      setFilter(e);
    }
  };

  const splitPeriod = () => {
    const arr = filter.split('_');
    if (arr[0] === '0') return t('dashboard.earnings.earnedToday');
    if (arr[0] === '1') return t('dashboard.earnings.earnedYesterday');
    return `${t('dashboard.earnings.earned')} ${arr[0]} ${arr[1]}`;
  };
  /* eslint-disable no-nested-ternary */
  return (
    <SContainer>
      <SHeaderLine>
        <STitle variant={6}>{t('dashboard.earnings.title')}</STitle>
        <STotalInsights>
          <DropDown
            value={filter}
            options={filterOptions}
            handleChange={handleChangeFilter}
          />
        </STotalInsights>
      </SHeaderLine>
      <STotalLine>
        <STotalTextWrapper>
          <STotal variant={4}>
            {totalEarnings
              ? `$${formatNumber(totalEarnings / 100 ?? 0, true)}`
              : '$0.00'}
          </STotal>
          <STotalText weight={600}>{splitPeriod()}</STotalText>
        </STotalTextWrapper>
        {/* <STotalInsights>
          <STotalInsightsText>
            {t(`dashboard.earnings.${isMobile ? 'insights' : 'insightsTablet'}`)}
          </STotalInsightsText>
          <STotalInsightsArrow
            svg={arrowRightIcon}
            fill={theme.colorsThemed.text.secondary}
            width="24px"
            height="24px"
          />
        </STotalInsights> */}
      </STotalLine>
      <SListHolder>{collection.map(renderListItem)}</SListHolder>
      {isLoading || initialLoad ? (
        <Lottie
          width={64}
          height={64}
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingAnimation,
          }}
        />
      ) : hasMyPosts && myEarnings?.nextCashoutAmount ? (
        <CashOut
          nextCashOutAmount={myEarnings?.nextCashoutAmount}
          nextCashOutDate={myEarnings?.nextCashoutDate}
        />
      ) : (
        <MakeDecision />
      )}
    </SContainer>
  );
};

export default Earnings;

const SContainer = styled.div`
  left: -16px;
  width: calc(100% + 32px);
  padding: 16px;
  display: flex;
  position: relative;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.primary
      : props.theme.colorsThemed.background.secondary};
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    left: unset;
    width: 100%;
    padding: 24px;
    border-radius: 24px;
  }
`;

const STitle = styled(Headline)``;

const SHeaderLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: row;
  justify-content: space-between;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 14px;
  }

  ${(props) => props.theme.media.laptop} {
    margin-bottom: 18px;
  }
`;

const STotalLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-direction: row;
  justify-content: space-between;

  ${(props) => props.theme.media.laptop} {
    margin-bottom: 14px;
  }
`;

const STotalTextWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: row;
`;

const STotal = styled(Headline)`
  margin-right: 8px;
`;

const STotalText = styled(Text)`
  font-size: 14px;
`;

const STotalInsights = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-direction: row;
`;

// const STotalInsightsText = styled.div`
//   color: ${(props) => props.theme.colorsThemed.text.secondary};
//   font-size: 14px;
//   line-height: 24px;
//   margin-right: 4px;
// `;

// const STotalInsightsArrow = styled(InlineSVG)`
//   min-width: 24px;
//   min-height: 24px;
// `;

const SListHolder = styled.div`
  left: -8px;
  width: calc(100% + 16px);
  display: flex;
  position: relative;
  flex-wrap: wrap;
  margin-bottom: 8px;
  flex-direction: row;

  ${(props) => props.theme.media.laptop} {
    margin-bottom: 14px;
  }
`;

const SListItem = styled.div`
  width: calc(50% - 16px);
  margin: 8px;
  padding: 16px;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;

  ${(props) => props.theme.media.tablet} {
    width: calc(25% - 12px);
    margin: 6px;
  }

  ${(props) => props.theme.media.laptop} {
    width: calc(25% - 20px);
    margin: 10px;
  }
`;

const SListItemTitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  margin-bottom: 16px;

  ${(props) => props.theme.media.tablet} {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-bottom: 12px;
  }
`;

const SListItemValue = styled(Headline)``;
