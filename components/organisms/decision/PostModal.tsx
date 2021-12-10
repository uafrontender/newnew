/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import Modal from '../Modal';

import isBrowser from '../../../utils/isBrowser';

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
  const router = useRouter();
  const postParsed = post && switchPostType(post);

  const [ownModalOpen, setOwnModalOpen] = useState(false);

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
          {postParsed.title}
          <button
            type="button"
            onClick={() => setOwnModalOpen(true)}
          >
            open new modal
          </button>
          <Modal
            show={ownModalOpen}
            overlayDim
            additionalZ={11}
            onClose={() => setOwnModalOpen(false)}
          >
            hey
          </Modal>
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

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  width: 100%;
  height: 100%;


  ${({ theme }) => theme.media.laptop} {
    top: 32px;
    left: calc(50% - 496px);
    width: 992px;

    border-radius: ${({ theme }) => theme.borderRadius.medium}
  }
`;
