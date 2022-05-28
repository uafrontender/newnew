/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useAppSelector } from '../../../redux-store/store';

import { TPostType } from '../../../utils/switchPostType';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import InlineSvg from '../../atoms/InlineSVG';
import PostFailedBox from './PostFailedBox';
import PostShareMenu from './PostShareMenu';
import PostShareModal from './PostShareModal';
import PostEllipseMenu from './PostEllipseMenu';
import PostEllipseModal from './PostEllipseModal';

import ShareIconFilled from '../../../public/images/svg/icons/filled/Share.svg';
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';

import { formatNumber } from '../../../utils/format';
import { markPost } from '../../../api/endpoints/post';
import { FollowingsContext } from '../../../contexts/followingContext';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import getDisplayname from '../../../utils/getDisplayname';
import assets from '../../../constants/assets';

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

interface IPostTopInfo {
  postId: string;
  postStatus: TPostStatusStringified;
  title: string;
  creator: newnewapi.IUser;
  isFollowingDecision: boolean;
  handleSetIsFollowingDecision: (newValue: boolean) => void;
  postType?: TPostType;
  totalVotes?: number;
  totalPledges?: number;
  targetPledges?: number;
  amountInBids?: number;
  hasWinner: boolean;
  handleReportOpen: () => void;
  handleRemovePostFromState?: () => void;
  handleAddPostToState?: () => void;
}

const PostTopInfo: React.FunctionComponent<IPostTopInfo> = ({
  postId,
  postStatus,
  title,
  creator,
  isFollowingDecision,
  handleSetIsFollowingDecision,
  postType,
  totalVotes,
  totalPledges,
  targetPledges,
  amountInBids,
  hasWinner,
  handleReportOpen,
  handleRemovePostFromState,
  handleAddPostToState,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('decision');
  const { user } = useAppSelector((state) => state);
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

  const showSelectingWinnerOption = useMemo(
    () => postType === 'ac' && postStatus === 'waiting_for_decision',
    [postType, postStatus]
  );

  const { followingsIds, addId, removeId } = useContext(FollowingsContext);

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);

  const handleOpenShareMenu = () => setShareMenuOpen(true);
  const handleCloseShareMenu = useCallback(() => {
    setShareMenuOpen(false);
  }, []);

  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = useCallback(() => {
    setEllipseMenuOpen(false);
  }, []);

  const handleFollowDecision = useCallback(async () => {
    try {
      if (!user.loggedIn) {
        router.push(
          `/sign-up?reason=follow-decision&redirect=${encodeURIComponent(
            window.location.href
          )}`
        );
      }
      const markAsFavoritePayload = new newnewapi.MarkPostRequest({
        markAs: !isFollowingDecision
          ? newnewapi.MarkPostRequest.Kind.FAVORITE
          : newnewapi.MarkPostRequest.Kind.NOT_FAVORITE,
        postUuid: postId,
      });

      const res = await markPost(markAsFavoritePayload);

      if (!res.error) {
        handleSetIsFollowingDecision(!isFollowingDecision);

        if (isFollowingDecision) {
          handleRemovePostFromState?.();
        } else {
          handleAddPostToState?.();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [
    handleAddPostToState,
    handleRemovePostFromState,
    handleSetIsFollowingDecision,
    isFollowingDecision,
    postId,
    router,
    user.loggedIn,
  ]);

  return (
    <SContainer>
      <SWrapper showSelectingWinnerOption={showSelectingWinnerOption}>
        {postType === 'ac' && amountInBids ? (
          <SBidsAmount>
            <span>${formatNumber(amountInBids / 100 ?? 0, true)}</span>{' '}
            {t('AcPost.PostTopInfo.in_bids')}
          </SBidsAmount>
        ) : null}
        {postType === 'mc' && totalVotes ? (
          <SBidsAmount>
            <span>{formatNumber(totalVotes, true).replaceAll(/,/g, ' ')}</span>{' '}
            {totalVotes > 1
              ? t('McPost.PostTopInfo.votes')
              : t('McPost.PostTopInfo.vote')}
          </SBidsAmount>
        ) : null}
        <CreatorCard>
          <Link href={`/${creator.username}`}>
            <SAvatarArea>
              <img src={creator.avatarUrl ?? ''} alt={creator.username ?? ''} />
            </SAvatarArea>
          </Link>
          <Link href={`/${creator.username}`}>
            <SUsername>{creator.nickname ?? `@${creator.username}`}</SUsername>
          </Link>
        </CreatorCard>
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
            <PostEllipseMenu
              postType={postType as string}
              isFollowingDecision={isFollowingDecision}
              isVisible={ellipseMenuOpen}
              handleFollowDecision={handleFollowDecision}
              handleReportOpen={handleReportOpen}
              onClose={handleCloseEllipseMenu}
            />
          )}
          {isMobile && ellipseMenuOpen ? (
            <PostEllipseModal
              postType={postType as string}
              isFollowingDecision={isFollowingDecision}
              zIndex={11}
              isOpen={ellipseMenuOpen}
              handleFollowDecision={handleFollowDecision}
              handleReportOpen={handleReportOpen}
              onClose={handleCloseEllipseMenu}
            />
          ) : null}
        </SActionsDiv>
        <SPostTitle>
          <Headline variant={5}>{title}</Headline>
        </SPostTitle>
        {showSelectingWinnerOption ? (
          <SSelectingWinnerOption>
            <SHeadline variant={4}>
              {t('AcPost.PostTopInfo.SelectWinner.title')}
            </SHeadline>
            <SText variant={3}>
              {t('AcPost.PostTopInfo.SelectWinner.body')}
            </SText>
            <STrophyImg src={assets.decision.trophy} />
          </SSelectingWinnerOption>
        ) : null}
      </SWrapper>
      {postStatus === 'failed' && (
        <PostFailedBox
          title={t('PostFailedBox.title', {
            postType: t(`postType.${postType}`),
          })}
          body={t(`PostFailedBox.reason.${failureReason}`, {
            creator: getDisplayname(creator),
          })}
          buttonCaption={t('PostFailedBox.ctaButton', {
            postTypeMultiple: t(`postType.multiple.${postType}`),
          })}
          imageSrc={
            postType
              ? theme.name === 'light'
                ? LIGHT_IMAGES[postType]
                : DARK_IMAGES[postType]
              : undefined
          }
          handleButtonClick={() => {
            document.getElementById('post-modal-container')?.scrollTo({
              top: document.getElementById('recommendations-section-heading')
                ?.offsetTop,
              behavior: 'smooth',
            });
          }}
        />
      )}
    </SContainer>
  );
};

PostTopInfo.defaultProps = {
  postType: undefined,
  amountInBids: undefined,
  totalVotes: undefined,
  totalPledges: undefined,
  targetPledges: undefined,
  handleRemovePostFromState: undefined,
  handleAddPostToState: undefined,
};

export default PostTopInfo;

const SContainer = styled.div`
  grid-area: title;

  margin-bottom: 24px;
`;

const SWrapper = styled.div<{
  showSelectingWinnerOption: boolean;
}>`
  display: grid;

  grid-template-areas:
    'title title title'
    'userCard userCard actions'
    'stats stats stats';
  height: fit-content;

  margin-top: 24px;
  margin-bottom: 12px;

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
    ${({ showSelectingWinnerOption }) =>
      showSelectingWinnerOption
        ? css`
            grid-template-areas:
              'userCard stats actions'
              'title title title'
              'selectWinner selectWinner selectWinner';
          `
        : css`
            grid-template-areas:
              'userCard stats actions'
              'title title title';
          `}
    grid-template-rows: 40px;
    grid-template-columns: 1fr 1fr 100px;
    align-items: center;

    margin-bottom: 0px;

    margin-top: initial;
  }
`;

const SPostTitle = styled.div`
  grid-area: title;

  display: flex;
  align-items: center;

  ${({ theme }) => theme.media.laptop} {
    min-height: 64px;
  }
`;

// Creator card
const CreatorCard = styled.div`
  grid-area: userCard;

  display: grid;
  align-items: center;
  grid-template-areas: 'avatar username';
  grid-template-columns: 36px 1fr;

  height: 36px;

  cursor: pointer;

  & > div:nth-child(2) {
    transition: 0.2s linear;
  }

  &:hover {
    & > div:nth-child(2) {
      color: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
`;

const SAvatarArea = styled.div`
  grid-area: avatar;

  align-self: center;

  overflow: hidden;
  border-radius: 50%;
  width: 24px;
  height: 24px;

  display: flex;
  justify-content: center;
  align-items: center;

  img {
    display: block;
    width: 24px;
    height: 24px;
  }
`;

const SUsername = styled.div`
  grid-area: username;

  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
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
      view ? theme.colorsThemed.button.background[view] : ''};
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

  margin-bottom: 12px;

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
const SSelectingWinnerOption = styled.div`
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

    width: 100%;
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
