/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppSelector } from '../../../redux-store/store';

import { TPostType } from '../../../utils/switchPostType';

import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

import ShareIconFilled from '../../../public/images/svg/icons/filled/Share.svg';
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';

import { formatNumber } from '../../../utils/format';
import PostShareMenu from './PostShareMenu';
import PostShareModal from './PostShareModal';
import PostEllipseMenu from './PostEllipseMenu';
import PostEllipseModal from './PostEllipseModal';
import { markPost } from '../../../api/endpoints/post';

interface IPostTopInfo {
  postId: string;
  creator: newnewapi.IUser;
  postType: TPostType;
  startsAtSeconds: number;
  amountInBids?: number;
  totalVotes?: number;
  currentBackers?: number;
  targetBackers?: number;
  handleFollowCreator: () => void;
  handleReportAnnouncement: () => void;
}

const PostTopInfo: React.FunctionComponent<IPostTopInfo> = ({
  postId,
  creator,
  postType,
  startsAtSeconds,
  amountInBids,
  totalVotes,
  currentBackers,
  targetBackers,
  handleFollowCreator,
  handleReportAnnouncement,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('decision');
  const startingDateParsed = new Date(startsAtSeconds * 1000);
  const { user } = useAppSelector((state) => state);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);

  const handleRedirectToUser = () => {
    router.push(`/u/${creator.username}`);
  };

  const handleOpenShareMenu = () => setShareMenuOpen(true);
  const handleCloseShareMenu = () => setShareMenuOpen(false);

  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);

  const handleFollowDecision = async () => {
    try {
      if (!user.loggedIn) {
        router.push('/sign-up?reason=follow-decision');
      }
      const markAsViewedPayload = new newnewapi.MarkPostRequest({
        markAs: newnewapi.MarkPostRequest.Kind.FAVORITE,
        postUuid: postId,
      });

      const res = await markPost(markAsViewedPayload);

      console.log(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SWrapper>
      {postType === 'ac' && amountInBids && (
        <SBidsAmount>
          <span>
            $
            {formatNumber((amountInBids / 100) ?? 0, true)}
          </span>
          {' '}
          { t('AcPost.PostTopInfo.in_bids') }
        </SBidsAmount>
      )}
      {postType === 'mc' && totalVotes && (
        <SBidsAmount>
          <span>
            {formatNumber(totalVotes, true).replaceAll(/,/g, ' ') }
          </span>
          {' '}
          { t('McPost.PostTopInfo.votes') }
        </SBidsAmount>
      )}
      <CreatorCard
        onClick={() => handleRedirectToUser()}
      >
        <SAvatarArea>
          <img
            src={creator.avatarUrl!! as string}
            alt={creator.username!!}
          />
        </SAvatarArea>
        <SUsername>
          @
          { creator.username }
        </SUsername>
        <SStartsAt>
          { startingDateParsed.getDate() }
          {' '}
          { startingDateParsed.toLocaleString('default', { month: 'short' }) }
          {' '}
          { startingDateParsed.getFullYear() }
          {' '}
        </SStartsAt>
      </CreatorCard>
      <SActionsDiv>
        <SShareButton
          view="transparent"
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
            width="20px"
            height="20px"
          />
        </SShareButton>
        <SMoreButton
          view="transparent"
          iconOnly
          onClick={() => handleOpenEllipseMenu()}
        >
          <InlineSvg
            svg={MoreIconFilled}
            fill={theme.colorsThemed.text.secondary}
            width="20px"
            height="20px"
          />
        </SMoreButton>
        {/* Share menu */}
        {!isMobile && (
          <PostShareMenu
            isVisible={shareMenuOpen}
            handleClose={handleCloseShareMenu}
          />
        )}
        {isMobile && shareMenuOpen ? (
          <PostShareModal
            isOpen={shareMenuOpen}
            zIndex={11}
            onClose={handleCloseShareMenu}
          />
        ) : null}
        {/* Ellipse menu */}
        {!isMobile && (
          <PostEllipseMenu
            isVisible={ellipseMenuOpen}
            handleFollowDecision={handleFollowDecision}
            handleClose={handleCloseEllipseMenu}
          />
        )}
        {isMobile && ellipseMenuOpen ? (
          <PostEllipseModal
            isOpen={ellipseMenuOpen}
            zIndex={11}
            handleFollowDecision={handleFollowDecision}
            onClose={handleCloseEllipseMenu}
          />
        ) : null}
      </SActionsDiv>
    </SWrapper>
  );
};

PostTopInfo.defaultProps = {
  amountInBids: undefined,
  totalVotes: undefined,
  currentBackers: undefined,
  targetBackers: undefined,
};

export default PostTopInfo;

const SWrapper = styled.div`
  display: grid;

  grid-template-areas:
    'stats stats stats'
    'userCard userCard actions'
  ;

  height: fit-content;

  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
    grid-template-areas:
      'userCard stats actions'
    ;
    grid-template-rows: 40px;
    grid-template-columns: 1fr 1fr 100px;
    align-items: center;
  }
`;

// Creator card
const CreatorCard = styled.div`
  grid-area: userCard;

  display: grid;
  grid-template-areas:
    'avatar username'
    'avatar startsAt'
  ;
  grid-template-columns: 44px 1fr;

  height: 36px;

  cursor: pointer;

  & > div:nth-child(2) {
    transition: .2s linear;
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
  width: 36px;
  height: 36px;

  display: flex;
  justify-content: center;
  align-items: center;

  img {
    display: block;
    width: 36px;
    height: 36px;
  }
`;

const SUsername = styled.div`
  grid-area: username;

  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SStartsAt = styled.div`
  grid-area: startsAt;

  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
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
    background: ${({
    theme,
    view,
  }) => theme.colorsThemed.button.background[view!!]};
  }
`;

const SMoreButton = styled(Button)`
  background: none;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  padding: 8px;
  margin-right: 18px;

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
