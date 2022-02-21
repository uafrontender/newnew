/* eslint-disable no-lonely-if */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import styled, { css, useTheme } from 'styled-components';

import { fetchMoreLikePosts } from '../../../api/endpoints/post';
import { fetchAcOptionById } from '../../../api/endpoints/auction';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';

import Modal from '../Modal';
import Headline from '../../atoms/Headline';
import List from '../search/List';
import PostViewMC from './PostViewMC';
import PostViewAC from './PostViewAC';
import PostViewCF from './PostViewCF';
import PostModerationAC from './PostModerationAC';
import PostModerationCF from './PostModerationCF';
import PostModerationMC from './PostModerationMC';

import isBrowser from '../../../utils/isBrowser';
import { setOverlay } from '../../../redux-store/slices/uiStateSlice';
import switchPostType, { TPostType } from '../../../utils/switchPostType';

interface IPostModal {
  isOpen: boolean;
  post?: newnewapi.IPost;
  manualCurrLocation?: string;
  handleClose: () => void;
  handleOpenAnotherPost?: (post: newnewapi.Post) => void;
}

const PostModal: React.FunctionComponent<IPostModal> = ({
  isOpen,
  post,
  manualCurrLocation,
  handleClose,
  handleOpenAnotherPost,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [postParsed, typeOfPost] = post ? switchPostType(post) : [undefined, undefined];
  const isMyPost = useMemo(
    () => user.loggedIn && user.userData?.userUuid === postParsed?.creator?.uuid,
    [postParsed?.creator?.uuid, user.loggedIn, user.userData?.userUuid]
  );

  const [currLocation] = useState(manualCurrLocation ?? (isBrowser() ? window.location.href : ''));
  const [acSuggestionFromUrl, setAcSuggestionFromUrl] = useState<newnewapi.Auction.Option | undefined>(undefined);
  const acSuggestionIDFromUrl = isBrowser() ? new URL(window.location.href).searchParams.get('suggestion') : undefined;

  const sessionId = isBrowser()
    ? new URL(window.location.href).searchParams.get('?session_id') ||
      new URL(window.location.href).searchParams.get('session_id')
    : undefined;

  const [open, setOpen] = useState(false);

  const modalContainerRef = useRef<HTMLDivElement>();

  // Recommendations (with infinite scroll)
  // NB! Will require a separate endpoint for this one
  const innerHistoryStack = useRef<newnewapi.Post[]>([]);
  const [recommenedPosts, setRecommenedPosts] = useState<newnewapi.Post[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null | undefined>('');
  const [recommenedPostsLoading, setRecommenedPostsLoading] = useState(false);
  const { ref: loadingRef, inView } = useInView();

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
    window.history.pushState(newPostParsed.postUuid, 'Post', `/?post=${newPostParsed.postUuid}`);
    setRecommenedPosts([]);
    setNextPageToken('');
  };

  const loadRecommendedPosts = useCallback(
    async (pageToken?: string) => {
      if (recommenedPostsLoading) return;
      try {
        setRecommenedPostsLoading(true);

        const fetchRecommenedPostsPayload = new newnewapi.GetSimilarPostsRequest({
          postUuid: postParsed?.postUuid,
          ...(pageToken
            ? {
                paging: {
                  pageToken,
                },
              }
            : {}),
        });
        const postsResponse = await fetchMoreLikePosts(fetchRecommenedPostsPayload);

        if (postsResponse.data && postsResponse.data.posts) {
          setRecommenedPosts((curr) => [...curr, ...(postsResponse.data?.posts as newnewapi.Post[])]);
          setNextPageToken(postsResponse.data.paging?.nextPageToken);
        }
        setRecommenedPostsLoading(false);
      } catch (err) {
        setRecommenedPostsLoading(false);
        console.error(err);
      }
    },
    [setRecommenedPosts, recommenedPostsLoading, postParsed]
  );

  const renderPostView = (postToRender: TPostType) => {
    if (postToRender === 'mc') {
      return (
        <PostViewMC
          post={postParsed as newnewapi.MultipleChoice}
          sessionId={sessionId ?? undefined}
          handleGoBack={() => {
            window.history.back();
          }}
        />
      );
    }
    if (postToRender === 'ac') {
      return (
        <PostViewAC
          post={postParsed as newnewapi.Auction}
          optionFromUrl={acSuggestionFromUrl}
          sessionId={sessionId ?? undefined}
          handleGoBack={() => {
            window.history.back();
          }}
        />
      );
    }
    if (postToRender === 'cf') {
      return (
        <PostViewCF
          post={postParsed as newnewapi.Crowdfunding}
          sessionId={sessionId ?? undefined}
          handleGoBack={() => {
            window.history.back();
          }}
        />
      );
    }
    return <div />;
  };

  const renderPostModeration = (postToRender: TPostType) => {
    if (postToRender === 'mc') {
      return (
        <PostModerationMC
          post={postParsed as newnewapi.MultipleChoice}
          handleGoBack={() => {
            window.history.back();
          }}
        />
      );
    }
    if (postToRender === 'ac') {
      return (
        <PostModerationAC
          post={postParsed as newnewapi.Auction}
          handleGoBack={() => {
            window.history.back();
          }}
        />
      );
    }
    if (postToRender === 'cf') {
      return (
        <PostModerationCF
          post={postParsed as newnewapi.Crowdfunding}
          handleGoBack={() => {
            window.history.back();
          }}
        />
      );
    }
    return <div />;
  };

  useEffect(() => {
    if (isOpen && postParsed) {
      setOpen(true);
      window.history.pushState(postParsed.postUuid, 'Post', `/?post=${postParsed.postUuid}`);
    }

    return () => {
      setOpen(false);
      innerHistoryStack.current = [];
      dispatch(setOverlay(false));
      // eslint-disable-next-line no-useless-return
      return;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchSuggestionFromUrl = async () => {
      if (!acSuggestionIDFromUrl) return;
      try {
        const payload = new newnewapi.GetAcOptionRequest({
          optionId: parseInt(acSuggestionIDFromUrl, 10),
        });

        const res = await fetchAcOptionById(payload);

        if (res.data?.option) {
          setAcSuggestionFromUrl(res.data.option as newnewapi.Auction.Option);
          return;
        }
        throw new Error('Could not fetch option from URL');
      } catch (err) {
        console.error(err);
        setAcSuggestionFromUrl(undefined);
      }
    };

    fetchSuggestionFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close modal on back btn
  useEffect(() => {
    const verify = () => {
      if (!isBrowser()) return;

      const postId = new URL(window.location.href).searchParams.get('post');

      if (innerHistoryStack.current && innerHistoryStack.current[innerHistoryStack.current.length - 1]) {
        handleOpenAnotherPost?.(innerHistoryStack.current[innerHistoryStack.current.length - 1]);
        modalContainerRef.current?.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        innerHistoryStack.current = innerHistoryStack.current.slice(0, innerHistoryStack.current.length - 1);
        setRecommenedPosts([]);
        setNextPageToken('');
      }

      if (!postId) {
        handleClose();
      }
    };

    window.addEventListener('popstate', verify);

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
    <Modal show={open} overlayDim onClose={() => handleCloseAndGoBack()}>
      {postParsed && typeOfPost ? (
        <SPostModalContainer
          id="post-modal-container"
          isMyPost={isMyPost}
          onClick={(e) => e.stopPropagation()}
          ref={(el) => {
            modalContainerRef.current = el!!;
          }}
        >
          {isMyPost ? renderPostModeration(typeOfPost) : renderPostView(typeOfPost)}
          {!isMyPost && (
            <SRecommendationsSection>
              <Headline variant={4}>{t('RecommendationsSection.heading')}</Headline>
              {recommenedPosts && (
                <List
                  category=""
                  loading={recommenedPostsLoading}
                  // loading
                  collection={recommenedPosts}
                  // collection={[]}
                  wrapperStyle={{
                    left: '-16px',
                  }}
                  skeletonsBgColor={theme.colorsThemed.background.tertiary}
                  skeletonsHighlightColor={theme.colorsThemed.background.secondary}
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
          )}
        </SPostModalContainer>
      ) : null}
    </Modal>
  );
};

PostModal.defaultProps = {
  post: undefined,
  handleOpenAnotherPost: () => {},
  manualCurrLocation: undefined,
};

export default PostModal;

const SPostModalContainer = styled.div<{
  isMyPost: boolean;
}>`
  position: absolute;

  overflow-y: auto;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  height: 100%;
  width: auto;
  padding: 16px;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    top: 32px;
    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    width: 100%;

    ${({ isMyPost }) =>
      isMyPost
        ? css`
            height: initial;
            max-height: 100%;
          `
        : null}
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
