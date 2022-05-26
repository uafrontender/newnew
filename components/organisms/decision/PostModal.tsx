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
import styled, { css, useTheme } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import {
  fetchMoreLikePosts,
  fetchPostByUUID,
  markPost,
} from '../../../api/endpoints/post';
import { setOverlay } from '../../../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';

import Modal from '../Modal';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import InlineSvg from '../../atoms/InlineSVG';
// Icons
import assets from '../../../constants/assets';
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import ShareIcon from '../../../public/images/svg/icons/filled/Share.svg';
import MoreIcon from '../../../public/images/svg/icons/filled/More.svg';

// Utils
import isBrowser from '../../../utils/isBrowser';
import switchPostType, { TPostType } from '../../../utils/switchPostType';
import switchPostStatus, {
  TPostStatusStringified,
} from '../../../utils/switchPostStatus';
import switchPostStatusString from '../../../utils/switchPostStatusString';
import CommentFromUrlContextProvider, {
  CommentFromUrlContext,
} from '../../../contexts/commentFromUrlContext';
import getDisplayname from '../../../utils/getDisplayname';
import { reportPost } from '../../../api/endpoints/report';
import useSynchronizedHistory from '../../../utils/hooks/useSynchronizedHistory';
import { usePostModalState } from '../../../contexts/postModalContext';
import { ReportData } from '../../molecules/chat/ReportModal';
import useLeavePageConfirm from '../../../utils/hooks/useLeavePageConfirm';

const ListPostModal = dynamic(() => import('../see-more/ListPostModal'));
// Posts views
const PostViewAC = dynamic(() => import('./PostViewAC'));
const PostViewMC = dynamic(() => import('./PostViewMC'));
const PostViewCF = dynamic(() => import('./PostViewCF'));
const PostModerationAC = dynamic(() => import('./PostModerationAC'));
const PostModerationMC = dynamic(() => import('./PostModerationMC'));
const PostModerationCF = dynamic(() => import('./PostModerationCF'));
const PostViewScheduled = dynamic(() => import('./PostViewScheduled'));
const PostViewProcessingAnnouncement = dynamic(
  () => import('./PostViewProcessingAnnouncement')
);
const PostSuccessAC = dynamic(() => import('./PostSuccessAC'));
const PostSuccessMC = dynamic(() => import('./PostSuccessMC'));
const PostSuccessCF = dynamic(() => import('./PostSuccessCF'));
const PostAwaitingResponseAC = dynamic(
  () => import('./PostAwaitingResponseAC')
);
const PostAwaitingResponseMC = dynamic(
  () => import('./PostAwaitingResponseMC')
);
const PostAwaitingResponseCF = dynamic(
  () => import('./PostAwaitingResponseCF')
);
const PostShareModal = dynamic(
  () => import('../../molecules/decision/PostShareModal')
);
const PostShareMenu = dynamic(
  () => import('../../molecules/decision/PostShareMenu')
);
const PostEllipseModal = dynamic(
  () => import('../../molecules/decision/PostEllipseModal')
);
const PostEllipseMenu = dynamic(
  () => import('../../molecules/decision/PostEllipseMenu')
);
const PostFailedBox = dynamic(
  () => import('../../molecules/decision/PostFailedBox')
);
const PostSuccessAnimationBackground = dynamic(
  () => import('../../molecules/decision/PostSuccessAnimationBackground')
);
const ReportModal = dynamic(() => import('../../molecules/chat/ReportModal'));

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

interface IPostModal {
  isOpen: boolean;
  post?: newnewapi.IPost;
  manualCurrLocation?: string;
  handleClose: () => void;
  handleOpenAnotherPost?: (post: newnewapi.Post) => void;
  handleRemovePostFromState?: () => void;
  handleAddPostToState?: () => void;
}

// Memorization does not work
const PostModal: React.FunctionComponent<IPostModal> = ({
  isOpen,
  post,
  manualCurrLocation,
  handleClose,
  handleOpenAnotherPost,
  handleRemovePostFromState,
  handleAddPostToState,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('decision');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { handleSetPostOverlayOpen, isConfirmToClosePost } =
    usePostModalState();
  const { syncedHistoryPushState, syncedHistoryReplaceState } =
    useSynchronizedHistory();

  useLeavePageConfirm(
    isConfirmToClosePost,
    t('PostVideo.cannotLeavePageMsg'),
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

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const [reportPostOpen, setReportPostOpen] = useState(false);

  const handleFollowDecision = useCallback(async () => {
    try {
      if (!user.loggedIn) {
        router.push(
          `/sign-up?reason=follow-decision&redirect=${window.location.href}`
        );
      }
      const markAsViewedPayload = new newnewapi.MarkPostRequest({
        markAs: newnewapi.MarkPostRequest.Kind.FAVORITE,
        postUuid: postParsed?.postUuid,
      });

      const res = await markPost(markAsViewedPayload);

      if (!res.error) {
        setIsFollowingDecision((currentValue) => !currentValue);
      }
    } catch (err) {
      console.error(err);
    }
  }, [postParsed, router, user.loggedIn]);

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

  const handleReportOpen = useCallback(() => {
    if (!user.loggedIn) {
      router.push(
        `/sign-up?reason=report&redirect=${encodeURIComponent(
          window.location.href
        )}`
      );
      return;
    }
    setReportPostOpen(true);
  }, [user, router]);

  const handleReportClose = useCallback(() => {
    setReportPostOpen(false);
  }, []);

  const handleShareClose = useCallback(() => {
    setShareMenuOpen(false);
  }, []);

  const handleEllipseMenuClose = useCallback(() => {
    setEllipseMenuOpen(false);
  }, []);

  const isMyPost = useMemo(
    () =>
      user.loggedIn && user.userData?.userUuid === postParsed?.creator?.uuid,
    [postParsed?.creator?.uuid, user.loggedIn, user.userData?.userUuid]
  );

  const [currLocation] = useState(
    manualCurrLocation ?? (isBrowser() ? window.location.href : '')
  );

  const [sessionId, setSessionId] = useState(() =>
    isBrowser()
      ? new URL(window.location.href).searchParams.get('?session_id') ||
        new URL(window.location.href).searchParams.get('session_id')
      : undefined
  );

  const { handleSetCommentIdFromUrl, handleSetNewCommentContentFromUrl } =
    useContext(CommentFromUrlContext);

  useEffect(() => {
    const commentId = isBrowser()
      ? new URL(window.location.href).searchParams.get('?comment_id') ||
        new URL(window.location.href).searchParams.get('comment_id')
      : undefined;

    const commentContent = isBrowser()
      ? new URL(window.location.href).searchParams.get('?comment_content') ||
        new URL(window.location.href).searchParams.get('comment_content')
      : undefined;

    handleSetCommentIdFromUrl?.(commentId ?? '');
    handleSetNewCommentContentFromUrl?.(commentContent ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetSessionId = useCallback(
    () => setSessionId(undefined),
    [setSessionId]
  );

  const [open, setOpen] = useState(false);

  const modalContainerRef = useRef<HTMLDivElement>();

  // Recommendations (with infinite scroll)
  const innerHistoryStack = useRef<newnewapi.Post[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<newnewapi.Post[]>(
    []
  );
  const [nextPageToken, setNextPageToken] =
    useState<string | null | undefined>('');
  const [recommendedPostsLoading, setRecommendedPostsLoading] = useState(false);
  const [triedLoading, setTriedLoading] = useState(false);
  const { ref: loadingRef, inView } = useInView();

  const handleCloseAndGoBack = () => {
    if (
      isConfirmToClosePost &&
      !window.confirm(t('PostVideo.cannotLeavePageMsg'))
    ) {
      return;
    }
    // Required to avoid wierd cases when navigating back to the post using browser back button
    if (currLocation === 'forced_redirect_to_home') {
      innerHistoryStack.current = [];
      handleClose();
      router.push('/');
      return;
    }

    handleClose();
    syncedHistoryPushState({}, currLocation);
    innerHistoryStack.current = [];
  };

  const handleGoBackInsidePost = useCallback(() => {
    if (
      isConfirmToClosePost &&
      !window.confirm(t('PostVideo.cannotLeavePageMsg'))
    ) {
      return;
    }

    if (innerHistoryStack.current.length !== 0) {
      router.back();
    } else {
      handleClose();
      syncedHistoryPushState({}, currLocation);
    }
  }, [
    currLocation,
    handleClose,
    isConfirmToClosePost,
    router,
    syncedHistoryPushState,
    t,
  ]);

  const handleOpenRecommendedPost = useCallback(
    (newPost: newnewapi.Post) => {
      const newPostParsed = switchPostType(newPost)[0];
      handleOpenAnotherPost?.(newPost);
      if (post !== undefined)
        innerHistoryStack.current.push(post as newnewapi.Post);
      modalContainerRef.current?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      syncedHistoryPushState(
        {
          postId: newPostParsed.postUuid,
        },
        `/post/${newPostParsed.postUuid}`
      );
      setRecommendedPosts([]);
      setNextPageToken('');
      setTriedLoading(false);
    },
    [post, handleOpenAnotherPost, syncedHistoryPushState]
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

  const handleReportSubmit = useCallback(
    async ({ reasons, message }: ReportData) => {
      if (postParsed) {
        await reportPost(postParsed.postUuid, reasons, message).catch((e) =>
          console.error(e)
        );
      }
    },
    [postParsed]
  );

  const renderPostView = (postToRender: TPostType) => {
    if (postStatus === 'scheduled' && postParsed) {
      return (
        <PostViewScheduled
          key={postParsed.postUuid}
          postType={typeOfPost as string}
          post={postParsed}
          postStatus={postStatus}
          variant='decision'
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleRemovePostFromState={handleRemovePostFromState!!}
          handleAddPostToState={handleAddPostToState!!}
          handleReportOpen={handleReportOpen}
        />
      );
    }

    if (postStatus === 'processing_announcement' && postParsed) {
      return (
        <PostViewProcessingAnnouncement
          key={postParsed.postUuid}
          post={postParsed}
          postStatus={postStatus}
          postType={typeOfPost as string}
          variant='decision'
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleRemovePostFromState={handleRemovePostFromState!!}
          handleAddPostToState={handleAddPostToState!!}
          handleReportOpen={handleReportOpen}
        />
      );
    }

    if (postToRender === 'mc' && postParsed) {
      return (
        <PostViewMC
          key={postParsed.postUuid}
          post={postParsed as newnewapi.MultipleChoice}
          postStatus={postStatus}
          sessionId={sessionId ?? undefined}
          resetSessionId={resetSessionId}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleReportOpen={handleReportOpen}
          handleRemovePostFromState={handleRemovePostFromState!!}
          handleAddPostToState={handleAddPostToState!!}
        />
      );
    }
    if (postToRender === 'ac' && postParsed) {
      return (
        <PostViewAC
          key={postParsed.postUuid}
          post={postParsed as newnewapi.Auction}
          postStatus={postStatus}
          sessionId={sessionId ?? undefined}
          resetSessionId={resetSessionId}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleReportOpen={handleReportOpen}
          handleRemovePostFromState={handleRemovePostFromState!!}
          handleAddPostToState={handleAddPostToState!!}
        />
      );
    }
    if (postToRender === 'cf' && postParsed) {
      return (
        <PostViewCF
          key={postParsed.postUuid}
          post={postParsed as newnewapi.Crowdfunding}
          postStatus={postStatus}
          sessionId={sessionId ?? undefined}
          resetSessionId={resetSessionId}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleReportOpen={handleReportOpen}
          handleRemovePostFromState={handleRemovePostFromState!!}
          handleAddPostToState={handleAddPostToState!!}
        />
      );
    }
    return <div />;
  };

  const renderPostWaitingForResponse = (postToRender: TPostType) => {
    if (postToRender === 'ac' && postParsed) {
      return (
        <PostAwaitingResponseAC
          key={postParsed.postUuid}
          post={postParsed as newnewapi.Auction}
        />
      );
    }
    if (postToRender === 'mc' && postParsed) {
      return (
        <PostAwaitingResponseMC
          key={postParsed.postUuid}
          post={postParsed as newnewapi.MultipleChoice}
        />
      );
    }
    if (postToRender === 'cf' && postParsed) {
      return (
        <PostAwaitingResponseCF
          key={postParsed.postUuid}
          post={postParsed as newnewapi.Crowdfunding}
        />
      );
    }
    return <div />;
  };

  const renderPostSuccess = (postToRender: TPostType) => {
    if (postToRender === 'mc' && postParsed) {
      return (
        <PostSuccessMC
          key={postParsed.postUuid}
          post={postParsed as newnewapi.MultipleChoice}
        />
      );
    }
    if (postToRender === 'ac' && postParsed) {
      return (
        <PostSuccessAC
          key={postParsed.postUuid}
          post={postParsed as newnewapi.Auction}
        />
      );
    }
    if (postToRender === 'cf' && postParsed) {
      return (
        <PostSuccessCF
          key={postParsed.postUuid}
          post={postParsed as newnewapi.Crowdfunding}
        />
      );
    }
    return <div />;
  };

  const renderPostModeration = (postToRender: TPostType) => {
    if (postStatus === 'processing_announcement' && postParsed) {
      return (
        <PostViewProcessingAnnouncement
          key={postParsed.postUuid}
          post={postParsed}
          postStatus={postStatus}
          variant='moderation'
          postType={typeOfPost as string}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleRemovePostFromState={handleRemovePostFromState!!}
          handleAddPostToState={handleAddPostToState!!}
          handleReportOpen={handleReportOpen}
        />
      );
    }

    if (postStatus === 'scheduled' && postParsed) {
      return (
        <PostViewScheduled
          key={postParsed.postUuid}
          postType={typeOfPost as string}
          post={postParsed}
          postStatus={postStatus}
          variant='moderation'
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleRemovePostFromState={handleRemovePostFromState!!}
          handleAddPostToState={handleAddPostToState!!}
          handleReportOpen={handleReportOpen}
        />
      );
    }

    if (postToRender === 'mc' && postParsed) {
      return (
        <PostModerationMC
          key={postParsed.postUuid}
          postStatus={postStatus}
          post={postParsed as newnewapi.MultipleChoice}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleRemovePostFromState={handleRemovePostFromState!!}
          handleGoBack={handleGoBackInsidePost}
        />
      );
    }
    if (postToRender === 'ac' && postParsed) {
      return (
        <PostModerationAC
          key={postParsed.postUuid}
          post={postParsed as newnewapi.Auction}
          postStatus={postStatus}
          handleGoBack={handleGoBackInsidePost}
          handleRemovePostFromState={handleRemovePostFromState!!}
          handleUpdatePostStatus={handleUpdatePostStatus}
        />
      );
    }
    if (postToRender === 'cf' && postParsed) {
      return (
        <PostModerationCF
          key={postParsed.postUuid}
          postStatus={postStatus}
          post={postParsed as newnewapi.Crowdfunding}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleRemovePostFromState={handleRemovePostFromState!!}
          handleGoBack={handleGoBackInsidePost}
        />
      );
    }
    return <div />;
  };

  useEffect(() => {
    if (isOpen && postParsed) {
      let additionalHash;
      if (window?.location?.hash === '#comments') {
        additionalHash = '#comments';
      } else if (window?.location?.hash === '#winner') {
        additionalHash = '#winner';
      }
      setOpen(true);

      // Push if opening fresh
      // Replace if coming back from a different page
      const isFromPostPage = !!router?.query?.post_uuid;
      if (!isFromPostPage) {
        syncedHistoryPushState(
          {
            postId: postParsed.postUuid,
          },
          `/post/${postParsed.postUuid}${additionalHash ?? ''}`
        );
      } else {
        syncedHistoryReplaceState(
          {
            postId: postParsed.postUuid,
          },
          `/post/${postParsed.postUuid}${additionalHash ?? ''}`
        );
      }

      setTimeout(() => {
        handleSetPostOverlayOpen(true);
      }, 400);
    }

    return () => {
      setOpen(false);
      handleSetPostOverlayOpen(false);
      innerHistoryStack.current = [];
      dispatch(setOverlay(false));
      // eslint-disable-next-line no-useless-return
      return;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Override next/router default onPopState
  // More: https://nextjs.org/docs/api-reference/next/router#routerbeforepopstate
  useEffect(() => {
    router.beforePopState((state: any) => {
      if (!state.postId) {
        return true;
      }

      if (state.postId && innerHistoryStack.current.length === 0) {
        syncedHistoryReplaceState(
          {
            postId: state.postId,
          },
          `/post/${state.postId}`
        );
        return false;
      }

      return false;
    });

    return () => {
      router.beforePopState(() => {
        return true;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close modal on back btn
  useEffect(() => {
    const verify = async () => {
      if (
        isConfirmToClosePost &&
        !window.confirm(t('PostVideo.cannotLeavePageMsg'))
      ) {
        return;
      }

      if (!isBrowser()) return;

      const postId =
        new URL(window.location.href).searchParams.get('post') ||
        window?.history?.state?.postId;

      // Opening a post when navigating back in browser and having `innerHistoryStack` non-empty
      if (
        innerHistoryStack.current &&
        innerHistoryStack.current[innerHistoryStack.current.length - 1]
      ) {
        handleOpenAnotherPost?.(
          innerHistoryStack.current[innerHistoryStack.current.length - 1]
        );
        modalContainerRef.current?.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        innerHistoryStack.current = innerHistoryStack.current.slice(
          0,
          innerHistoryStack.current.length - 1
        );
        setRecommendedPosts([]);
        setNextPageToken('');
        setTriedLoading(false);
      }

      // Opening a post when navigating back in browser and having `innerHistoryStack` empty
      if (postId && !innerHistoryStack.current.length) {
        const getPostPayload = new newnewapi.GetPostRequest({
          postUuid: postId,
        });

        const { data, error } = await fetchPostByUUID(getPostPayload);

        if (!data || error) {
          handleClose();
          return;
        }

        handleOpenAnotherPost?.(data);
        modalContainerRef.current?.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        setRecommendedPosts([]);
        setNextPageToken('');
        setTriedLoading(false);
      }

      if (!postId) {
        handleClose();
      }
    };

    window.addEventListener('popstate', verify);

    return () => window.removeEventListener('popstate', verify);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isConfirmToClosePost]);

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

  if (shouldRenderVotingFinishedModal && !isMyPost) {
    return (
      <>
        <Modal show={open} overlayDim onClose={() => handleCloseAndGoBack()}>
          {postStatus === 'succeeded' && !isMobile && (
            <PostSuccessAnimationBackground />
          )}
          <Head>
            <title>{postParsed?.title}</title>
          </Head>
          <SPostSuccessWaitingControlsDiv onClick={(e) => e.stopPropagation()}>
            <SWaitingSuccessControlsBtn
              view='secondary'
              iconOnly
              onClick={handleCloseAndGoBack}
            >
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SWaitingSuccessControlsBtn>
            <SWaitingSuccessControlsBtn
              view='secondary'
              iconOnly
              onClick={() => setShareMenuOpen(true)}
            >
              <InlineSvg
                svg={ShareIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SWaitingSuccessControlsBtn>
            <SWaitingSuccessControlsBtn
              view='secondary'
              iconOnly
              onClick={() => setEllipseMenuOpen(true)}
            >
              <InlineSvg
                svg={MoreIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SWaitingSuccessControlsBtn>
            {/* Share menu */}
            {!isMobile && postParsed?.postUuid && (
              <PostShareMenu
                postId={postParsed.postUuid}
                isVisible={shareMenuOpen}
                onClose={handleShareClose}
              />
            )}
            {isMobile && shareMenuOpen && postParsed?.postUuid && (
              <PostShareModal
                isOpen={shareMenuOpen}
                zIndex={11}
                postId={postParsed.postUuid}
                onClose={handleShareClose}
              />
            )}
            {/* Ellipse menu */}
            {!isMobile && (
              <PostEllipseMenu
                postType={typeOfPost as string}
                isFollowingDecision={isFollowingDecision}
                isVisible={ellipseMenuOpen}
                handleFollowDecision={handleFollowDecision}
                handleReportOpen={handleReportOpen}
                onClose={handleEllipseMenuClose}
              />
            )}
            {isMobile && ellipseMenuOpen ? (
              <PostEllipseModal
                postType={typeOfPost as string}
                isFollowingDecision={isFollowingDecision}
                zIndex={11}
                isOpen={ellipseMenuOpen}
                handleFollowDecision={handleFollowDecision}
                handleReportOpen={handleReportOpen}
                onClose={handleEllipseMenuClose}
              />
            ) : null}
          </SPostSuccessWaitingControlsDiv>
          {postParsed && typeOfPost ? (
            <SPostModalContainer
              id='post-modal-container'
              isMyPost={isMyPost}
              loaded={recommendedPosts && recommendedPosts.length > 0}
              style={{
                ...(isMobile
                  ? {
                      paddingTop: 0,
                    }
                  : {}),
              }}
              onClick={(e) => e.stopPropagation()}
              ref={(el) => {
                modalContainerRef.current = el!!;
              }}
            >
              {postStatus === 'succeeded'
                ? renderPostSuccess(typeOfPost)
                : null}
              {postStatus === 'waiting_for_response' ||
              postStatus === 'waiting_for_decision'
                ? renderPostWaitingForResponse(typeOfPost)
                : null}
            </SPostModalContainer>
          ) : null}
        </Modal>
        {postParsed?.creator && reportPostOpen && (
          <ReportModal
            show={reportPostOpen}
            reportedDisplayname={getDisplayname(postParsed?.creator)}
            onSubmit={handleReportSubmit}
            onClose={handleReportClose}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Modal show={open} overlayDim onClose={() => handleCloseAndGoBack()}>
        <Head>
          <title>{postParsed?.title}</title>
        </Head>
        {!isMobile && (
          <SGoBackButtonDesktop
            view='secondary'
            iconOnly
            onClick={handleCloseAndGoBack}
          >
            <InlineSvg
              svg={CancelIcon}
              fill={theme.colorsThemed.text.primary}
              width='24px'
              height='24px'
            />
          </SGoBackButtonDesktop>
        )}
        {postParsed && typeOfPost ? (
          <SPostModalContainer
            loaded={recommendedPosts && recommendedPosts.length > 0}
            id='post-modal-container'
            isMyPost={isMyPost}
            onClick={(e) => e.stopPropagation()}
            ref={(el) => {
              modalContainerRef.current = el!!;
            }}
          >
            {postStatus !== 'deleted_by_admin' &&
            postStatus !== 'deleted_by_creator' ? (
              isMyPost ? (
                renderPostModeration(typeOfPost)
              ) : (
                renderPostView(typeOfPost)
              )
            ) : isMyPost ? (
              <PostFailedBox
                title={t('PostDeletedByMe.title', {
                  postType: t(`postType.${typeOfPost}`),
                })}
                body={
                  deletedByCreator
                    ? t('PostDeletedByMe.body.by_creator', {
                        postType: t(`postType.${typeOfPost}`),
                      })
                    : t('PostDeletedByMe.body.by_admin', {
                        postType: t(`postType.${typeOfPost}`),
                      })
                }
                imageSrc={
                  theme.name === 'light'
                    ? LIGHT_IMAGES[typeOfPost]
                    : DARK_IMAGES[typeOfPost]
                }
                buttonCaption={t('PostDeletedByMe.ctaButton')}
                handleButtonClick={() => {
                  router.push('/creation');
                }}
              />
            ) : (
              <PostFailedBox
                title={t('PostDeleted.title', {
                  postType: t(`postType.${typeOfPost}`),
                })}
                body={
                  deletedByCreator
                    ? t('PostDeleted.body.by_creator', {
                        creator: getDisplayname(postParsed.creator!!),
                        postType: t(`postType.${typeOfPost}`),
                      })
                    : t('PostDeleted.body.by_admin', {
                        creator: getDisplayname(postParsed.creator!!),
                        postType: t(`postType.${typeOfPost}`),
                      })
                }
                buttonCaption={t('PostDeleted.ctaButton', {
                  postTypeMultiple: t(`postType.multiple.${typeOfPost}`),
                })}
                imageSrc={
                  theme.name === 'light'
                    ? LIGHT_IMAGES[typeOfPost]
                    : DARK_IMAGES[typeOfPost]
                }
                style={{
                  marginBottom: '24px',
                }}
                handleButtonClick={() => {
                  document.getElementById('post-modal-container')?.scrollTo({
                    top: document.getElementById(
                      'recommendations-section-heading'
                    )?.offsetTop,
                    behavior: 'smooth',
                  });
                }}
              />
            )}
            {!isMyPost && (
              <SRecommendationsSection
                id='recommendations-section-heading'
                loaded={recommendedPosts && recommendedPosts.length > 0}
              >
                <Headline variant={4}>
                  {recommendedPosts.length > 0
                    ? t('RecommendationsSection.heading')
                    : null}
                </Headline>
                {recommendedPosts && (
                  <ListPostModal
                    loading={recommendedPostsLoading}
                    collection={recommendedPosts}
                    skeletonsBgColor={theme.colorsThemed.background.tertiary}
                    skeletonsHighlightColor={
                      theme.colorsThemed.background.secondary
                    }
                    handlePostClicked={handleOpenRecommendedPost}
                  />
                )}
                <div
                  ref={loadingRef}
                  style={{
                    position: 'relative',
                    bottom: '10px',
                    ...(recommendedPostsLoading
                      ? {
                          display: 'none',
                        }
                      : {}),
                  }}
                />
              </SRecommendationsSection>
            )}
          </SPostModalContainer>
        ) : null}
      </Modal>
      {postParsed?.creator && reportPostOpen && (
        <ReportModal
          show={reportPostOpen}
          reportedDisplayname={getDisplayname(postParsed?.creator)}
          onSubmit={handleReportSubmit}
          onClose={handleReportClose}
        />
      )}
    </>
  );
};

PostModal.defaultProps = {
  post: undefined,
  manualCurrLocation: undefined,
  handleOpenAnotherPost: () => {},
  handleRemovePostFromState: () => {},
  handleAddPostToState: () => {},
};

export default (props: any) => (
  <CommentFromUrlContextProvider>
    <PostModal {...props} />
  </CommentFromUrlContextProvider>
);

const SPostModalContainer = styled.div<{
  isMyPost: boolean;
  loaded: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;

  overflow-y: auto;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  height: 100vh;
  width: 100vw;
  padding: 16px;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  ${({ theme }) => theme.media.tablet} {
    top: 64px;
    /*transform: none; */
    /* top: 50%; */
    /* transform: translateY(-50%); */
    background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? theme.colorsThemed.background.secondary
        : theme.colorsThemed.background.primary};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    width: 100%;
    height: calc(100% - 64px);

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
    height: calc(100% - 32px);
    max-height: ${({ loaded }) => (loaded ? 'unset' : '840px')};

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 24px;

    ${({ isMyPost }) =>
      isMyPost
        ? css`
            height: initial;
            max-height: 100%;
          `
        : null}
  }
`;

const SRecommendationsSection = styled.div<{
  loaded: boolean;
}>`
  min-height: ${({ loaded }) => (loaded ? '600px' : '0')};
`;

const SGoBackButtonDesktop = styled(Button)`
  position: absolute;
  right: 0;
  top: 0;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  border: transparent;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;

  ${({ theme }) => theme.media.laptop} {
    right: 24px;
    top: 32px;
  }
`;

// Waiting and Success
const SPostSuccessWaitingControlsDiv = styled.div`
  position: absolute;
  right: 16px;
  top: 16px;

  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;

  border: transparent;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  z-index: 1000;

  cursor: pointer;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row-reverse;
    gap: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    flex-direction: column;
    gap: 8px;
    right: 24px;
    top: 32px;
  }
`;

const SWaitingSuccessControlsBtn = styled(Button)`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  border: transparent;

  background: #2d2d2d2e;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;

  ${({ theme }) => theme.media.tablet} {
    background: #fdfdfd10;
  }
`;
