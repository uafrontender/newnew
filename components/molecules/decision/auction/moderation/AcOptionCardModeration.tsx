/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, {
  useMemo,
} from 'react';
import styled, { css } from 'styled-components';

import { useAppSelector } from '../../../../../redux-store/store';
import { TAcOptionWithHighestField } from '../../../../organisms/decision/PostViewAC';

import Text from '../../../../atoms/Text';

import { formatNumber } from '../../../../../utils/format';

interface IAcOptionCardModeration {
  option: TAcOptionWithHighestField;
  index: number;
  handleOpenOptionBidHistory: () => void;
}

const AcOptionCardModeration: React.FunctionComponent<IAcOptionCardModeration> = ({
  option,
  index,
  handleOpenOptionBidHistory,
}) => {
  const router = useRouter();
  const { t } = useTranslation('decision');
  const user = useAppSelector((state) => state.user);

  const highest = useMemo(() => option.isHighest, [option.isHighest]);
  const myVote = useMemo(() => option.isSupportedByMe, [option.isSupportedByMe]);
  const myBid = useMemo(() => option.creator?.uuid === user.userData?.userUuid, [
    option.creator?.uuid,
    user.userData?.userUuid,
  ]);
  const bgVariant = highest ? 'yellow' : (
    myBid ? 'blue' : myVote ? 'green' : undefined);

  // Redirect to user's page
  const handleRedirectToUser = () => router.push(`/u/${option.creator?.username}`);

  return (
    <motion.div
      key={index}
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '16px',
      }}
    >
      <SContainer>
        <SBidDetails
          bgVariant={bgVariant}
          onClick={() => {
            handleOpenOptionBidHistory();
          }}
        >
          <SBidInfo>
            {highest
              ? (
                <STag>{t('AcPost.OptionsTab.tags.highest')}</STag>
              ) : null}
            {myVote
              && !myBid
              ? (
                <STag>{t('AcPost.OptionsTab.tags.my_vote')}</STag>
              ) : null}
            {myBid
              ? (
                <STag>{t('AcPost.OptionsTab.tags.my_bid')}</STag>
              ) : null}
            {/* Comment out for now */}
            {/* {option.creator.isVIP
              ? (
                <STag>{t('AcPost.OptionsTab.tags.vip')}</STag>
              ) : null} */}
            <SAvatar
              onClick={(e) => {
                e.stopPropagation();
                handleRedirectToUser();
              }}
              src={option?.creator?.avatarUrl!! as string}
              alt={option?.creator?.username!!}
              draggable={false}
            />
            <SUsername
              isColored={bgVariant !== undefined}
              onClick={(e) => {
                e.stopPropagation();
                handleRedirectToUser();
              }}
            >
              { option.creator?.uuid === user.userData?.userUuid
                ? t('me') : option?.creator?.username }
            </SUsername>
            <SBidTitle
              variant={3}
            >
              { option.title }
            </SBidTitle>
          </SBidInfo>
          <SAmount>
            {option.totalAmount?.usdCents
              ? (
                `$${formatNumber((option?.totalAmount?.usdCents / 100) ?? 0, true)}`
              ) : '$0'}
          </SAmount>
        </SBidDetails>
      </SContainer>
    </motion.div>
  );
};

AcOptionCardModeration.defaultProps = {
};

export default AcOptionCardModeration;

const SContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: calc(100% - 16px);

  ${({ theme }) => theme.media.tablet} {
    /* width: 80%; */
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
  }
`;

const SBidDetails = styled.div<{
  bgVariant?: 'yellow' | 'green' | 'blue';
}>`
  position: relative;

  display: grid;
  grid-template-areas:
    'info amount'
    'doubleVote doubleVote'
  ;
  grid-template-columns: 7fr 1fr;
  gap: 16px;

  width: 100%;

  padding: 14px;
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ bgVariant }) => (
    bgVariant
      ? css`
        background: ${({ theme }) => theme.gradients.decisionOption[bgVariant]};
      ` : null
  )};

  &:hover {
    cursor: pointer;
  }
`;

const SBidInfo = styled.div`
  grid-area: info;

  /* display: flex; */
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;


  vertical-align: middle;
  line-height: 24px;
`;

const STag = styled.span`
  background-color: ${({ theme }) => theme.colorsThemed.text.primary};
  border-radius: 50px;
  padding: 6px;

  font-weight: bold;
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme }) => theme.colorsThemed.background.primary};

  margin-right: 8px;
`;

const SAvatar = styled.img`
  position: relative;
  top: 7.5px;

  display: inline;
  width: 24px;
  height: 24px;
  border-radius: 50%;

  margin-right: 8px;

  cursor: pointer;
`;

const SUsername = styled.div<{
  isColored?: boolean;
}>`
  display: inline;
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme, isColored }) => (isColored ? 'rgba(255, 255, 255, 0.8)' : theme.colorsThemed.text.secondary)};
  margin-right: 8px;

  transition: 0.2s linear;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SBidTitle = styled(Text)`
  display: inline;
  line-break: loose;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;

const SAmount = styled.div`
  grid-area: amount;
  align-self: center;
  justify-self: flex-end;


  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;
