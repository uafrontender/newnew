/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../redux-store/store';

import { TPostType } from '../../../utils/switchPostType';

import UserAvatar from '../UserAvatar';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

import ShareIconFilled from '../../../public/images/svg/icons/filled/Share.svg';
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';

interface IPostTopInfo {
  creator: newnewapi.IUser;
  postType: TPostType;
  startsAtSeconds: number;
  amountInBids?: number;
  totalVotes?: number;
  currentBackers?: number;
  goalBackers?: number;
  handleFollowCreator: () => void;
  handleFollowDecision: () => void;
  handleReportAnnouncement: () => void;
}

const PostTopInfo: React.FunctionComponent<IPostTopInfo> = ({
  creator,
  postType,
  startsAtSeconds,
  amountInBids,
  totalVotes,
  currentBackers,
  goalBackers,
  handleFollowCreator,
  handleFollowDecision,
  handleReportAnnouncement,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const startingDateParsed = new Date(startsAtSeconds * 1000);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SWrapper>
      {postType === 'ac' && amountInBids && (
        <SBidsAmount>
          <span>
            $
            {(amountInBids / 100).toFixed(2)}
          </span>
          {' '}
          { t('PostTopInfo.in_bids') }
        </SBidsAmount>
      )}
      <CreatorCard>
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
          onClick={() => {
          }}
        >
          <InlineSvg
            svg={ShareIconFilled}
            fill={theme.colorsThemed.text.secondary}
            width="24px"
            height="24px"
          />
        </SShareButton>
        <SMoreButton
          view="transparent"
          iconOnly
          onClick={() => {
          }}
        >
          <InlineSvg
            svg={MoreIconFilled}
            fill={theme.colorsThemed.text.secondary}
            width="24px"
            height="24px"
          />
        </SMoreButton>
      </SActionsDiv>
    </SWrapper>
  );
};

PostTopInfo.defaultProps = {
  amountInBids: undefined,
  totalVotes: undefined,
  currentBackers: undefined,
  goalBackers: undefined,
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
    grid-template-columns: 1fr 1fr 120px;
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
  grid-area: actions;

  display: flex;
  gap: 16px;
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
