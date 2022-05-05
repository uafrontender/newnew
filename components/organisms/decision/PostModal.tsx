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

import {
  fetchMoreLikePosts,
  fetchPostByUUID,
  markPost,
} from '../../../api/endpoints/post';
import { fetchAcOptionById } from '../../../api/endpoints/auction';
import { setOverlay } from '../../../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';

import Modal from '../Modal';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import InlineSvg from '../../atoms/InlineSVG';
import ListPostModal from '../see-more/ListPostModal';
// Posts views
import PostViewAC from './PostViewAC';
import PostViewMC from './PostViewMC';
import PostViewCF from './PostViewCF';
import PostModerationAC from './PostModerationAC';
import PostModerationMC from './PostModerationMC';
import PostModerationCF from './PostModerationCF';
import PostViewScheduled from './PostViewScheduled';
import PostViewProcessing from './PostViewProcessing';
import PostSuccessAC from './PostSuccessAC';
import PostSuccessMC from './PostSuccessMC';
import PostSuccessCF from './PostSuccessCF';
import PostAwaitingResponseAC from './PostAwaitingResponseAC';
import PostAwaitingResponseMC from './PostAwaitingResponseMC';
import PostAwaitingResponseCF from './PostAwaitingResponseCF';
import PostShareModal from '../../molecules/decision/PostShareModal';
import PostShareMenu from '../../molecules/decision/PostShareMenu';
import PostEllipseModal from '../../molecules/decision/PostEllipseModal';
import PostEllipseMenu from '../../molecules/decision/PostEllipseMenu';
import PostFailedBox from '../../molecules/decision/PostFailedBox';
import PostSuccessAnimationBackground from './PostSuccessAnimationBackground';

// Icons
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import ShareIcon from '../../../public/images/svg/icons/filled/Share.svg';
import MoreIcon from '../../../public/images/svg/icons/filled/More.svg';
import MCIcon from '../../../public/images/creation/MC.webp';
import ACIcon from '../../../public/images/creation/AC.webp';
import CFIcon from '../../../public/images/creation/CF.webp';

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
import { FollowingsContext } from '../../../contexts/followingContext';
import { markUser } from '../../../api/endpoints/user';
import getDisplayname from '../../../utils/getDisplayname';
import ReportModal, { ReportData } from '../../molecules/chat/ReportModal';
import { reportPost } from '../../../api/endpoints/report';
import useSynchronizedHistory from '../../../utils/hooks/useSynchronizedHistory';
import { usePostModalState } from '../../../contexts/postModalContext';

const images = {
  ac: ACIcon.src,
  mc: MCIcon.src,
  cf: CFIcon.src,
};

interface IPostModal {
  isOpen: boolean;
  post?: newnewapi.IPost;
  manualCurrLocation?: string;
  handleClose: () => void;
  handleOpenAnotherPost?: (post: newnewapi.Post) => void;
}

// Memorization does not work
const PostModal: React.FunctionComponent<IPostModal> = ({
  isOpen,
  post,
  manualCurrLocation,
  handleClose,
  handleOpenAnotherPost,
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

  const { handleSetPostOverlayOpen } = usePostModalState();
  const { syncedHistoryPushState, syncedHistoryReplaceState } =
    useSynchronizedHistory();

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
  const deletedByCreator = useMemo(() => true, []);

  const shouldRenderVotingFinishedModal = useMemo(
    () =>
      postStatus === 'succeeded' ||
      postStatus === 'waiting_for_response' ||
      postStatus === 'waiting_for_decision' ||
      postStatus === 'processing_response',
    [postStatus]
  );

  // Local controls for wairting and success views
  const { followingsIds, addId, removeId } = useContext(FollowingsContext);
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

  const handleToggleFollowingCreator = useCallback(async () => {
    try {
      if (!user.loggedIn) {
        router.push(
          `/sign-up?reason=follow-creator&redirect=${window.location.href}`
        );
      }

      const payload = new newnewapi.MarkUserRequest({
        userUuid: postParsed?.creator?.uuid,
        markAs: followingsIds.includes(postParsed?.creator?.uuid as string)
          ? newnewapi.MarkUserRequest.MarkAs.NOT_FOLLOWED
          : newnewapi.MarkUserRequest.MarkAs.FOLLOWED,
      });

      const res = await markUser(payload);

      if (res.error) throw new Error(res.error?.message ?? 'Request failed');

      if (followingsIds.includes(postParsed?.creator?.uuid as string)) {
        removeId(postParsed?.creator?.uuid as string);
      } else {
        addId(postParsed?.creator?.uuid as string);
      }
    } catch (err) {
      console.error(err);
    }
  }, [addId, followingsIds, postParsed, removeId, router, user.loggedIn]);

  const handleUpdatePostStatus = useCallback(
    (newStatus: number | string) => {
      let status;
      if (typeof newStatus === 'number') {
        status = switchPostStatus(typeOfPost!!, newStatus);
      } else {
        status = switchPostStatusString(typeOfPost!!, newStatus);
      }
      setPostStatus(status);
    },
    [typeOfPost]
  );

  const handleReportOpen = useCallback(() => {
    setReportPostOpen(true);
  }, []);

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
  const [acSuggestionFromUrl, setAcSuggestionFromUrl] =
    useState<newnewapi.Auction.Option | undefined>(undefined);
  const acSuggestionIDFromUrl = isBrowser()
    ? new URL(window.location.href).searchParams.get('suggestion')
    : undefined;

  const [sessionId, setSessionId] = useState(() =>
    isBrowser()
      ? new URL(window.location.href).searchParams.get('?session_id') ||
        new URL(window.location.href).searchParams.get('session_id')
      : undefined
  );

  const { handleSetCommentIdFromUrl } = useContext(CommentFromUrlContext);

  useEffect(() => {
    const commentId = isBrowser()
      ? new URL(window.location.href).searchParams.get('?comment_id') ||
        new URL(window.location.href).searchParams.get('comment_id')
      : undefined;

    handleSetCommentIdFromUrl?.(commentId ?? '');
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
  const [recommenedPosts, setRecommenedPosts] = useState<newnewapi.Post[]>([]);
  const [nextPageToken, setNextPageToken] =
    useState<string | null | undefined>('');
  const [recommenedPostsLoading, setRecommenedPostsLoading] = useState(false);
  const [triedLoading, setTriedLoading] = useState(false);
  const { ref: loadingRef, inView } = useInView();

  const handleCloseAndGoBack = () => {
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
    if (innerHistoryStack.current.length !== 0) {
      router.back();
    } else {
      handleClose();
      syncedHistoryPushState({}, currLocation);
    }
  }, [currLocation, handleClose, router, syncedHistoryPushState]);

  const handleOpenRecommendedPost = (newPost: newnewapi.Post) => {
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
    setRecommenedPosts([]);
    setNextPageToken('');
    setTriedLoading(false);
  };

  const loadRecommendedPosts = useCallback(
    async (pageToken?: string) => {
      if (recommenedPostsLoading) return;
      try {
        setRecommenedPostsLoading(true);
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
          setRecommenedPosts((curr) => [
            ...curr,
            ...(postsResponse.data?.posts as newnewapi.Post[]),
          ]);
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

  const handleReportSubmit = useCallback(
    async ({ reason, message }: ReportData) => {
      if (postParsed) {
        await reportPost(postParsed.postUuid, reason, message).catch((e) =>
          console.error(e)
        );
      }

      setReportPostOpen(false);
    },
    [postParsed]
  );

  const renderPostView = (postToRender: TPostType) => {
    if (postStatus === 'scheduled') {
      return (
        <PostViewScheduled
          key={postParsed?.postUuid}
          postType={postToRender}
          post={postParsed!!}
          postStatus={postStatus}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleReportOpen={handleReportOpen}
        />
      );
    }

    if (postStatus === 'processing_announcement') {
      return (
        <PostViewProcessing
          key={postParsed?.postUuid}
          post={postParsed!!}
          postStatus={postStatus}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleReportOpen={handleReportOpen}
        />
      );
    }

    if (postToRender === 'mc') {
      return (
        <PostViewMC
          key={postParsed?.postUuid}
          post={postParsed as newnewapi.MultipleChoice}
          postStatus={postStatus}
          sessionId={sessionId ?? undefined}
          resetSessionId={resetSessionId}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleReportOpen={handleReportOpen}
        />
      );
    }
    if (postToRender === 'ac') {
      return (
        <PostViewAC
          key={postParsed?.postUuid}
          post={postParsed as newnewapi.Auction}
          postStatus={postStatus}
          optionFromUrl={acSuggestionFromUrl}
          sessionId={sessionId ?? undefined}
          resetSessionId={resetSessionId}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleReportOpen={handleReportOpen}
        />
      );
    }
    if (postToRender === 'cf') {
      return (
        <PostViewCF
          key={postParsed?.postUuid}
          post={postParsed as newnewapi.Crowdfunding}
          postStatus={postStatus}
          sessionId={sessionId ?? undefined}
          resetSessionId={resetSessionId}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleReportOpen={handleReportOpen}
        />
      );
    }
    return <div />;
  };

  const renderPostWaitingForResponse = (postToRender: TPostType) => {
    if (postToRender === 'ac') {
      return (
        <PostAwaitingResponseAC
          key={postParsed?.postUuid}
          post={postParsed as newnewapi.Auction}
        />
      );
    }
    if (postToRender === 'mc') {
      return (
        <PostAwaitingResponseMC
          key={postParsed?.postUuid}
          post={postParsed as newnewapi.MultipleChoice}
        />
      );
    }
    if (postToRender === 'cf') {
      return (
        <PostAwaitingResponseCF
          key={postParsed?.postUuid}
          post={postParsed as newnewapi.Crowdfunding}
        />
      );
    }
    return <div />;
  };

  const renderPostSuccess = (postToRender: TPostType) => {
    if (postToRender === 'mc') {
      return (
        <PostSuccessMC
          key={postParsed?.postUuid}
          post={postParsed as newnewapi.MultipleChoice}
        />
      );
    }
    if (postToRender === 'ac') {
      return (
        <PostSuccessAC
          key={postParsed?.postUuid}
          post={postParsed as newnewapi.Auction}
        />
      );
    }
    if (postToRender === 'cf') {
      return (
        <PostSuccessCF
          key={postParsed?.postUuid}
          post={postParsed as newnewapi.Crowdfunding}
        />
      );
    }
    return <div />;
  };

  const renderPostModeration = (postToRender: TPostType) => {
    if (postStatus === 'processing_announcement') {
      return (
        <PostViewProcessing
          key={postParsed?.postUuid}
          post={postParsed!!}
          postStatus={postStatus}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleReportOpen={handleReportOpen}
        />
      );
    }

    if (postToRender === 'mc') {
      return (
        <PostModerationMC
          key={postParsed?.postUuid}
          postStatus={postStatus}
          post={postParsed as newnewapi.MultipleChoice}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleGoBack={handleGoBackInsidePost}
        />
      );
    }
    if (postToRender === 'ac') {
      return (
        <PostModerationAC
          key={postParsed?.postUuid}
          post={postParsed as newnewapi.Auction}
          postStatus={postStatus}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
        />
      );
    }
    if (postToRender === 'cf') {
      return (
        <PostModerationCF
          key={postParsed?.postUuid}
          postStatus={postStatus}
          post={postParsed as newnewapi.Crowdfunding}
          handleUpdatePostStatus={handleUpdatePostStatus}
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

  useEffect(() => {
    const fetchSuggestionFromUrl = async () => {
      if (!acSuggestionIDFromUrl) return;
      try {
        const payload = new newnewapi.GetAcOptionRequest({
          optionId: parseInt(acSuggestionIDFromUrl),
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
    const verify = async () => {
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
        setRecommenedPosts([]);
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
        setRecommenedPosts([]);
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
  }, [open]);

  useEffect(() => {
    if (inView && !recommenedPostsLoading) {
      if (nextPageToken) {
        loadRecommendedPosts(nextPageToken);
      } else if (
        !triedLoading &&
        !nextPageToken &&
        recommenedPosts?.length === 0
      ) {
        loadRecommendedPosts();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inView,
    nextPageToken,
    recommenedPostsLoading,
    recommenedPosts.length,
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
            {!isMobile && (
              <PostShareMenu
                postId={postParsed?.postUuid!!}
                isVisible={shareMenuOpen}
                onClose={handleShareClose}
              />
            )}
            {isMobile && shareMenuOpen ? (
              <PostShareModal
                isOpen={shareMenuOpen}
                zIndex={11}
                postId={postParsed?.postUuid!!}
                onClose={handleShareClose}
              />
            ) : null}
            {/* Ellipse menu */}
            {!isMobile && (
              <PostEllipseMenu
                postType={typeOfPost as string}
                isFollowing={followingsIds.includes(
                  postParsed?.creator?.uuid as string
                )}
                isFollowingDecision={isFollowingDecision}
                isVisible={ellipseMenuOpen}
                handleFollowDecision={handleFollowDecision}
                handleToggleFollowingCreator={handleToggleFollowingCreator}
                handleReportOpen={handleReportOpen}
                onClose={handleEllipseMenuClose}
              />
            )}
            {isMobile && ellipseMenuOpen ? (
              <PostEllipseModal
                postType={typeOfPost as string}
                isFollowing={followingsIds.includes(
                  postParsed?.creator?.uuid as string
                )}
                isFollowingDecision={isFollowingDecision}
                zIndex={11}
                isOpen={ellipseMenuOpen}
                handleFollowDecision={handleFollowDecision}
                handleToggleFollowingCreator={handleToggleFollowingCreator}
                handleReportOpen={handleReportOpen}
                onClose={handleEllipseMenuClose}
              />
            ) : null}
          </SPostSuccessWaitingControlsDiv>
          {postParsed && typeOfPost ? (
            <SPostModalContainer
              id='post-modal-container'
              isMyPost={isMyPost}
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
        {postParsed?.creator && (
          <ReportModal
            show={reportPostOpen}
            reportedDisplayname={getDisplayname(postParsed?.creator)}
            onSubmit={async ({ reason, message }) => {
              if (postParsed) {
                await reportPost(postParsed.postUuid, reason, message).catch(
                  (e) => console.error(e)
                );
              }

              setReportPostOpen(false);
            }}
            onClose={() => setReportPostOpen(false)}
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
            id='post-modal-container'
            isMyPost={isMyPost}
            onClick={(e) => e.stopPropagation()}
            ref={(el) => {
              modalContainerRef.current = el!!;
            }}
          >
            {postStatus !== 'deleted' ? (
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
                imageSrc={images[typeOfPost]}
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
                imageSrc={images[typeOfPost]}
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
              <SRecommendationsSection id='recommendations-section-heading'>
                <Headline variant={4}>
                  {recommenedPosts.length > 0
                    ? t('RecommendationsSection.heading')
                    : null}
                </Headline>
                {recommenedPosts && (
                  <ListPostModal
                    category=''
                    loading={recommenedPostsLoading}
                    collection={recommenedPosts}
                    wrapperStyle={{
                      left: '-16px',
                    }}
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
                    ...(recommenedPostsLoading
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
      {postParsed?.creator && (
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
  handleOpenAnotherPost: () => {},
  manualCurrLocation: undefined,
};

export default (props: any) => (
  <CommentFromUrlContextProvider>
    <PostModal {...props} />
  </CommentFromUrlContextProvider>
);

const SPostModalContainer = styled.div<{
  isMyPost: boolean;
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
    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
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

const SRecommendationsSection = styled.div`
  min-height: 600px;
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
