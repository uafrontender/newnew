/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useMemo } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { formatNumber } from '../../../utils/format';
import { TPostType } from '../../../utils/switchPostType';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';

import Text from '../../atoms/Text';
import PostFailedBox from './PostFailedBox';
import Headline from '../../atoms/Headline';

import assets from '../../../constants/assets';
import PostTitleContent from '../../atoms/PostTitleContent';
import { Mixpanel } from '../../../utils/mixpanel';

const DARK_IMAGES = {
  ac: assets.creation.darkAcAnimated,
  cf: assets.creation.darkCfAnimated,
  mc: assets.creation.darkMcAnimated,
};

const LIGHT_IMAGES = {
  ac: assets.creation.lightAcAnimated,
  cf: assets.creation.lightCfAnimated,
  mc: assets.creation.lightMcAnimated,
};

interface IPostTopInfoModeration {
  title: string;
  postId: string;
  postStatus: TPostStatusStringified;
  totalVotes?: number;
  totalPledges?: number;
  targetPledges?: number;
  postType?: TPostType;
  amountInBids?: number;
  hasResponse: boolean;
  hasWinner: boolean;
  hidden?: boolean;
  handleUpdatePostStatus: (postStatus: number | string) => void;
  handleRemovePostFromState: () => void;
}

const PostTopInfoModeration: React.FunctionComponent<IPostTopInfoModeration> =
  ({
    title,
    postId,
    postType,
    postStatus,
    totalVotes,
    amountInBids,
    totalPledges,
    targetPledges,
    hasResponse,
    hasWinner,
    hidden,
    handleUpdatePostStatus,
    handleRemovePostFromState,
  }) => {
    const theme = useTheme();
    const router = useRouter();
    const { t } = useTranslation('modal-Post');

    const failureReason = useMemo(() => {
      if (postStatus !== 'failed') return '';

      if (postType === 'ac') {
        if (!hasWinner) {
          return 'ac-no-winner';
        }
        if (amountInBids === 0 || !amountInBids) {
          return 'ac';
        }
      }

      if (postType === 'mc') {
        if (totalVotes === 0 || !totalVotes) {
          return 'mc';
        }
      }

      if (postType === 'cf') {
        if (!totalPledges || (targetPledges && totalPledges < targetPledges)) {
          return 'cf';
        }
      }

      return 'no-response';
    }, [
      postStatus,
      postType,
      hasWinner,
      amountInBids,
      totalVotes,
      totalPledges,
      targetPledges,
    ]);

    const showWinnerOption = useMemo(
      () => postType === 'ac' && postStatus === 'waiting_for_decision',
      [postType, postStatus]
    );

    if (hidden) return null;

    return (
      <SContainer>
        <SWrapper showWinnerOption={showWinnerOption}>
          {postType === 'ac' && amountInBids ? (
            <SBidsAmount>
              <span>${formatNumber(amountInBids / 100 ?? 0, true)}</span>{' '}
              {t('acPost.postTopInfo.inBids')}
            </SBidsAmount>
          ) : null}
          {postType === 'mc' && totalVotes ? (
            <SBidsAmount>
              <span>
                {formatNumber(totalVotes, true).replaceAll(/,/g, ' ')}
              </span>{' '}
              {totalVotes > 1
                ? t('mcPost.postTopInfo.votes')
                : t('mcPost.postTopInfo.vote')}
            </SBidsAmount>
          ) : null}
          <SActionsDiv />
          <SPostTitle variant={5}>
            <PostTitleContent>{title}</PostTitleContent>
          </SPostTitle>
          {showWinnerOption ? (
            <SSelectWinnerOption>
              <SHeadline variant={4}>
                {t('acPostModeration.postTopInfo.selectWinner.title')}
              </SHeadline>
              <SText variant={3}>
                {t('acPostModeration.postTopInfo.selectWinner.body')}
              </SText>
              <STrophyImg src={assets.decision.trophy} />
            </SSelectWinnerOption>
          ) : null}
        </SWrapper>
        {postStatus === 'failed' && (
          <PostFailedBox
            title={t('postFailedBoxModeration.title', {
              postType: t(`postType.${postType}`),
            })}
            body={t(`postFailedBoxModeration.reason.${failureReason}`)}
            imageSrc={
              postType
                ? theme.name === 'light'
                  ? LIGHT_IMAGES[postType]
                  : DARK_IMAGES[postType]
                : undefined
            }
            buttonCaption={t('postFailedBoxModeration.buttonText', {
              postType: t(`postType.${postType}`),
            })}
            handleButtonClick={() => {
              Mixpanel.track('PostFailedBox Button Click', {
                _stage: 'Post',
                _postUuid: postId,
                _component: 'PostTopInfoModeration',
                _postType: postType,
              });
              if (postType === 'ac') {
                router.push('/creation/auction');
              } else if (postType === 'mc') {
                router.push('/creation/multiple-choice');
              } else {
                router.push('/creation/crowdfunding');
              }
            }}
          />
        )}
      </SContainer>
    );
  };

PostTopInfoModeration.defaultProps = {
  postType: undefined,
  totalVotes: undefined,
  amountInBids: undefined,
  totalPledges: undefined,
  targetPledges: undefined,
};

export default PostTopInfoModeration;

const SContainer = styled.div`
  grid-area: title;

  margin-bottom: 24px;
`;

const SWrapper = styled.div<{
  showWinnerOption: boolean;
}>`
  display: grid;

  ${({ showWinnerOption }) =>
    showWinnerOption
      ? css`
          grid-template-areas:
            'title title title'
            'stats stats actions';
        `
      : css`
          grid-template-areas:
            'title title title'
            'stats stats actions';
        `}

  height: fit-content;

  margin-top: 24px;
  margin-bottom: 12px;

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
    ${({ showWinnerOption }) =>
      showWinnerOption
        ? css`
            grid-template-areas:
              'stats stats actions'
              'title title title'
              'selectWinner selectWinner selectWinner';
          `
        : css`
            grid-template-areas:
              'stats stats actions'
              'title title title';
          `}
    grid-template-rows: 40px;
    grid-template-columns: 1fr 1fr 100px;
    align-items: center;

    margin-top: initial;
  }
`;

const SPostTitle = styled(Headline)`
  grid-area: title;
`;

// Action buttons
const SActionsDiv = styled.div`
  position: relative;
  grid-area: actions;

  display: flex;
  justify-content: flex-end;
`;

// Auction
const SBidsAmount = styled.div`
  grid-area: stats;
  justify-self: flex-start !important;
  align-self: center;

  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  span {
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: initial;
    justify-self: flex-end;
  }
`;

// Winner option
const SSelectWinnerOption = styled.div`
  position: fixed;
  bottom: 16px;
  left: 16;

  display: flex;
  flex-direction: column;
  justify-content: center;

  z-index: 20;

  height: 130px;
  width: calc(100% - 48px);

  padding: 24px 16px;
  padding-right: 134px;

  background: linear-gradient(
      315deg,
      rgba(29, 180, 255, 0.85) 0%,
      rgba(29, 180, 255, 0) 50%
    ),
    #1d6aff;
  border-radius: 24px;

  ${({ theme }) => theme.media.tablet} {
    grid-area: selectWinner;

    position: relative;

    width: auto;

    margin-top: 32px;
  }
`;

const STrophyImg = styled.img`
  position: absolute;
  right: -16px;
  top: 8px;
`;

const SHeadline = styled(Headline)`
  color: #ffffff;
`;

const SText = styled(Text)`
  color: #ffffff;
`;
