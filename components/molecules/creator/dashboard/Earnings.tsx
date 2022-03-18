import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Text from '../../../atoms/Text';
import Caption from '../../../atoms/Caption';
import Headline from '../../../atoms/Headline';
import DropDown from '../../../atoms/creator/DropDown';
import CashOut from '../../../atoms/creator/CashOut';

import FinishProfileSetup from '../../../atoms/creator/FinishProfileSetup';
import MakeDecision from '../../../atoms/creator/MakeDecision';

interface IFunctionProps {
  isTodosCompleted: boolean;
  hasMyPosts: boolean;
}

export const Earnings: React.FC<IFunctionProps> = ({ isTodosCompleted, hasMyPosts }) => {
  const { t } = useTranslation('creator');
  const [filter, setFilter] = useState('last_7_days');

  const collection = useMemo(
    () => [
      {
        id: 'ac',
        value: '$10.00',
      },
      {
        id: 'cf',
        value: '$25.00',
      },
      {
        id: 'mc',
        value: '$25.00',
      },
      {
        id: 'subscriptions',
        value: '$15.50',
      },
    ],
    []
  );
  const filterOptions = useMemo(
    () => [
      {
        id: 'today',
        label: t('dashboard.earnings.filter.today'),
      },
      {
        id: 'yesterday',
        label: t('dashboard.earnings.filter.yesterday'),
      },
      {
        id: 'last_7_days',
        label: t('dashboard.earnings.filter.last_7_days'),
      },
      {
        id: 'last_30_days',
        label: t('dashboard.earnings.filter.last_30_days'),
      },
      {
        id: 'last_90_days',
        label: t('dashboard.earnings.filter.last_90_days'),
      },
      {
        id: 'last_12_months',
        label: t('dashboard.earnings.filter.last_12_months'),
      },
    ],
    [t]
  );
  const renderListItem = useCallback(
    (item) => (
      <SListItem key={`list-item-earnings-${item.id}`}>
        <SListItemTitle variant={2} weight={700}>
          {t(`dashboard.earnings.list.${item.id}`)}
        </SListItemTitle>
        <SListItemValue variant={6}>{item.value}</SListItemValue>
      </SListItem>
    ),
    [t]
  );
  /* eslint-disable no-nested-ternary */
  return (
    <SContainer>
      <SHeaderLine>
        <STitle variant={6}>{t('dashboard.earnings.title')}</STitle>
        <STotalInsights>
          <DropDown value={filter} options={filterOptions} handleChange={setFilter} />
        </STotalInsights>
      </SHeaderLine>
      <STotalLine>
        <STotalTextWrapper>
          <STotal variant={4}>$50.50</STotal>
          <STotalText weight={600}>{t('dashboard.earnings.earned')}</STotalText>
        </STotalTextWrapper>
        {/* <STotalInsights>
          <STotalInsightsText>
            {t(`dashboard.earnings.${isMobile ? 'insights' : 'insights_tablet'}`)}
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
      {isTodosCompleted ? hasMyPosts ? <CashOut /> : <MakeDecision /> : <FinishProfileSetup />}
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

const STotalText = styled(Text)``;

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
