/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useCallback, useMemo, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { formatNumber } from '../../../utils/format';
import { TPostType } from '../../../utils/switchPostType';
import { deleteMyPost } from '../../../api/endpoints/post';
import { useAppSelector } from '../../../redux-store/store';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import PostFailedBox from './PostFailedBox';
import Headline from '../../atoms/Headline';
import InlineSvg from '../../atoms/InlineSVG';
import PostShareMenu from './PostShareMenu';
import PostShareModal from './PostShareModal';
import PostConfirmDeleteModal from './PostConfirmDeleteModal';
import PostEllipseMenuModeration from './PostEllipseMenuModeration';
import PostEllipseModalModeration from './PostEllipseModalModeration';

import ShareIconFilled from '../../../public/images/svg/icons/filled/Share.svg';
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import assets from '../../../constants/assets';

const IMAGES = {
  ac: assets.creation.AcAnimated,
  cf: assets.creation.CfAnimated,
  mc: assets.creation.McAnimated,
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
    handleUpdatePostStatus,
    handleRemovePostFromState,
  }) => {
    const theme = useTheme();
    const router = useRouter();
    const { t } = useTranslation('decision');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

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
        if (!totalPledges || totalPledges!! < targetPledges!!) {
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

    const [shareMenuOpen, setShareMenuOpen] = useState(false);
    const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
    const [deletePostOpen, setDeletePostOpen] = useState(false);

    const handleOpenShareMenu = () => setShareMenuOpen(true);
    const handleCloseShareMenu = useCallback(() => {
      setShareMenuOpen(false);
    }, []);

    const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
    const handleCloseEllipseMenu = useCallback(
      () => setEllipseMenuOpen(false),
      []
    );

    const handleOpenDeletePostModal = useCallback(
      () => setDeletePostOpen(true),
      []
    );
    const handleCloseDeletePostModal = () => setDeletePostOpen(false);

    const handleDeletePost = async () => {
      try {
        const payload = new newnewapi.DeleteMyPostRequest({
          postUuid: postId,
        });

        const res = await deleteMyPost(payload);

        if (!res.error) {
          console.log('Post deleted/cancelled');
          handleUpdatePostStatus('DELETED_BY_CREATOR');
          handleRemovePostFromState?.();
          handleCloseDeletePostModal();
        }
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <SContainer>
        <SWrapper showWinnerOption={showWinnerOption}>
          {postType === 'ac' && amountInBids ? (
            <SBidsAmount>
              <span>${formatNumber(amountInBids / 100 ?? 0, true)}</span>{' '}
              {t('AcPost.PostTopInfo.in_bids')}
            </SBidsAmount>
          ) : null}
          {postType === 'mc' && totalVotes ? (
            <SBidsAmount>
              <span>
                {formatNumber(totalVotes, true).replaceAll(/,/g, ' ')}
              </span>{' '}
              {totalVotes > 1
                ? t('McPost.PostTopInfo.votes')
                : t('McPost.PostTopInfo.vote')}
            </SBidsAmount>
          ) : null}
          <SActionsDiv>
            <SShareButton
              view='transparent'
              iconOnly
              withDim
              withShrink
              style={{
                padding: '8px',
              }}
              onClick={() => handleOpenShareMenu()}
            >
              <InlineSvg
                svg={ShareIconFilled}
                fill={theme.colorsThemed.text.secondary}
                width='20px'
                height='20px'
              />
            </SShareButton>
            <SMoreButton
              view='transparent'
              iconOnly
              onClick={() => handleOpenEllipseMenu()}
            >
              <InlineSvg
                svg={MoreIconFilled}
                fill={theme.colorsThemed.text.secondary}
                width='20px'
                height='20px'
              />
            </SMoreButton>
            {/* Share menu */}
            {!isMobile && (
              <PostShareMenu
                postId={postId}
                isVisible={shareMenuOpen}
                onClose={handleCloseShareMenu}
              />
            )}
            {isMobile && shareMenuOpen ? (
              <PostShareModal
                isOpen={shareMenuOpen}
                zIndex={11}
                postId={postId}
                onClose={handleCloseShareMenu}
              />
            ) : null}
            {/* Ellipse menu */}
            {!isMobile && (
              <PostEllipseMenuModeration
                postType={postType as string}
                isVisible={ellipseMenuOpen}
                canDeletePost={postStatus !== 'failed'}
                handleClose={handleCloseEllipseMenu}
                handleOpenDeletePostModal={handleOpenDeletePostModal}
              />
            )}
            {isMobile && ellipseMenuOpen ? (
              <PostEllipseModalModeration
                postType={postType as string}
                zIndex={11}
                canDeletePost={postStatus !== 'failed'}
                isOpen={ellipseMenuOpen}
                onClose={handleCloseEllipseMenu}
                handleOpenDeletePostModal={handleOpenDeletePostModal}
              />
            ) : null}
          </SActionsDiv>
          <SPostTitle variant={5}>{title}</SPostTitle>
          {showWinnerOption ? (
            <SSelectWinnerOption>
              <SHeadline variant={4}>
                {t('AcPostModeration.PostTopInfo.SelectWinner.title')}
              </SHeadline>
              <SText variant={3}>
                {t('AcPostModeration.PostTopInfo.SelectWinner.body')}
              </SText>
              <STrophyImg src={assets.decision.trophy} />
            </SSelectWinnerOption>
          ) : null}
        </SWrapper>
        {postStatus === 'failed' && (
          <PostFailedBox
            title={t('PostFailedBoxModeration.title', {
              postType: t(`postType.${postType}`),
            })}
            body={t(`PostFailedBoxModeration.reason.${failureReason}`)}
            imageSrc={IMAGES[postType!!]}
            buttonCaption={t('PostFailedBoxModeration.ctaButton', {
              postType: t(`postType.${postType}`),
            })}
            handleButtonClick={() => {
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
        {/* Confirm delete post */}
        <PostConfirmDeleteModal
          postType={postType as string}
          isVisible={deletePostOpen}
          closeModal={handleCloseDeletePostModal}
          handleConfirmDelete={handleDeletePost}
        />
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

const SShareButton = styled(Button)`
  background: none;
  padding: 0px;
  &:focus:enabled {
    background: ${({ theme, view }) =>
      theme.colorsThemed.button.background[view!!]};
  }
`;

const SMoreButton = styled(Button)`
  background: none;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  padding: 8px;

  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
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
