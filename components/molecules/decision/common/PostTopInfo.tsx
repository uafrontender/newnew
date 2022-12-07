/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
  useRef,
} from 'react';
import styled, { css, useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useAppSelector } from '../../../../redux-store/store';

import { TPostType } from '../../../../utils/switchPostType';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';
import InlineSvg from '../../../atoms/InlineSVG';
import PostFailedBox from './PostFailedBox';
import PostShareEllipseMenu from './PostShareEllipseMenu';
import PostShareEllipseModal from './PostShareEllipseModal';
import PostEllipseMenu from './PostEllipseMenu';
import PostEllipseModal from './PostEllipseModal';

import ShareIconFilled from '../../../../public/images/svg/icons/filled/Share.svg';
import MoreIconFilled from '../../../../public/images/svg/icons/filled/More.svg';
import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';

import { formatNumber } from '../../../../utils/format';
import { markPost } from '../../../../api/endpoints/post';
import { FollowingsContext } from '../../../../contexts/followingContext';
import getDisplayname from '../../../../utils/getDisplayname';
import assets from '../../../../constants/assets';
import PostTitleContent from '../../../atoms/PostTitleContent';
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { I18nNamespaces } from '../../../../@types/i18next';

const DARK_IMAGES: Record<string, () => string> = {
  ac: assets.common.ac.darkAcAnimated,
  cf: assets.creation.darkCfAnimated,
  mc: assets.common.mc.darkMcAnimated,
};

const LIGHT_IMAGES: Record<string, () => string> = {
  ac: assets.common.ac.lightAcAnimated,
  cf: assets.creation.lightCfAnimated,
  mc: assets.common.mc.lightMcAnimated,
};

interface IPostTopInfo {
  totalVotes?: number;
  totalPledges?: number;
  targetPledges?: number;
  amountInBids?: number;
  hasWinner: boolean;
}

const PostTopInfo: React.FunctionComponent<IPostTopInfo> = ({
  totalVotes,
  totalPledges,
  targetPledges,
  amountInBids,
  hasWinner,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('page-Post');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAppSelector((state) => state);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const {
    postParsed,
    typeOfPost,
    postStatus,
    isFollowingDecision,
    hasRecommendations,
    handleReportOpen,
    handleSetIsFollowingDecision,
    handleCloseAndGoBack,
  } = usePostInnerState();

  const postId = useMemo(() => postParsed?.postUuid ?? '', [postParsed]);
  const title = useMemo(() => postParsed?.title ?? '', [postParsed]);
  const creator = useMemo(() => postParsed?.creator!!, [postParsed]);
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

  const showSelectingWinnerOption = useMemo(
    () => postType === 'ac' && postStatus === 'waiting_for_decision',
    [postType, postStatus]
  );

  const { followingsIds, addId, removeId } = useContext(FollowingsContext);

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);

  const handleOpenShareMenu = () => {
    Mixpanel.track('Opened Share Menu', {
      _stage: 'Post',
      _postUuid: postId,
      _component: 'PostTopInfo',
    });
    setShareMenuOpen(true);
  };
  const handleCloseShareMenu = useCallback(() => {
    Mixpanel.track('Close Share Menu', {
      _stage: 'Post',
      _postUuid: postId,
      _component: 'PostTopInfo',
    });
    setShareMenuOpen(false);
  }, [postId]);

  const handleOpenEllipseMenu = () => {
    Mixpanel.track('Open Ellipse Menu', {
      _stage: 'Post',
      _postUuid: postId,
      _component: 'PostTopInfo',
    });
    setEllipseMenuOpen(true);
  };
  const handleCloseEllipseMenu = useCallback(() => {
    Mixpanel.track('Close Ellipse Menu', {
      _stage: 'Post',
      _postUuid: postId,
      _component: 'PostTopInfo',
    });
    setEllipseMenuOpen(false);
  }, [postId]);

  const handleFollowDecision = useCallback(async () => {
    try {
      Mixpanel.track('Favorite Post', {
        _stage: 'Post',
        _postUuid: postId,
        _component: 'PostTopInfo',
      });

      // Redirect only after the persist data is pulled
      if (!user.loggedIn && user._persist?.rehydrated) {
        router.push(
          `/sign-up?reason=follow-decision&redirect=${encodeURIComponent(
            window.location.href
          )}`
        );
        return;
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
      }
    } catch (err) {
      console.error(err);
    }
  }, [
    handleSetIsFollowingDecision,
    isFollowingDecision,
    postId,
    router,
    user.loggedIn,
    user._persist?.rehydrated,
  ]);

  const handleSeeNewFailedBox = useCallback(() => {
    Mixpanel.track('See New Failde Box', {
      _stage: 'Post',
      _postUuid: postId,
      _component: 'PostTopInfo',
    });
    if (router.pathname === '/') {
      handleCloseAndGoBack();
    } else {
      router.push('/');
    }
    // }
  }, [router, postId, handleCloseAndGoBack]);

  const moreButtonRef: any = useRef();
  const shareButtonRef: any = useRef();

  return (
    <SContainer>
      <SWrapper showSelectingWinnerOption={showSelectingWinnerOption}>
        {postType === 'ac' && amountInBids ? (
          <SBidsAmount>
            <span>${formatNumber(amountInBids / 100 ?? 0, true)}</span>{' '}
            {t('acPost.postTopInfo.inBids')}
          </SBidsAmount>
        ) : null}
        {postType === 'mc' && totalVotes ? (
          <SBidsAmount>
            <span>{formatNumber(totalVotes, true)}</span>{' '}
            {totalVotes > 1
              ? t('mcPost.postTopInfo.votes')
              : t('mcPost.postTopInfo.vote')}
          </SBidsAmount>
        ) : null}
        <SCreatorCard>
          <Link href={`/${creator.username}`}>
            <a
              href={`/${creator.username}`}
              onClickCapture={() => {
                Mixpanel.track('Click on creator avatar', {
                  _stage: 'Post',
                  _postUuid: postId,
                  _component: 'PostTopInfo',
                });
              }}
            >
              <SAvatarArea>
                <img
                  src={creator.avatarUrl ?? ''}
                  alt={creator.username ?? ''}
                />
              </SAvatarArea>
            </a>
          </Link>
          <Link href={`/${creator.username}`}>
            <a
              href={`/${creator.username}`}
              onClickCapture={() => {
                Mixpanel.track('Click on creator username', {
                  _stage: 'Post',
                  _postUuid: postId,
                  _component: 'PostTopInfo',
                });
              }}
            >
              <SUserInfo>
                <SUsername className='username'>
                  {getDisplayname(creator)}
                </SUsername>
                {creator.options?.isVerified && (
                  <SInlineSVG
                    svg={VerificationCheckmark}
                    width='20px'
                    height='20px'
                    fill='none'
                  />
                )}
              </SUserInfo>
            </a>
          </Link>
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
              onClose={handleCloseShareMenu}
              anchorElement={shareButtonRef.current}
            />
          )}
          {isMobile && shareMenuOpen ? (
            <PostShareEllipseModal
              isOpen={shareMenuOpen}
              zIndex={11}
              postId={postId}
              onClose={handleCloseShareMenu}
            />
          ) : null}
          {/* Ellipse menu */}
          {!isMobile && (
            <PostEllipseMenu
              postType={postType as TPostType}
              isFollowingDecision={isFollowingDecision}
              isVisible={ellipseMenuOpen}
              handleFollowDecision={handleFollowDecision}
              handleReportOpen={handleReportOpen}
              onClose={handleCloseEllipseMenu}
              anchorElement={moreButtonRef.current}
            />
          )}
          {isMobile && ellipseMenuOpen ? (
            <PostEllipseModal
              postType={postType as TPostType}
              isFollowingDecision={isFollowingDecision}
              zIndex={11}
              isOpen={ellipseMenuOpen}
              handleFollowDecision={handleFollowDecision}
              handleReportOpen={handleReportOpen}
              onClose={handleCloseEllipseMenu}
            />
          ) : null}
        </SActionsDiv>
        <SPostTitle variant={5}>
          <PostTitleContent>{title}</PostTitleContent>
        </SPostTitle>
        {showSelectingWinnerOption ? (
          <SSelectingWinnerOption>
            <SHeadline variant={4}>
              {t('acPost.postTopInfo.selectWinner.title')}
            </SHeadline>
            <SText variant={3}>
              {t('acPost.postTopInfo.selectWinner.body')}
            </SText>
            <STrophyImg src={assets.decision.trophy} />
          </SSelectingWinnerOption>
        ) : null}
      </SWrapper>
      {postStatus === 'failed' && (
        <PostFailedBox
          title={t('postFailedBox.title', {
            postType: t(`postType.${postType}`),
          })}
          body={t(
            `postFailedBox.reason.${
              failureReason as keyof I18nNamespaces['page-Post']['postFailedBox']['reason']
            }`,
            {
              creator: getDisplayname(creator),
            }
          )}
          buttonCaption={tCommon('button.takeMeHome')}
          imageSrc={
            postType
              ? theme.name === 'light'
                ? LIGHT_IMAGES[postType]()
                : DARK_IMAGES[postType]()
              : undefined
          }
          handleButtonClick={handleSeeNewFailedBox}
        />
      )}
    </SContainer>
  );
};

PostTopInfo.defaultProps = {
  amountInBids: undefined,
  totalVotes: undefined,
  totalPledges: undefined,
  targetPledges: undefined,
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
    'userCard userCard actions'
    'title title title'
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
    grid-template-columns: max-content 1fr 100px;
    align-items: center;

    margin-bottom: 0px;

    margin-top: initial;
  }
`;

const SPostTitle = styled(Headline)`
  grid-area: title;
  white-space: pre-wrap;
  word-break: break-word;

  margin-top: 8px;
  margin-bottom: 12px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: initial;
    margin-bottom: initial;
  }
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

const SUserInfo = styled.div`
  grid-area: username;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SUsername = styled.div`
  display: inline;
  flex-shrink: 1;
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
    justify-self: flex-start;
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
  color: #fff;
`;

const SInlineSVG = styled(InlineSvg)`
  margin-left: 2px;
`;
