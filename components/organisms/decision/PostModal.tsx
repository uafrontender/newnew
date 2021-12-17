/* eslint-disable no-lonely-if */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import Modal from '../Modal';

import isBrowser from '../../../utils/isBrowser';
import PostViewMC from './PostViewMC';
import Headline from '../../atoms/Headline';
import switchPostType, { postType } from '../../../utils/switchPostType';
import PostViewAC from './PostViewAC';
import PostViewCF from './PostViewCF';
import List from '../search/List';
import { fetchMoreLikePosts } from '../../../api/endpoints/post';

interface IPostModal {
  isOpen: boolean;
  post?: newnewapi.IPost,
  handleClose: () => void;
  handleOpenAnotherPost?: (post: newnewapi.Post) => void;
}

const PostModal: React.FunctionComponent<IPostModal> = ({
  isOpen,
  post,
  handleClose,
  handleOpenAnotherPost,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const [postParsed, typeOfPost] = post ? switchPostType(post) : [undefined, undefined];

  const [currLocation] = useState(isBrowser() ? window.location.href : '');

  const [open, setOpen] = useState(false);

  const modalContainerRef = useRef<HTMLDivElement>();

  // Recommendations (with infinite scroll)
  // NB! Will require a separate endpoint for this one
  const innerHistoryStack = useRef<newnewapi.Post[]>([]);
  const [recommenedPosts, setRecommenedPosts] = useState<newnewapi.Post[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null | undefined>('');
  const [recommenedPostsLoading, setRecommenedPostsLoading] = useState(false);
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  const handleCloseAndGoBack = () => {
    // window.history.back();
    handleClose();
    window.history.replaceState('', '', currLocation);

    // test
    innerHistoryStack.current = [];
  };

  const handleOpenRecommendedPost = (newPost: newnewapi.Post) => {
    const newPostParsed = switchPostType(newPost)[0];
    handleOpenAnotherPost?.(newPost);
    if (post !== undefined) innerHistoryStack.current.push(post as newnewapi.Post);
    modalContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    window.history.pushState(
      newPostParsed.postUuid,
      'Post',
      `/?post=${newPostParsed.postUuid}`,
    );
    setRecommenedPosts([]);
    setNextPageToken('');
  };

  const loadRecommendedPosts = useCallback(async (
    pageToken?: string,
  ) => {
    if (recommenedPostsLoading) return;
    try {
      setRecommenedPostsLoading(true);

      const fetchRecommenedPostsPayload = new newnewapi.GetMoreLikePostsRequest({
        postUuid: postParsed?.postUuid,
        ...(pageToken ? {
          paging: {
            pageToken,
          },
        } : {}),
      });
      const postsResponse = await fetchMoreLikePosts(fetchRecommenedPostsPayload);

      console.log(postsResponse);

      if (postsResponse.data && postsResponse.data.posts) {
        setRecommenedPosts((curr) => [...curr, ...postsResponse.data?.posts as newnewapi.Post[]]);
        setNextPageToken(postsResponse.data.paging?.nextPageToken);
      }
      setRecommenedPostsLoading(false);
    } catch (err) {
      setRecommenedPostsLoading(false);
      console.error(err);
    }
  }, [
    setRecommenedPosts, recommenedPostsLoading,
    postParsed,
  ]);

  const renderPostview = (
    postToRender: postType,
  ) => {
    if (postToRender === 'mc') {
      return (
        <PostViewMC
          post={postParsed as newnewapi.MultipleChoice}
        />
      );
    }
    if (postToRender === 'ac') {
      return (
        <PostViewAC
          post={postParsed as newnewapi.Auction}
        />
      );
    }
    if (postToRender === 'cf') {
      return (
        <PostViewCF
          post={postParsed as newnewapi.Crowdfunding}
        />
      );
    }
    return <></>;
  };

  useEffect(() => {
    if (isOpen && postParsed) {
      setOpen(true);
      window.history.pushState(postParsed.postUuid, 'Post', `/?post=${postParsed.postUuid}`);
    }

    return () => {
      setOpen(false);

      // test
      innerHistoryStack.current = [];
      // window.history.back();
      // eslint-disable-next-line no-useless-return
      return;
      // if (router.query.username) {
      //   router.replace(
      //     router.asPath,
      //     undefined,
      //     {
      //       shallow: true,
      //     },
      //   );
      // } else {
      //   router.replace(router.pathname);
      // }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close modal on back btn
  useEffect(() => {
    const verify = () => {
      if (!isBrowser()) return;

      const postId = new URL(window.location.href).searchParams.get('post');

      console.log(postId);

      console.log(innerHistoryStack.current);

      if (innerHistoryStack.current
        && innerHistoryStack.current[innerHistoryStack.current.length - 1]) {
        handleOpenAnotherPost?.(innerHistoryStack.current[innerHistoryStack.current.length - 1]);
        modalContainerRef.current?.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        innerHistoryStack.current = innerHistoryStack.current.slice(
          0,
          innerHistoryStack.current.length - 1,
        );
        setRecommenedPosts([]);
        setNextPageToken('');
      }

      if (!postId) {
        handleClose();
      }
    };

    // router.events.on('routeChangeComplete', verify);

    window.addEventListener('popstate', verify);

    // return () => router.events.off('routeChangeComplete', verify);
    return () => window.removeEventListener('popstate', verify);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (inView && !recommenedPostsLoading) {
      if (nextPageToken) {
        loadRecommendedPosts(nextPageToken);
      } else if (!nextPageToken && recommenedPosts?.length === 0) {
        loadRecommendedPosts();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, nextPageToken, recommenedPostsLoading]);

  return (
    <Modal
      show={open}
      overlayDim
      onClose={() => handleCloseAndGoBack()}
    >
      {postParsed && typeOfPost ? (
        <SPostModalContainer
          onClick={(e) => e.stopPropagation()}
          ref={(el) => {
            modalContainerRef.current = el!!;
          }}
        >
          {renderPostview(typeOfPost)}
          <SRecommendationsSection>
            <Headline
              variant={4}
            >
              { t('RecommendationsSection.heading') }
            </Headline>
            {recommenedPosts && (
              <List
                category=""
                // loading={recommenedPostsLoading}
                loading
                collection={recommenedPosts}
                wrapperStyle={{
                  left: 0,
                }}
                handlePostClicked={handleOpenRecommendedPost}
              />
            )}
            <div
              ref={loadingRef}
              style={{
                position: 'relative',
                bottom: '10px',
              }}
            />
          </SRecommendationsSection>
        </SPostModalContainer>
      ) : null }
    </Modal>
  );
};

PostModal.defaultProps = {
  post: undefined,
  handleOpenAnotherPost: () => {},
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
