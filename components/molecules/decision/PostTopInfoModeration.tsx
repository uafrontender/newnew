/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useContext, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../redux-store/store';
import { cancelMyPost } from '../../../api/endpoints/post';

import { TPostType } from '../../../utils/switchPostType';

import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import InlineSvg from '../../atoms/InlineSVG';
import PostShareMenu from './PostShareMenu';
import PostShareModal from './PostShareModal';
import PostConfirmDeleteModal from './PostConfirmDeleteModal';
import PostEllipseMenuModeration from './PostEllipseMenuModeration';
import PostEllipseModalModeration from './PostEllipseModalModeration';

import ShareIconFilled from '../../../public/images/svg/icons/filled/Share.svg';
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';

import { formatNumber } from '../../../utils/format';

interface IPostTopInfoModeration {
  title: string;
  postId: string;
  totalVotes?: number;
  postType?: TPostType;
  amountInBids?: number;
  handleUpdatePostStatus: (postStatus: number | string) => void;
}

const PostTopInfoModeration: React.FunctionComponent<IPostTopInfoModeration> = ({
  title,
  postId,
  postType,
  totalVotes,
  amountInBids,
  handleUpdatePostStatus,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const [deletePostOpen, setDeletePostOpen] = useState(false);


  const handleOpenShareMenu = () => setShareMenuOpen(true);
  const handleCloseShareMenu = () => setShareMenuOpen(false);

  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);

  const handleOpenDeletePostModal = () => setDeletePostOpen(true);
  const handleCloseDeletePostModal = () => setDeletePostOpen(false);

  const handleDeletePost = async () => {
    try {
      const payload = new newnewapi.CancelMyPostRequest({
        postUuid: postId,
      });

      const res = await cancelMyPost(payload);

      if (!res.error) {
        console.log('Post deleted/cancelled');
        handleUpdatePostStatus('CANCELLED');
        handleCloseDeletePostModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SContainer>
      <SWrapper>
        {postType === 'ac' && amountInBids ? (
          <SBidsAmount>
            <span>
              $
              {formatNumber((amountInBids / 100) ?? 0, true)}
            </span>
            {' '}
            { t('AcPost.PostTopInfo.in_bids') }
          </SBidsAmount>
        ) : null}
        {postType === 'mc' && totalVotes ? (
          <SBidsAmount>
            <span>
              {formatNumber(totalVotes, true).replaceAll(/,/g, ' ') }
            </span>
            {' '}
            { t('McPost.PostTopInfo.votes') }
          </SBidsAmount>
        ) : null}
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
            <PostEllipseMenuModeration
              isVisible={ellipseMenuOpen}
              handleClose={handleCloseEllipseMenu}
              handleOpenDeletePostModal={handleOpenDeletePostModal}
            />
          )}
          {isMobile && ellipseMenuOpen ? (
            <PostEllipseModalModeration
              zIndex={11}
              isOpen={ellipseMenuOpen}
              onClose={handleCloseEllipseMenu}
              handleOpenDeletePostModal={handleOpenDeletePostModal}
            />
          ) : null}
        </SActionsDiv>
        <SPostTitle
          variant={5}
        >
          {title}
        </SPostTitle>
      </SWrapper>
      {/* Confirm delete post */}
      <PostConfirmDeleteModal
        isVisible={deletePostOpen}
        closeModal={handleCloseDeletePostModal}
        handleConfirmDelete={handleDeletePost}
      />
    </SContainer>
  );
};

PostTopInfoModeration.defaultProps = {
  postType: undefined,
  amountInBids: undefined,
  totalVotes: undefined,
};

export default PostTopInfoModeration;

const SContainer = styled.div`
  grid-area: title;

  margin-bottom: 24px;
`;

const SWrapper = styled.div`
  display: grid;

  grid-template-areas:
    'title title title'
    'stats stats actions'
  ;

  height: fit-content;

  margin-top: 24px;
  margin-bottom: 12px;

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
    grid-template-areas:
      'stats stats actions'
      'title title title'
    ;
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
