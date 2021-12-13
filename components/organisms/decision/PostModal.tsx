/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import Modal from '../Modal';

import isBrowser from '../../../utils/isBrowser';
import PostViewMC from './PostViewMC';
import Headline from '../../atoms/Headline';

interface IPostModal {
  isOpen: boolean;
  post?: newnewapi.IPost,
  handleClose: () => void;
}

const switchPostType = (
  post: newnewapi.IPost,
): newnewapi.IAuction | newnewapi.ICrowdfunding | newnewapi.IMultipleChoice => {
  if (post.auction) return post.auction;
  if (post.crowdfunding) return post.crowdfunding;
  if (post.multipleChoice) return post.multipleChoice;
  throw new Error('Unknow post type');
};

const PostModal: React.FunctionComponent<IPostModal> = ({
  isOpen,
  post,
  handleClose,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const postParsed = post && switchPostType(post);

  const [ownModalOpen, setOwnModalOpen] = useState(false);

  const renderPostview = (
    postToRender: newnewapi.IPost,
  ) => {
    if (postToRender.multipleChoice) {
      return (
        <PostViewMC
          post={postToRender.multipleChoice}
        />
      );
    }
    if (postToRender.crowdfunding) return <></>;
    if (postToRender.auction) return <></>;
    return <></>;
  };

  useEffect(() => {
    if (isOpen && postParsed) {
      window.history.pushState(postParsed.postUuid, 'Post', `/?post=${postParsed.postUuid}`);
    } else {
      router.replace(router.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postParsed]);

  // Close modal on back btn
  useEffect(() => {
    const verify = () => {
      if (!isBrowser()) return;

      const postId = new URL(window.location.href).searchParams.get('post');

      if (!postId) {
        handleClose();
        setOwnModalOpen(false);
      }
    };

    router.events.on('routeChangeComplete', verify);

    return () => router.events.off('routeChangeComplete', verify);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      show={isOpen}
      overlayDim
      onClose={handleClose}
    >
      {postParsed ? (
        <SPostModalContainer
          onClick={(e) => e.stopPropagation()}
        >
          {renderPostview(post)}
          <SRecommendationsSection>
            <Headline
              variant={4}
            >
              { t('RecommendationsSection.heading') }
            </Headline>
          </SRecommendationsSection>
        </SPostModalContainer>
      ) : null }
    </Modal>
  );
};

PostModal.defaultProps = {
  post: undefined,
};

export default PostModal;

const SPostModalContainer = styled.div`
  position: absolute;

  overflow-y: auto;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  width: 100%;
  height: 100%;

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    top: 32px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }


  ${({ theme }) => theme.media.laptop} {
    top: 32px;
    left: calc(50% - 496px);
    width: 992px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 24px;
  }
`;

const SRecommendationsSection = styled.div`
  min-height: 600px;
`;
