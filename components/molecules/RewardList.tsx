/* eslint-disable no-nested-ternary */
import { useTranslation } from 'next-i18next';
import React from 'react';
import styled from 'styled-components';
import { formatNumber } from '../../utils/format';

export interface Reward {
  received: boolean;
  imageUrl: string;
  text: string;
  amount: number;
}

interface RewardListI {
  rewards: Reward[];
}

export const RewardList: React.FC<RewardListI> = ({ rewards }) => {
  const { t } = useTranslation('page-Rewards');

  return (
    <RewardsContainer>
      {rewards.map((reward) => (
        <RewardCard received={reward.received}>
          <RewardImage>
            <img src={reward.imageUrl} alt='' />
          </RewardImage>
          <RewardTitle received={reward.received}>{reward.text}</RewardTitle>
          <RewardAmount received={reward.received}>
            <RewardAmountText>
              {reward.received
                ? t('rewards.earned', { value: formatNumber(reward.amount) })
                : t('rewards.earn', { value: formatNumber(reward.amount) })}
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

const RewardTitle = styled.div<{ received?: boolean }>`
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
