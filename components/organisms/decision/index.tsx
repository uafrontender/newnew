/* eslint-disable arrow-body-style */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import { Mixpanel } from '../../../utils/mixpanel';
import switchPostType from '../../../utils/switchPostType';
import switchPostStatus, {
  TPostStatusStringified,
} from '../../../utils/switchPostStatus';
import switchPostStatusString from '../../../utils/switchPostStatusString';
import useLeavePageConfirm from '../../../utils/hooks/useLeavePageConfirm';

import {
  deleteMyPost,
  fetchMoreLikePosts,
  fetchPostByUUID,
  markPost,
} from '../../../api/endpoints/post';
import { useAppSelector } from '../../../redux-store/store';
import { usePostModalState } from '../../../contexts/postModalContext';
import CommentFromUrlContextProvider, {
  CommentFromUrlContext,
} from '../../../contexts/commentFromUrlContext';
import PostModalInnerContextProvider from '../../../contexts/postModalInnerContext';

// Views
import PostModalRegular from './PostModalRegular';
import PostModalModeration from './PostModalModeration';
import PostModalAwaitingSuccess from './PostModalAwaitingSuccess';

interface IPostModal {
  post?: newnewapi.IPost;
  stripeSetupIntentClientSecretFromRedirect?: string;
  saveCardFromRedirect?: boolean;
  commentIdFromUrl?: string;
  commentContentFromUrl?: string;
}

// Memorization does not work
const PostModal: React.FunctionComponent<IPostModal> = ({
  post,
  stripeSetupIntentClientSecretFromRedirect,
  saveCardFromRedirect,
  commentIdFromUrl,
  commentContentFromUrl,
}) => {
  const router = useRouter();
  const { t } = useTranslation('modal-Post');
  const user = useAppSelector((state) => state.user);

  const { isConfirmToClosePost } = usePostModalState();

  useLeavePageConfirm(
    isConfirmToClosePost,
    t('postVideo.cannotLeavePageMsg'),
    []
  );

  const [postParsed, typeOfPost] = post
    ? switchPostType(post)
    : [undefined, undefined];
  const [postStatus, setPostStatus] = useState<TPostStatusStringified>(() => {
    if (typeOfPost && postParsed?.status) {
      if (typeof postParsed.status === 'string') {
        return switchPostStatusString(typeOfPost, postParsed?.status);
      }
      return switchPostStatus(typeOfPost, postParsed?.status);
    }
    return 'processing_announcement';
  });

  // TODO: a way to determine if the post was deleted by the crator themselves
  // pr by an admin
  const deletedByCreator = useMemo(
    () => postStatus === 'deleted_by_creator',
    [postStatus]
  );

  const shouldRenderVotingFinishedModal = useMemo(
    () =>
      postStatus === 'succeeded' ||
      postStatus === 'waiting_for_response' ||
      postStatus === 'waiting_for_decision' ||
      postStatus === 'processing_response',
    [postStatus]
  );

  // Local controls for waiting and success views
  const [isFollowingDecision, setIsFollowingDecision] = useState(
    !!postParsed?.isFavoritedByMe
  );
  const handleSetIsFollowingDecision = (v: boolean) =>
    setIsFollowingDecision(v);

  const handleFollowDecision = useCallback(async () => {
    try {
      Mixpanel.track('Favorite Post', {
        _stage: 'Post',
        _postUuid: postParsed?.postUuid,
      });
      // Redirect only after the persist data is pulled
      if (!user.loggedIn && user._persist?.rehydrated) {
        router.push(
          `/sign-up?reason=follow-decision&redirect=${window.location.href}`
        );
      }
      const markAsFavoritePayload = new newnewapi.MarkPostRequest({
        markAs: !isFollowingDecision
          ? newnewapi.MarkPostRequest.Kind.FAVORITE
          : newnewapi.MarkPostRequest.Kind.NOT_FAVORITE,
        postUuid: postParsed?.postUuid,
      });

      const res = await markPost(markAsFavoritePayload);

      if (!res.error) {
        setIsFollowingDecision((currentValue) => !currentValue);
      }
    } catch (err) {
      console.error(err);
    }
  }, [
    postParsed?.postUuid,
    user.loggedIn,
    user._persist?.rehydrated,
    isFollowingDecision,
    router,
  ]);

  const handleUpdatePostStatus = useCallback(
    (newStatus: number | string) => {
      if (typeOfPost) {
        let status;
        if (typeof newStatus === 'number') {
          status = switchPostStatus(typeOfPost, newStatus);
        } else {
          status = switchPostStatusString(typeOfPost, newStatus);
        }
        setPostStatus(status);
      }
    },
    [typeOfPost]
  );

  const isMyPost = useMemo(
    () =>
      user.loggedIn && user.userData?.userUuid === postParsed?.creator?.uuid,
    [postParsed?.creator?.uuid, user.loggedIn, user.userData?.userUuid]
  );

  const [stripeSetupIntentClientSecret, setStripeSetupIntentClientSecret] =
    useState(() => stripeSetupIntentClientSecretFromRedirect ?? undefined);

  const [saveCard, setSaveCard] = useState(
    () => saveCardFromRedirect ?? undefined
  );

  const { handleSetCommentIdFromUrl, handleSetNewCommentContentFromUrl } =
    useContext(CommentFromUrlContext);

  const [deletePostOpen, setDeletePostOpen] = useState(false);

  const handleOpenDeletePostModal = useCallback(
    () => setDeletePostOpen(true),
    []
  );
  const handleCloseDeletePostModal = useCallback(
    () => setDeletePostOpen(false),
    []
  );

  const handleDeletePost = useCallback(async () => {
    try {
      const payload = new newnewapi.DeleteMyPostRequest({
        postUuid: postParsed?.postUuid,
      });

      const res = await deleteMyPost(payload);

      if (!res.error) {
        handleUpdatePostStatus('DELETED_BY_CREATOR');
        handleCloseDeletePostModal();
      }
    } catch (err) {
      console.error(err);
    }
  }, [
    handleCloseDeletePostModal,
    handleUpdatePostStatus,
    postParsed?.postUuid,
  ]);

  const resetSetupIntentClientSecret = useCallback(() => {
    setStripeSetupIntentClientSecret(undefined);
    setSaveCard(false);
  }, []);

  const modalContainerRef = useRef<HTMLDivElement>();

  // Recommendations (with infinite scroll)
  const [recommendedPosts, setRecommendedPosts] = useState<newnewapi.Post[]>(
    []
  );
  const [nextPageToken, setNextPageToken] = useState<string | null | undefined>(
    ''
  );
  const [recommendedPostsLoading, setRecommendedPostsLoading] = useState(false);
  const [triedLoading, setTriedLoading] = useState(false);
  const { ref: loadingRef, inView } = useInView();

  const handleCloseAndGoBack = useCallback(() => {
    if (
      isConfirmToClosePost &&
      // eslint-disable-next-line no-alert
      !window.confirm(t('postVideo.cannotLeavePageMsg'))
    ) {
      return;
    }
    router.back();
  }, [isConfirmToClosePost, router, t]);

  const handleGoBackInsidePost = useCallback(() => {
    Mixpanel.track('Go Back Inside Post', {
      _stage: 'Post Modal',
    });
    if (
      isConfirmToClosePost &&
      !window.confirm(t('postVideo.cannotLeavePageMsg'))
    ) {
      return;
    }
    router.back();
  }, [isConfirmToClosePost, router, t]);

  const handleSeeNewDeletedBox = useCallback(() => {
    Mixpanel.track('Post Failed Button Click', {
      _stage: 'Post',
    });
    // if (recommendedPosts.length > 0) {
    //   document.getElementById('post-modal-container')?.scrollTo({
    //     top: document.getElementById('recommendations-section-heading')
    //       ?.offsetTop,
    //     behavior: 'smooth',
    //   });
    // } else {
    if (router.pathname === '/') {
      handleCloseAndGoBack();
    } else {
      router.push('/');
    }
    // }
  }, [router, handleCloseAndGoBack]);

  const handleOpenRecommendedPost = useCallback(
    (newPost: newnewapi.Post) => {
      const newPostParsed = switchPostType(newPost)[0];
      Mixpanel.track('Open Another Post', {
        _stage: 'Post',
        _postUuid: newPostParsed.postUuid,
      });
      router.push(`/post/${newPostParsed.postUuid}`);
    },
    [router]
  );

  const loadRecommendedPosts = useCallback(
    async (pageToken?: string) => {
      if (recommendedPostsLoading) return;
      try {
        setRecommendedPostsLoading(true);
        setTriedLoading(true);

        const fetchRecommenedPostsPayload =
          new newnewapi.GetSimilarPostsRequest({
            postUuid: postParsed?.postUuid,
            ...(pageToken
              ? {
                  paging: {
                    pageToken,
                  },
                }
              : {}),
          });
        const postsResponse = await fetchMoreLikePosts(
          fetchRecommenedPostsPayload
        );

        if (postsResponse.data && postsResponse.data.posts) {
          setRecommendedPosts((curr) => [
            ...curr,
            ...(postsResponse.data?.posts as newnewapi.Post[]),
          ]);
          setNextPageToken(postsResponse.data.paging?.nextPageToken);
        }
        setRecommendedPostsLoading(false);
      } catch (err) {
        setRecommendedPostsLoading(false);
        console.error(err);
      }
    },
    [setRecommendedPosts, recommendedPostsLoading, postParsed]
  );

  // Comment ID from URL
  useEffect(() => {
    if (commentIdFromUrl) {
      handleSetCommentIdFromUrl?.(commentIdFromUrl);
    }
    if (commentContentFromUrl) {
      handleSetNewCommentContentFromUrl?.(commentContentFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentIdFromUrl, commentContentFromUrl]);

  // Fetch whether or not the Post is favorited
  useEffect(() => {
    async function fetchIsFavorited() {
      try {
        const fetchPostPayload = new newnewapi.GetPostRequest({
          postUuid: postParsed?.postUuid,
        });

        const res = await fetchPostByUUID(fetchPostPayload);

        if (res.data) {
          setIsFollowingDecision(!!switchPostType(res.data)[0].isFavoritedByMe);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (postParsed?.postUuid) {
      fetchIsFavorited();
    }
  }, [postParsed?.postUuid]);

  // Infinite scroll
  useEffect(() => {
    if (inView && !recommendedPostsLoading) {
      if (nextPageToken) {
        loadRecommendedPosts(nextPageToken);
      } else if (
        !triedLoading &&
        !nextPageToken &&
        recommendedPosts?.length === 0
      ) {
        loadRecommendedPosts();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inView,
    nextPageToken,
    recommendedPostsLoading,
    recommendedPosts.length,
    triedLoading,
  ]);

  // Post status
  useEffect(() => {
    setPostStatus(() => {
      if (typeOfPost && postParsed?.status) {
        if (typeof postParsed.status === 'string') {
          return switchPostStatusString(typeOfPost, postParsed?.status);
        }
        return switchPostStatus(typeOfPost, postParsed?.status);
      }
      return 'processing_announcement';
    });
  }, [postParsed, typeOfPost]);

  // Try to pre-fetch the content
  useEffect(() => {
    router.prefetch('/sign-up');
    router.prefetch('/creation');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PostModalInnerContextProvider
      postParsed={postParsed}
      typeOfPost={typeOfPost}
      postStatus={postStatus}
      handleUpdatePostStatus={handleUpdatePostStatus}
      loadingRef={loadingRef}
      modalContainerRef={modalContainerRef}
      isMyPost={isMyPost}
      deletedByCreator={deletedByCreator}
      handleSeeNewDeletedBox={handleSeeNewDeletedBox}
      recommendedPosts={recommendedPosts}
      recommendedPostsLoading={recommendedPostsLoading}
      handleOpenRecommendedPost={handleOpenRecommendedPost}
      saveCard={saveCard}
      stripeSetupIntentClientSecret={stripeSetupIntentClientSecret}
      resetSetupIntentClientSecret={resetSetupIntentClientSecret}
      handleCloseAndGoBack={handleCloseAndGoBack}
      handleGoBackInsidePost={handleGoBackInsidePost}
      isFollowingDecision={isFollowingDecision}
      handleFollowDecision={handleFollowDecision}
      handleSetIsFollowingDecision={handleSetIsFollowingDecision}
      deletePostOpen={deletePostOpen}
      handleDeletePost={handleDeletePost}
      handleOpenDeletePostModal={handleOpenDeletePostModal}
      handleCloseDeletePostModal={handleCloseDeletePostModal}
    >
      {isMyPost ? (
        // Render Moderation view
        <PostModalModeration />
      ) : shouldRenderVotingFinishedModal ? (
        // Render awaiting response or success view
        <PostModalAwaitingSuccess />
      ) : (
        // Render regular view
        <PostModalRegular />
      )}
    </PostModalInnerContextProvider>
  );
};

PostModal.defaultProps = {
  post: undefined,
};

export default (props: IPostModal) => (
  <CommentFromUrlContextProvider>
    <PostModal {...props} />
  </CommentFromUrlContextProvider>
);
