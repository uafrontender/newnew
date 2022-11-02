/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useMemo, useRef } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { formatNumber } from '../../../../utils/format';
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostModalInnerState } from '../../../../contexts/postModalInnerContext';

import Text from '../../../atoms/Text';
import Headline from '../../../atoms/Headline';
import PostFailedBox from '../common/PostFailedBox';
import PostTitleContent from '../../../atoms/PostTitleContent';

import assets from '../../../../constants/assets';
import ShareIconFilled from '../../../../public/images/svg/icons/filled/Share.svg';
import MoreIconFilled from '../../../../public/images/svg/icons/filled/More.svg';
import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';

import PostEllipseModalModeration from './PostEllipseModalModeration';
import PostEllipseMenuModeration from './PostEllipseMenuModeration';
import PostShareEllipseModal from '../common/PostShareEllipseModal';
import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';
import PostShareEllipseMenu from '../common/PostShareEllipseMenu';
import { useAppSelector } from '../../../../redux-store/store';
import PostConfirmDeleteModal from './PostConfirmDeleteModal';

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
  hasWinner: boolean;
  hidden?: boolean;
  totalVotes?: number;
  totalPledges?: number;
  targetPledges?: number;
  amountInBids?: number;
}

const PostTopInfoModeration: React.FunctionComponent<
  IPostTopInfoModeration
> = ({
  hasWinner,
  totalVotes,
  amountInBids,
  totalPledges,
  targetPledges,
  hidden,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('modal-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const {
    postParsed,
    typeOfPost,
    postStatus,
    ellipseMenuOpen,
    shareMenuOpen,
    deletePostOpen,
    handleEllipseMenuClose,
    handleShareClose,
    handleDeletePost,
    handleOpenShareMenu,
    handleOpenEllipseMenu,
    handleOpenDeletePostModal,
    handleCloseDeletePostModal,
  } = usePostModalInnerState();

  const postId = useMemo(() => postParsed?.postUuid ?? '', [postParsed]);
  const title = useMemo(() => postParsed?.title ?? '', [postParsed]);
  const creator = useMemo(() => postParsed?.creator ?? {}, [postParsed]);
  const postType = useMemo(() => typeOfPost ?? 'ac', [typeOfPost]);

  const failureReason = useMemo(() => {
    if (postStatus !== 'failed') return '';

    if (postType === 'ac') {
      if (amountInBids === 0 || !amountInBids) {
        return 'ac';
      }
      if (!hasWinner) {
        return 'ac-no-winner';
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
  const moreButtonRef: any = useRef();
  const shareButtonRef: any = useRef();

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
            <span>{formatNumber(totalVotes, true).replaceAll(/,/g, ' ')}</span>{' '}
            {totalVotes > 1
              ? t('mcPost.postTopInfo.votes')
              : t('mcPost.postTopInfo.vote')}
          </SBidsAmount>
        ) : null}
        <SCreatorCard>
          <a
            href={`${
              router.locale !== 'en-US' ? `/${router.locale}` : ''
            }/profile/my-posts`}
            onClickCapture={() => {
              Mixpanel.track('Click on own avatar', {
                _stage: 'Post',
                _postUuid: postId,
                _component: 'PostTopInfo',
              });
            }}
          >
            <SAvatarArea>
              <img src={creator.avatarUrl ?? ''} alt={creator.username ?? ''} />
            </SAvatarArea>
          </a>
          <a
            href={`${
              router.locale !== 'en-US' ? `/${router.locale}` : ''
            }/profile/my-posts`}
            onClickCapture={() => {
              Mixpanel.track('Click on own username', {
                _stage: 'Post',
                _postUuid: postId,
                _component: 'PostTopInfo',
              });
            }}
          >
            <SUsername className='username'>
              {t('me')}
              {creator.options?.isVerified && (
                <SInlineSVG
                  svg={VerificationCheckmark}
                  width='16px'
                  height='16px'
                  fill='none'
                />
              )}
            </SUsername>
          </a>
        </SCreatorCard>
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
            ref={shareButtonRef}
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
            ref={moreButtonRef}
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
            <PostShareEllipseMenu
              postId={postId}
              isVisible={shareMenuOpen}
              onClose={handleShareClose}
              anchorElement={shareButtonRef.current}
            />
          )}
          {isMobile && shareMenuOpen ? (
            <PostShareEllipseModal
              isOpen={shareMenuOpen}
              zIndex={11}
              postId={postId}
              onClose={handleShareClose}
            />
          ) : null}
          {/* Ellipse menu */}
          {!isMobile && (
            <PostEllipseMenuModeration
              postType={typeOfPost as string}
              isVisible={ellipseMenuOpen}
              canDeletePost={postStatus !== 'succeeded'}
              handleClose={handleEllipseMenuClose}
              handleOpenDeletePostModal={handleOpenDeletePostModal}
              anchorElement={moreButtonRef.current}
            />
          )}
          {isMobile && ellipseMenuOpen ? (
            <PostEllipseModalModeration
              postType={typeOfPost as string}
              zIndex={11}
              canDeletePost={postStatus !== 'succeeded'}
              isOpen={ellipseMenuOpen}
              onClose={handleEllipseMenuClose}
              handleOpenDeletePostModal={handleOpenDeletePostModal}
            />
          ) : null}
        </SActionsDiv>
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
      {/* Confirm delete post */}
      <PostConfirmDeleteModal
        postType={typeOfPost as string}
        isVisible={deletePostOpen}
        closeModal={handleCloseDeletePostModal}
        handleConfirmDelete={handleDeletePost}
      />
    </SContainer>
  );
};

PostTopInfoModeration.defaultProps = {
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
            'userCard userCard actions'
            'title title title'
            'stats stats stats'
            'selectWinner selectWinner selectWinner';
        `
      : css`
          grid-template-areas:
            'userCard userCard actions'
            'title title title'
            'stats stats stats';
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
    grid-template-columns: min-content 1fr 100px;
    align-items: center;

    margin-top: initial;
  }
`;

const SPostTitle = styled(Headline)`
  grid-area: title;
  white-space: pre-wrap;
  word-break: break-word;
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

// Creator card
const SCreatorCard = styled.div`
  grid-area: userCard;

  display: grid;
  align-items: center;
  grid-template-areas: 'avatar username';
  grid-template-columns: 36px 1fr;

  height: 36px;

  cursor: pointer;

  padding-right: 8px;

  .username {
    transition: 0.2s linear;
  }

  &:hover {
    .username {
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
  display: flex;
  align-items: center;
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

const SInlineSVG = styled(InlineSvg)`
  margin-left: 2px;
`;
