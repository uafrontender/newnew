/* eslint-disable no-nested-ternary */
import { google, newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { getRewards } from '../../api/endpoints/reward';
import assets from '../../constants/assets';
import { formatNumber } from '../../utils/format';

interface RewardListI {}

export const RewardList: React.FC<RewardListI> = () => {
  const { t } = useTranslation('common');
  // TODO: remove test data
  const [receivedRewards, setReceivedRewards] = useState<newnewapi.Reward[]>([
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.SIGN_UP,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
      receivedAt: new google.protobuf.Timestamp({
        seconds: Date.now(),
      }),
    }),
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.BID,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
      receivedAt: new google.protobuf.Timestamp({
        seconds: Date.now(),
      }),
    }),
  ]);

  // TODO: add loading state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [receivedRewardsLoading, setReceivedRewardsLoading] = useState(false);
  // TODO: remove test data
  const [availableRewards, setAvailableRewards] = useState<newnewapi.Reward[]>([
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.VOTE,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
    }),
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.BACK,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
    }),
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.SUBSCRIBE,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
    }),
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.SUBSCRIBE_X_CREATORS_LEVEL_1,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
      extra: { amount: 2 },
    }),
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.BID_SAME_CREATOR_X_TIMES_LEVEL_1,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
      extra: { amount: 2 },
    }),
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.VOTE_SAME_CREATOR_X_TIMES_LEVEL_1,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
      extra: { amount: 2 },
    }),
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.BACK_SAME_CREATOR_X_TIMES_LEVEL_1,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
      extra: { amount: 2 },
    }),
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.BID_IN_A_WEEK_X_TIMES_LEVEL_1,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
      extra: { amount: 2 },
    }),
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.VOTE_IN_A_WEEK_X_TIMES_LEVEL_1,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
      extra: { amount: 2 },
    }),
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.BACK_IN_A_WEEK_X_TIMES_LEVEL_1,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
      extra: { amount: 2 },
    }),
    new newnewapi.Reward({
      type: newnewapi.Reward.RewardType.INVITE_X_FRIENDS_LEVEL_1,
      amount: new newnewapi.MoneyAmount({ usdCents: 500 }),
      extra: { amount: 3 },
    }),
  ]);

  // TODO: add loading state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [availableRewardsLoading, setAvailableRewardsLoading] = useState(false);

  const fetchReceivedRewards = useCallback(async () => {
    try {
      setReceivedRewardsLoading(true);
      const receivedRewardsPayload = new newnewapi.GetRewardsRequest({
        filter: newnewapi.GetRewardsRequest.Filter.RECEIVED,
        paging: null,
      });

      const res = await getRewards(receivedRewardsPayload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      setReceivedRewards(res.data.rewards as newnewapi.Reward[]);

      // TODO: use pagination
      /* res.data.paging?.total
        ? setReceivedRewardsTotal(res.data.paging?.total)
        : setReceivedRewardsTotal(0); */

      setReceivedRewardsLoading(false);
    } catch (err) {
      console.error(err);
      setReceivedRewardsLoading(false);
    }
  }, []);

  const fetchAvailableRewards = useCallback(async () => {
    try {
      setAvailableRewardsLoading(true);
      const availableRewardsPayload = new newnewapi.GetRewardsRequest({
        filter: newnewapi.GetRewardsRequest.Filter.AVAILABLE,
        paging: null,
      });

      const res = await getRewards(availableRewardsPayload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      setAvailableRewards(res.data.rewards as newnewapi.Reward[]);

      // TODO: use pagination
      /* res.data.paging?.total
        ? setAvailableRewardsTotal(res.data.paging?.total)
        : setAvailableRewardsTotal(0); */

      setAvailableRewardsLoading(false);
    } catch (err) {
      console.error(err);
      setAvailableRewardsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceivedRewards();
    fetchAvailableRewards();
  }, [fetchReceivedRewards, fetchAvailableRewards]);

  return (
    <RewardsContainer>
      {receivedRewards.map((reward) => (
        <RewardCard key={reward.type} received>
          <RewardImage>
            <img src={assets.decision.gold} alt='received reward' />
          </RewardImage>
          <RewardDescription received>
            {t(`rewards.receivedItemDescription.${reward.type}`, reward.extra)}
          </RewardDescription>
          <RewardAmount received>
            <RewardAmountText>
              {t('rewards.earned', {
                value: formatNumber(reward.amount!.usdCents! / 100),
              })}
            </RewardAmountText>
          </RewardAmount>
        </RewardCard>
      ))}

      {availableRewards.map((reward) => (
        <RewardCard key={reward.type}>
          <RewardImage>
            <img src={assets.decision.votes} alt='available reward' />
          </RewardImage>
          <RewardDescription>
            {t(`rewards.availableItemDescription.${reward.type}`, reward.extra)}
          </RewardDescription>
          <RewardAmount>
            <RewardAmountText>
              {t('rewards.earn', {
                value: formatNumber(reward.amount!.usdCents! / 100),
              })}
            </RewardAmountText>
          </RewardAmount>
        </RewardCard>
      ))}

      {/* Placeholders for flex-wrap content alignment */}
      <RewardCard holder />
      <RewardCard holder />
      <RewardCard holder />
      <RewardCard holder />
    </RewardsContainer>
  );
};

export default RewardList;

const RewardsContainer = styled.div`
  margin-top: 28px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const RewardCard = styled.div<{ received?: boolean; holder?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 16px;
  padding: ${(props) => (props.holder ? 0 : '24px 16px;')};
  width: 146px;
  background: ${(props) =>
    props.received ? props.theme.gradients.blueReversedDiagonal : undefined};
  border: ${(props) =>
    props.received
      ? undefined
      : `1px solid ${props.theme.colorsThemed.background.quinary}`};
  box-shadow: ${(props) =>
    props.received
      ? `0px 4px 24px ${
          props.theme.name === 'light'
            ? 'rgba(0, 0, 0, 0.25)'
            : 'rgba(255, 255, 255, 0.25)'
        };`
      : undefined};

  opacity: ${(props) => (props.holder ? 0 : 1)};
`;

const RewardImage = styled.div`
  width: 56px;
  height: 56px;
  margin-bottom: 5px;

  img {
    width: 100%;
    object-fit: contain;
  }
`;

const RewardDescription = styled.div<{ received?: boolean }>`
  flex-grow: 1;
  color: ${(props) =>
    props.received
      ? props.theme.colorsThemed.button.color.primary
      : props.theme.colorsThemed.text.secondary};
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 16px;
`;

const RewardAmount = styled.div<{ received?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 34px;
  width: 115px;
  border-radius: 12px;
  background: ${(props) =>
    props.received
      ? 'rgba(40, 41, 51, 0.25)'
      : props.theme.colorsThemed.background.quinary};
  color: ${(props) =>
    props.received
      ? props.theme.colorsThemed.button.color.primary
      : props.theme.colorsThemed.text.primary};
  white-space: nowrap;
  overflow: hidden;
`;

const RewardAmountText = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;
