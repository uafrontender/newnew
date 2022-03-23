import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import moment from 'moment';
import { useRouter } from 'next/router';
import { google, newnewapi } from 'newnew-api';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import Headline from '../../../atoms/Headline';
import DropDown from '../../../atoms/creator/DropDown';
import InlineSVG from '../../../atoms/InlineSVG';
import UserAvatar from '../../UserAvatar';

import { useAppSelector } from '../../../../redux-store/store';

import handIcon from '../../../../public/images/svg/icons/filled/Hand.svg';
import arrowUpIcon from '../../../../public/images/svg/icons/filled/ArrowUp.svg';
import arrowDownIcon from '../../../../public/images/svg/icons/filled/ArrowDown.svg';
import { getMySubscribers } from '../../../../api/endpoints/subscription';
import dateToTimestamp from '../../../../utils/dateToTimestamp';

export const SubscriptionStats = () => {
  const { t } = useTranslation('creator');
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const router = useRouter();
  const [filter, setFilter] = useState('7_days');
  const [mySubscribersIsLoading, setMySubscribersIsLoading] = useState(false);
  const [newSubs, setNewSubs] = useState<newnewapi.ISubscriber[]>([]);
  const [thisWeekSubs, setThisWeekSubs] = useState<newnewapi.ISubscriber[] | null>(null);
  const [pastWeekSubs, setPastWeekSubs] = useState<newnewapi.ISubscriber[] | null>(null);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  async function fetchMySubscribers(
    startDate: google.protobuf.ITimestamp,
    endDate: google.protobuf.ITimestamp,
    type: string
  ) {
    try {
      if (!mySubscribersIsLoading) {
        setMySubscribersIsLoading(true);
        const payload = new newnewapi.GetMySubscribersRequest({
          paging: null,
          order: 2,
          dateFilter: {
            startDate,
            endDate,
          },
        });
        const res = await getMySubscribers(payload);
        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        if (type === 'range') setNewSubs(res.data.subscribers as newnewapi.ISubscriber[]);
        if (type === 'past') setPastWeekSubs(res.data.subscribers as newnewapi.ISubscriber[]);
        if (type === 'this') setThisWeekSubs(res.data.subscribers as newnewapi.ISubscriber[]);
        setMySubscribersIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setMySubscribersIsLoading(false);
    }
  }

  useEffect(() => {
    if (!mySubscribersIsLoading) {
      if (!pastWeekSubs) {
        const startDate = dateToTimestamp(moment().startOf('week').subtract(7, 'days'));
        const endDate = dateToTimestamp(moment().endOf('week').subtract(7, 'days'));
        fetchMySubscribers(startDate, endDate, 'past');
      }
      if (!thisWeekSubs) {
        const startDate = dateToTimestamp(moment().startOf('week'));
        const endDate = dateToTimestamp(moment().endOf('week'));
        fetchMySubscribers(startDate, endDate, 'this');
      }

      const startDate = dateToTimestamp(
        moment()
          .subtract(filter.split('_')[0], filter.split('_')[1] as moment.unitOfTime.DurationConstructor)
          .startOf('day')
      );
      const endDate = dateToTimestamp(new Date());
      fetchMySubscribers(startDate, endDate, 'range');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, pastWeekSubs, thisWeekSubs]);

  useEffect(() => {
    if (pastWeekSubs && thisWeekSubs) {
      // console.log(pastWeekSubs, thisWeekSubs);
    }
  }, [pastWeekSubs, thisWeekSubs]);

  const handleChangeFilter = (e: any) => {
    if (filter !== e) {
      setFilter(e);
    }
  };

  const collection = useMemo(
    () => [
      {
        id: 'subscribers',
        value: '1,000',
        direction: 'up',
        score: 20,
      },
      {
        id: 'activeSubs',
        value: '530',
        direction: 'down',
        score: '5%',
      },
      {
        id: 'views',
        value: '2,345',
        direction: 'up',
        score: '5%',
      },
    ],
    []
  );
  // const newSubscribersCollection = useMemo(
  //   () => [
  //     {
  //       id: '1',
  //       name: 'Bugaboo👻😈',
  //       nickName: '@markwilson1995',
  //     },
  //     {
  //       id: '2',
  //       name: 'Bugaboo👻😈',
  //       nickName: '@markwilson1995',
  //     },
  //     {
  //       id: '3',
  //       name: 'SandyCandy',
  //       nickName: '@markwilson1995',
  //     },
  //     {
  //       id: '4',
  //       name: 'SandyCandy',
  //       nickName: '@markwilson1995',
  //     },
  //     {
  //       id: '5',
  //       name: 'CaptainCyborg',
  //       nickName: '@marcus0lson13',
  //     },
  //     {
  //       id: '6',
  //       name: 'CaptainCyborg',
  //       nickName: '@marcus0lson13',
  //     },
  //   ],
  //   []
  // );
  const filterOptions = useMemo(
    () => [
      {
        id: '0_days',
        label: t('dashboard.subscriptionStats.filter.today'),
      },
      {
        id: '1_days',
        label: t('dashboard.subscriptionStats.filter.yesterday'),
      },
      {
        id: '7_days',
        label: t('dashboard.subscriptionStats.filter.last_7_days'),
      },
      {
        id: '30_days',
        label: t('dashboard.subscriptionStats.filter.last_30_days'),
      },
      {
        id: '90_days',
        label: t('dashboard.subscriptionStats.filter.last_90_days'),
      },
      {
        id: '12_months',
        label: t('dashboard.subscriptionStats.filter.last_12_months'),
      },
    ],
    [t]
  );
  const renderListItem = useCallback(
    (item) => (
      <SListItem key={`list-item-subscriptionStats-${item.id}`}>
        <SListItemTitle variant={2} weight={700}>
          {t(`dashboard.subscriptionStats.list.${item.id}`)}
        </SListItemTitle>
        <SListItemCenterBlock>
          <SListItemValue variant={6}>{item.value}</SListItemValue>
          <SListItemDirection>
            <InlineSVG
              svg={item.direction === 'up' ? arrowUpIcon : arrowDownIcon}
              fill={item.direction === 'up' ? theme.colorsThemed.accent.success : theme.colorsThemed.accent.error}
              width="16px"
              height="16px"
            />
            <SListItemDirectionValue weight={600} variant={3} direction={item.direction}>
              {item.score}
            </SListItemDirectionValue>
          </SListItemDirection>
        </SListItemCenterBlock>
        {!isMobile && (
          <SListItemBottomDescription variant={3} weight={600}>
            {t('dashboard.subscriptionStats.prevWeek')}
          </SListItemBottomDescription>
        )}
      </SListItem>
    ),
    [t, isMobile, theme.colorsThemed.accent.error, theme.colorsThemed.accent.success]
  );
  const renderSubscriber = useCallback((item: newnewapi.ISubscriber, index) => {
    const handleUserClick = () => {};
    if (index < 6) {
      return (
        <SSubscribersItem key={`list-item-subscriptionStats-subscriber-${item.user?.uuid}`}>
          {item.user?.avatarUrl && (
            <SSubscribersItemAvatar withClick onClick={handleUserClick} avatarUrl={item.user?.avatarUrl} />
          )}
          <SSubscribersItemInfo>
            <SSubscribersItemName variant={3} weight={600}>
              {item.user?.nickname ? item.user?.nickname : item.user?.username}
            </SSubscribersItemName>
            <SSubscribersItemNick variant={2} weight={600}>
              {item.user?.username ? item.user?.username : item.user?.nickname}
            </SSubscribersItemNick>
          </SSubscribersItemInfo>
        </SSubscribersItem>
      );
    }
    return null;
  }, []);
  const handleSubmit = useCallback(() => {
    router.push('/creator/subscribers');
  }, [router]);

  return (
    <SContainer>
      <SHeaderLine>
        <STitle variant={6}>{t('dashboard.subscriptionStats.title')}</STitle>
        <STotalInsights>
          <DropDown value={filter} options={filterOptions} handleChange={handleChangeFilter} />
        </STotalInsights>
      </SHeaderLine>
      <SListHolder>{collection.map(renderListItem)}</SListHolder>
      <STotalLine>
        <STotalTextWrapper>
          <STotalText variant={2} weight={600}>
            {t('dashboard.subscriptionStats.newTitle')}
          </STotalText>
        </STotalTextWrapper>
      </STotalLine>
      <SSubscribersList>{newSubs.map(renderSubscriber)}</SSubscribersList>
      <SButtonSubmit view="secondary" onClick={handleSubmit}>
        {t('dashboard.subscriptionStats.seeAll')}
      </SButtonSubmit>
      <SBannerContainer>
        <SBannerTopBlock>
          <SInlineSVG svg={handIcon} width="24px" height="24px" />
          <SDescription variant={3} weight={600}>
            {t('dashboard.subscriptionStats.banner.description')}
          </SDescription>
        </SBannerTopBlock>
        <SButton view="primaryGrad" onClick={handleSubmit}>
          {t('dashboard.subscriptionStats.banner.submit')}
        </SButton>
      </SBannerContainer>
    </SContainer>
  );
};

export default SubscriptionStats;

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

const SBannerContainer = styled.div`
  padding: 16px;
  display: flex;
  margin-top: 16px;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const SBannerTopBlock = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  flex-direction: row;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: unset;
  }
`;

const SDescription = styled(Text)`
  margin-left: 12px;

  ${(props) => props.theme.media.tablet} {
    margin-right: 16px;
  }
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
  }
`;

const SButtonSubmit = styled(Button)`
  padding: 16px 20px;

  ${(props) => props.theme.media.tablet} {
    width: unset;
    margin: 0 auto;
    padding: 12px 24px;
    background: ${(props) =>
      props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.button.background.secondary};
  }
`;

const SInlineSVG = styled(InlineSVG)`
  margin: 12px;
  min-width: 24px;
  min-height: 24px;
`;

const SHeaderLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-direction: row;
  justify-content: space-between;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 10px;
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
    margin-bottom: 12px;
  }
`;

const STotalTextWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: row;
`;

const STotalText = styled(Text)``;

const STotalInsights = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const SListHolder = styled.div`
  gap: 16px;
  display: flex;
  position: relative;
  margin-bottom: 24px;
  flex-direction: row;

  ${(props) => props.theme.media.laptop} {
    gap: 24px;
  }
`;

const SListItem = styled.div`
  flex: 1;
  padding: 16px;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;
`;

const SListItemTitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  margin-bottom: 12px;
`;

const SListItemCenterBlock = styled.div`
  display: flex;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const SListItemValue = styled(Headline)`
  margin-bottom: 2px;
`;

const SListItemDirection = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

interface ISListItemDirectionValue {
  direction: 'up' | 'down';
}

const SListItemDirectionValue = styled(Text)<ISListItemDirectionValue>`
  color: ${(props) =>
    props.direction === 'up' ? props.theme.colorsThemed.accent.success : props.theme.colorsThemed.accent.error};
`;

const SListItemBottomDescription = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  margin-top: 4px;
`;

const SSubscribersList = styled.div`
  left: -8px;
  width: calc(100% + 16px);
  display: flex;
  position: relative;
  flex-wrap: wrap;
  margin-bottom: 16px;
  flex-direction: row;

  ${(props) => props.theme.media.laptop} {
    left: -12px;
    width: calc(100% + 24px);
  }
`;

const SSubscribersItem = styled.div`
  width: calc(50% - 16px);
  margin: 8px;
  display: flex;
  align-items: center;
  flex-direction: row;

  ${(props) => props.theme.media.tablet} {
    width: calc(33% - 16px);
  }

  ${(props) => props.theme.media.laptop} {
    left: -12px;
    width: calc(33% - 24px);
    margin: 12px;
  }
`;

const SSubscribersItemInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SSubscribersItemName = styled(Text)``;

const SSubscribersItemNick = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;

const SSubscribersItemAvatar = styled(UserAvatar)`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  margin-right: 12px;
`;
