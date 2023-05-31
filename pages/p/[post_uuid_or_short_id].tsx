/* eslint-disable camelcase */
/* eslint-disable no-nested-ternary */
import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
// import { useInView } from 'react-intersection-observer';
import { validate as validateUuid } from 'uuid';

import {
  deleteMyPost,
  // fetchMoreLikePosts,
  fetchPostByUUID,
  markPost,
  setPostTitle,
} from '../../api/endpoints/post';
import switchPostType, { TPostType } from '../../utils/switchPostType';
import { ChannelsContext } from '../../contexts/channelsContext';
import { SocketContext } from '../../contexts/socketContext';
import switchPostStatusString from '../../utils/switchPostStatusString';
import switchPostStatus, {
  TPostStatusStringified,
} from '../../utils/switchPostStatus';
import { useAppSelector } from '../../redux-store/store';
import useLeavePageConfirm from '../../utils/hooks/useLeavePageConfirm';
import { Mixpanel } from '../../utils/mixpanel';
import CommentFromUrlContextProvider from '../../contexts/commentFromUrlContext';
import PostInnerContextProvider from '../../contexts/postInnerContext';
import { usePushNotifications } from '../../contexts/pushNotificationsContext';

import { NextPageWithLayout } from '../_app';
import GeneralLayout from '../../components/templates/General';
import PostSkeleton from '../../components/organisms/decision/PostSkeleton';
import Post from '../../components/organisms/decision';
import { SUPPORTED_LANGUAGES } from '../../constants/general';
import usePost, {
  TUpdatePostCoverImageMutation,
} from '../../utils/hooks/usePost';
import getDisplayname from '../../utils/getDisplayname';
import { useAppState } from '../../contexts/appStateContext';
import useErrorToasts from '../../utils/hooks/useErrorToasts';
import useCuratedList, {
  useCuratedListSubscription,
} from '../../utils/hooks/useCuratedList';
import useGoBackOrRedirect from '../../utils/useGoBackOrRedirect';

interface IPostPage {
  postUuidOrShortId: string;
  post?: newnewapi.IPost;
  setup_intent_client_secret?: string;
  bundle_setup_intent_client_secret?: string;
  comment_id?: string;
  comment_content?: string;
  custom_option_text?: string;
  save_card?: boolean;
  isServerSide?: boolean;
}

const PostPage: NextPage<IPostPage> = ({
  postUuidOrShortId,
  post,
  setup_intent_client_secret,
  bundle_setup_intent_client_secret,
  custom_option_text,
  comment_id,
  comment_content,
  save_card,
  isServerSide,
}) => {
  const router = useRouter();
  const { goBackOrRedirect } = useGoBackOrRedirect();
  const { t } = useTranslation('page-Post');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppState();
  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();
  const { showErrorToastPredefined } = useErrorToasts();

  // Socket
  const { socketConnection, isSocketConnected } = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const stripeSetupIntentClientSecretFromRedirect = useMemo(
    () => setup_intent_client_secret,
    [setup_intent_client_secret]
  );
  const bundleStripeSetupIntentClientSecretFromRedirect = useMemo(
    () => bundle_setup_intent_client_secret,
    [bundle_setup_intent_client_secret]
  );
  const customOptionFromRedirect = useMemo(
    () => custom_option_text,
    [custom_option_text]
  );
  const saveCardFromRedirect = useMemo(() => save_card, [save_card]);
  const commentIdFromUrl = useMemo(() => comment_id, [comment_id]);
  const commentContentFromUrl = useMemo(
    () => comment_content,
    [comment_content]
  );

  const [isConfirmToClosePost, setIsConfirmToClosePost] = useState(false);

  const handleSetIsConfirmToClosePost = useCallback((newState: boolean) => {
    setIsConfirmToClosePost(newState);
  }, []);

  useLeavePageConfirm(
    isConfirmToClosePost,
    t('postVideo.cannotLeavePageMsg'),
    []
  );

  const {
    data: postFromAjax,
    isLoading: isPostLoading,
    refetch: refetchPost,
    updatePostTitleMutation,
    updatePostCoverImageMutation,
    updatePostStatusMutation,
    updatePostMutation,
  } = usePost(
    {
      loggedInUser: user.loggedIn,
      postUuid: postUuidOrShortId,
    },
    {
      initialData: post,
      onError: (error) => {
        console.error(error);
        router.replace('/404');
      },
      enabled: !post,
      refetchOnWindowFocus: false,
    }
  );

  const [postParsed, typeOfPost] = useMemo<
    | [
        newnewapi.Auction | newnewapi.Crowdfunding | newnewapi.MultipleChoice,
        TPostType
      ]
    | [undefined, undefined]
  >(
    () =>
      postFromAjax
        ? switchPostType(postFromAjax)
        : post
        ? switchPostType(post)
        : [undefined, undefined],
    [post, postFromAjax]
  );

  const [isUpdateTitleLoading, setIsUpdateTitleLoading] = useState(false);
  const handleUpdatePostTitle = useCallback(
    async (newTitle: string) => {
      if (!postParsed?.postUuid) {
        return;
      }
      setIsUpdateTitleLoading(true);
      try {
        const payload = new newnewapi.SetPostTitleRequest({
          postUuid: postParsed?.postUuid,
          updatedTitle: newTitle,
        });

        const res = await setPostTitle(payload);

        if (!res?.data || res.error) {
          throw new Error(res?.error?.message || 'An error occurred');
        }

        updatePostTitleMutation.mutate({
          postUuid: postParsed.postUuid,
          title: newTitle,
        });
      } catch (err) {
        console.error(err);
        showErrorToastPredefined(undefined);
      } finally {
        setIsUpdateTitleLoading(false);
      }
    },
    [postParsed?.postUuid, showErrorToastPredefined, updatePostTitleMutation]
  );

  const handleUpdatePostCoverImage = useCallback(
    async (newCoverImage: TUpdatePostCoverImageMutation) => {
      updatePostCoverImageMutation.mutate(newCoverImage);
    },
    [updatePostCoverImageMutation]
  );

  const handleUpdatePostData = useCallback(
    (updatedPost: newnewapi.IPost) => {
      updatePostMutation.mutate(updatedPost);
    },
    [updatePostMutation]
  );

  const postStatus = useMemo<TPostStatusStringified>(() => {
    if (typeOfPost && postParsed?.status) {
      if (typeof postParsed.status === 'string') {
        // NB! Status can be a string
        // @ts-ignore
        return switchPostStatusString(typeOfPost, postParsed?.status);
      }
      return switchPostStatus(typeOfPost, postParsed?.status);
    }
    return 'processing_announcement';
  }, [postParsed, typeOfPost]);

  // TODO: a way to determine if the post was deleted by the creator themselves
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

      if (!isFollowingDecision) {
        promptUserWithPushNotificationsPermissionModal();
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
    promptUserWithPushNotificationsPermissionModal,
  ]);

  const isMyPost = useMemo(
    () =>
      user.loggedIn && user.userData?.userUuid === postParsed?.creator?.uuid,
    [postParsed?.creator?.uuid, user.loggedIn, user.userData?.userUuid]
  );

  const [stripeSetupIntentClientSecret, setStripeSetupIntentClientSecret] =
    useState(() => stripeSetupIntentClientSecretFromRedirect ?? undefined);

  const [
    bundleStripeSetupIntentClientSecret,
    setBundleStripeSetupIntentClientSecret,
  ] = useState(
    () => bundleStripeSetupIntentClientSecretFromRedirect ?? undefined
  );

  const [customOptionText, setCustomOptionText] = useState(
    customOptionFromRedirect ?? undefined
  );

  const [saveCard, setSaveCard] = useState(
    () => saveCardFromRedirect ?? undefined
  );

  // const { handleSetCommentIdFromUrl, handleSetNewCommentContentFromUrl } =
  //   useContext(CommentFromUrlContext);

  const [deletePostOpen, setDeletePostOpen] = useState(false);

  const handleOpenDeletePostModal = useCallback(
    () => setDeletePostOpen(true),
    []
  );
  const handleCloseDeletePostModal = useCallback(
    () => setDeletePostOpen(false),
    []
  );

  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const handleDeletePost = useCallback(async () => {
    setIsDeletingPost(true);
    try {
      const payload = new newnewapi.DeleteMyPostRequest({
        postUuid: postParsed?.postUuid,
      });

      const res = await deleteMyPost(payload);

      if (!res.error && postParsed?.postUuid && typeOfPost) {
        updatePostStatusMutation.mutate({
          postUuid: postParsed?.postUuid,
          postType: typeOfPost,
          status:
            typeOfPost === 'ac'
              ? newnewapi.Auction.Status.DELETED_BY_CREATOR
              : newnewapi.MultipleChoice.Status.DELETED_BY_CREATOR,
        });
        setIsDeletingPost(false);
        handleCloseDeletePostModal();
        if (document?.documentElement) {
          setTimeout(() => {
            document?.documentElement?.scrollTo({
              top: 0,
            });
          }, 100);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingPost(false);
    }
  }, [
    postParsed?.postUuid,
    typeOfPost,
    updatePostStatusMutation,
    handleCloseDeletePostModal,
  ]);

  const resetSetupIntentClientSecret = useCallback(() => {
    setStripeSetupIntentClientSecret(undefined);
    setSaveCard(false);
  }, []);

  const resetBundleSetupIntentClientSecret = useCallback(() => {
    setBundleStripeSetupIntentClientSecret(undefined);
    setCustomOptionText(undefined);
    setSaveCard(false);
  }, []);

  const modalContainerRef = useRef<HTMLDivElement>();

  // Recommendations (with infinite scroll)
  // const [recommendedPosts, setRecommendedPosts] = useState<newnewapi.Post[]>(
  //   []
  // );
  // const [nextPageToken, setNextPageToken] = useState<string | null | undefined>(
  //   ''
  // );
  // const [recommendedPostsLoading, setRecommendedPostsLoading] = useState(false);
  // const [triedLoading, setTriedLoading] = useState(false);
  // const { ref: loadingRef, inView } = useInView();

  const { data: recommendedPosts, isLoading: recommendedPostsLoading } =
    useCuratedList(
      {
        curatedListType: newnewapi.CuratedListType.MORE_LIKE_THIS,
        loggedInUser: false,
        postId: postParsed?.postUuid,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  useCuratedListSubscription({
    curatedListType: newnewapi.CuratedListType.MORE_LIKE_THIS,
    loggedInUser: false,
    postId: postParsed?.postUuid,
  });

  const handleCloseAndGoBack = useCallback(() => {
    if (
      isConfirmToClosePost &&
      // eslint-disable-next-line no-alert
      !window.confirm(t('postVideo.cannotLeavePageMsg'))
    ) {
      return;
    }
    goBackOrRedirect(`/${postParsed?.creator?.username}`);
  }, [
    isConfirmToClosePost,
    postParsed?.creator?.username,
    t,
    goBackOrRedirect,
  ]);

  const handleGoBackInsidePost = useCallback(() => {
    Mixpanel.track('Go Back Inside Post', {
      _stage: 'Post Modal',
    });
    if (
      isConfirmToClosePost &&
      // eslint-disable-next-line no-alert
      !window.confirm(t('postVideo.cannotLeavePageMsg'))
    ) {
      return;
    }
    goBackOrRedirect(`/${postParsed?.creator?.username}`);
  }, [
    isConfirmToClosePost,
    postParsed?.creator?.username,
    t,
    goBackOrRedirect,
  ]);

  const handleSeeNewDeletedBox = useCallback(() => {
    Mixpanel.track('Post Failed Button Click', {
      _stage: 'Post',
    });
    if (router.pathname === '/') {
      handleCloseAndGoBack();
    } else {
      router.push('/');
    }
    // }
  }, [router, handleCloseAndGoBack]);

  // const handleOpenRecommendedPost = useCallback(
  //   (newPost: newnewapi.Post) => {
  //     const newPostParsed = switchPostType(newPost)[0];
  //     Mixpanel.track('Open Another Post', {
  //       _stage: 'Post',
  //       _postUuid: newPostParsed.postUuid,
  //     });
  //     router.push(
  //       `/p/${
  //         newPostParsed.postShortId
  //           ? newPostParsed.postShortId
  //           : newPostParsed.postUuid
  //       }`
  //     );
  //   },
  //   [router]
  // );

  // const loadRecommendedPosts = useCallback(
  //   async (pageToken?: string) => {
  //     if (recommendedPostsLoading) return;
  //     try {
  //       setRecommendedPostsLoading(true);
  //       setTriedLoading(true);

  //       const fetchRecommenedPostsPayload =
  //         new newnewapi.GetSimilarPostsRequest({
  //           postUuid: postParsed?.postUuid,
  //           ...(pageToken
  //             ? {
  //                 paging: {
  //                   pageToken,
  //                 },
  //               }
  //             : {}),
  //         });
  //       const postsResponse = await fetchMoreLikePosts(
  //         fetchRecommenedPostsPayload
  //       );

  //       if (postsResponse?.data && postsResponse.data.posts) {
  //         setRecommendedPosts((curr) => [
  //           ...curr,
  //           ...(postsResponse.data?.posts as newnewapi.Post[]),
  //         ]);
  //         setNextPageToken(postsResponse.data.paging?.nextPageToken);
  //       }
  //       setRecommendedPostsLoading(false);
  //     } catch (err) {
  //       setRecommendedPostsLoading(false);
  //       console.error(err);
  //     }
  //   },
  //   [setRecommendedPosts, recommendedPostsLoading, postParsed]
  // );

  // Refetch Post if user authenticated
  useEffect(() => {
    if (user.loggedIn) {
      refetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loggedIn]);

  useEffect(() => {
    setIsFollowingDecision(!!postParsed?.isFavoritedByMe);
  }, [postParsed?.isFavoritedByMe]);

  // Comment ID from URL
  useEffect(() => {
    if (commentContentFromUrl || commentIdFromUrl) {
      router.replace(`/p/${postUuidOrShortId}`, undefined, {
        shallow: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentIdFromUrl, commentContentFromUrl]);

  // Mark post as viewed if logged in and not own post
  useEffect(() => {
    const controller = new AbortController();

    async function markAsViewed() {
      if (
        !postParsed?.postUuid ||
        !user.loggedIn ||
        user.userData?.userUuid === postParsed?.creator?.uuid
      ) {
        return;
      }

      try {
        const markAsViewedPayload = new newnewapi.MarkPostRequest({
          markAs: newnewapi.MarkPostRequest.Kind.VIEWED,
          postUuid: postParsed?.postUuid,
        });

        const res = await markPost(markAsViewedPayload, controller.signal);

        if (res.error) throw new Error('Failed to mark post as viewed');
      } catch (err) {
        console.error(err);
      }
    }

    markAsViewed();
    return () => {
      controller.abort();
    };
  }, [
    post,
    postParsed?.postUuid,
    postParsed?.creator?.uuid,
    user.loggedIn,
    user.userData?.userUuid,
  ]);

  // Infinite scroll
  // useEffect(() => {
  //   if (inView && !recommendedPostsLoading) {
  //     if (nextPageToken) {
  //       loadRecommendedPosts(nextPageToken);
  //     } else if (
  //       !triedLoading &&
  //       !nextPageToken &&
  //       recommendedPosts?.length === 0
  //     ) {
  //       loadRecommendedPosts();
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   inView,
  //   nextPageToken,
  //   recommendedPostsLoading,
  //   recommendedPosts.length,
  //   triedLoading,
  // ]);

  // Increment channel subs after mounting
  // Decrement when unmounting
  useEffect(() => {
    if (postParsed?.postUuid && isSocketConnected) {
      addChannel(postParsed.postUuid, {
        postUpdates: {
          postUuid: postParsed.postUuid,
        },
      });
    }

    return () => {
      if (postParsed?.postUuid) {
        removeChannel(postParsed.postUuid);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postParsed?.postUuid, isSocketConnected]);

  // Listen for Post status updates
  useEffect(() => {
    const socketHandlerPostStatus = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostStatusUpdated.decode(arr);

      if (!decoded) {
        return;
      }
      if (decoded.postUuid === postParsed?.postUuid) {
        if (decoded.auction) {
          const parsedStatus = switchPostStatus(
            'ac',
            decoded.auction as newnewapi.Auction.Status
          );

          if (
            parsedStatus === 'deleted_by_admin' ||
            parsedStatus === 'deleted_by_creator'
          ) {
            updatePostStatusMutation.mutate({
              postUuid: postParsed?.postUuid,
              postType: 'ac',
              status: decoded.auction as newnewapi.Auction.Status,
            });
          } else {
            await refetchPost();
          }
        } else if (decoded.multipleChoice) {
          const parsedStatus = switchPostStatus(
            'mc',
            decoded.multipleChoice as newnewapi.MultipleChoice.Status
          );

          if (
            parsedStatus === 'deleted_by_admin' ||
            parsedStatus === 'deleted_by_creator'
          ) {
            updatePostStatusMutation.mutate({
              postUuid: postParsed?.postUuid,
              postType: 'mc',
              status: decoded.multipleChoice as newnewapi.MultipleChoice.Status,
            });
          } else {
            await refetchPost();
          }
        } else {
          await refetchPost();
        }
      }
    };

    if (socketConnection) {
      socketConnection?.on('PostStatusUpdated', socketHandlerPostStatus);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('PostStatusUpdated', socketHandlerPostStatus);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, postParsed, user.userData?.userUuid]);

  // Try to pre-fetch the content
  useEffect(() => {
    router.prefetch('/sign-up');
    router.prefetch('/creation');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const description = useMemo(() => {
    if (typeOfPost === 'ac') {
      const totalInBids = (postParsed.totalAmount?.usdCents ?? 0) / 100;

      if (totalInBids > 0) {
        return t('meta.description.ac.withContributions', {
          totalInBids,
        });
      }

      return t('meta.description.ac.default');
    }

    if (typeOfPost === 'mc') {
      const totalVotes =
        (postParsed as newnewapi.MultipleChoice).totalVotes ?? 0;

      if (totalVotes > 0) {
        return t('meta.description.mc.withContributions', {
          totalVotes,
        });
      }

      return t('meta.description.mc.default');
    }

    return t('meta.description.cf.default');
  }, [typeOfPost, postParsed, t]);

  return (
    <motion.div
      key={postUuidOrShortId}
      initial={{
        x: isMobile && !isServerSide ? 500 : 0,
        y: 0,
        opacity: 0,
      }}
      exit={{
        x: isMobile && !isServerSide ? 500 : 0,
        opacity: 0,
        transition: {
          duration: isMobile ? 0.3 : 0,
        },
      }}
      animate={{
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          duration: isMobile ? 0.6 : 0.4,
        },
      }}
    >
      <PostInnerContextProvider
        key={postUuidOrShortId}
        postParsed={postParsed}
        typeOfPost={typeOfPost}
        postStatus={postStatus}
        // loadingRef={loadingRef}
        modalContainerRef={modalContainerRef}
        isMyPost={isMyPost}
        deletedByCreator={deletedByCreator}
        handleSeeNewDeletedBox={handleSeeNewDeletedBox}
        recommendedPosts={recommendedPosts as newnewapi.Post[]}
        recommendedPostsLoading={recommendedPostsLoading}
        saveCard={saveCard}
        stripeSetupIntentClientSecret={stripeSetupIntentClientSecret}
        resetSetupIntentClientSecret={resetSetupIntentClientSecret}
        bundleStripeSetupIntentClientSecret={
          bundleStripeSetupIntentClientSecret
        }
        customOptionText={customOptionText}
        resetBundleSetupIntentClientSecret={resetBundleSetupIntentClientSecret}
        handleCloseAndGoBack={handleCloseAndGoBack}
        handleGoBackInsidePost={handleGoBackInsidePost}
        isFollowingDecision={isFollowingDecision}
        handleFollowDecision={handleFollowDecision}
        handleSetIsFollowingDecision={handleSetIsFollowingDecision}
        deletePostOpen={deletePostOpen}
        isDeletingPost={isDeletingPost}
        handleDeletePost={handleDeletePost}
        handleOpenDeletePostModal={handleOpenDeletePostModal}
        handleCloseDeletePostModal={handleCloseDeletePostModal}
        handleSetIsConfirmToClosePost={handleSetIsConfirmToClosePost}
        handleUpdatePostTitle={handleUpdatePostTitle}
        handleUpdatePostCoverImage={handleUpdatePostCoverImage}
        handleUpdatePostData={handleUpdatePostData}
        isUpdateTitleLoading={isUpdateTitleLoading}
        refetchPost={refetchPost}
      >
        <Head>
          <title>
            {postParsed
              ? t(`meta.title`, {
                  displayName: getDisplayname(postParsed.creator),
                  postTitle: deletedByCreator
                    ? t('meta.deletedPost')
                    : postParsed.title,
                })
              : ''}
          </title>
          <meta name='description' content={description} />
          <meta
            property='og:title'
            content={
              postParsed
                ? t(`meta.title`, {
                    displayName: getDisplayname(postParsed.creator),
                    postTitle: deletedByCreator
                      ? t('meta.deletedPost')
                      : postParsed.title,
                  })
                : ''
            }
          />
          <meta property='og:description' content={description} />
          <meta
            property='og:url'
            content={`${process.env.NEXT_PUBLIC_APP_URL}/p/${postUuidOrShortId}`}
          />
          <meta
            property='og:image'
            content={
              (postParsed?.announcement?.coverImageUrl ||
                postParsed?.announcement?.thumbnailImageUrl) ??
              ''
            }
          />
        </Head>
        <AnimatePresence exitBeforeEnter>
          {isPostLoading || !postParsed ? (
            <motion.div
              key='loading'
              initial={{
                opacity: 0,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.1,
                },
              }}
              animate={{
                opacity: 1,
                transition: {
                  duration: 0.2,
                },
              }}
            >
              <PostSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key='loaded'
              initial={{
                opacity: 0,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.1,
                },
              }}
              animate={{
                opacity: 1,
                transition: {
                  duration: 0.2,
                },
              }}
            >
              <Post
                isMyPost={isMyPost}
                shouldRenderVotingFinishedModal={
                  shouldRenderVotingFinishedModal
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </PostInnerContextProvider>
    </motion.div>
  );
};

export default PostPage;

(PostPage as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <GeneralLayout noMobileNavigation noPaddingMobile>
    <CommentFromUrlContextProvider
      commentIdFromUrl={page?.props?.comment_id || undefined}
      commentContentFromUrl={page?.props?.comment_content || undefined}
    >
      <AnimatePresence>
        <React.Fragment key={page.props.postUuidOrShortId}>
          {page}
        </React.Fragment>
      </AnimatePresence>
    </CommentFromUrlContextProvider>
  </GeneralLayout>
);

export const getServerSideProps: GetServerSideProps<IPostPage> = async (
  context
) => {
  try {
    const {
      post_uuid_or_short_id,
      setup_intent_client_secret,
      comment_id,
      comment_content,
      save_card,
      bundle,
      custom_option_text,
    } = context.query;
    const translationContext = await serverSideTranslations(
      context.locale!!,
      [
        'common',
        'page-Post',
        'modal-ResponseSuccessModal',
        'component-PostCard',
        'modal-PaymentModal',
        'modal-EditPostTitle',
        'page-Creation',
      ],
      null,
      SUPPORTED_LANGUAGES
    );

    if (!post_uuid_or_short_id || Array.isArray(post_uuid_or_short_id)) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    if (!context.req.url?.startsWith('/_next')) {
      const getPostPayload = new newnewapi.GetPostRequest({
        postUuid: post_uuid_or_short_id,
      });

      const res = await fetchPostByUUID(
        getPostPayload,
        undefined,
        context.req.cookies?.accessToken ?? undefined
      );

      if (!res?.data || res.error) {
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }

      if (
        validateUuid(post_uuid_or_short_id) &&
        !!switchPostType(res.data)[0].postShortId
      ) {
        let queryString = '';
        const queryObject = {
          ...(setup_intent_client_secret &&
          !Array.isArray(setup_intent_client_secret)
            ? bundle
              ? {
                  bundle_setup_intent_client_secret: setup_intent_client_secret,
                }
              : {
                  setup_intent_client_secret,
                }
            : {}),
          ...(comment_id && !Array.isArray(comment_id)
            ? {
                comment_id,
              }
            : {}),
          ...(comment_content && !Array.isArray(comment_content)
            ? {
                comment_content,
              }
            : {}),
          ...(save_card && !Array.isArray(save_card)
            ? {
                save_card,
              }
            : {}),
          ...(custom_option_text && !Array.isArray(custom_option_text)
            ? { custom_option_text }
            : {}),
        };

        if (Object.keys(queryObject).length !== 0) {
          queryString = `?${new URLSearchParams(
            queryObject as any
          ).toString()}`;
        }

        return {
          redirect: {
            destination: `/p/${
              switchPostType(res.data)[0].postShortId
            }${queryString}`,
            permanent: true,
          },
        };
      }

      if (!context.req.cookies?.accessToken) {
        // cache the response only if the post is found and no redirect applies
        context.res.setHeader(
          'Cache-Control',
          'public, s-maxage=5, stale-while-revalidate=10'
        );
      }

      return {
        props: {
          postUuidOrShortId: post_uuid_or_short_id,
          isServerSide: true,
          post: res.data.toJSON() as newnewapi.IPost,
          ...(setup_intent_client_secret &&
          !Array.isArray(setup_intent_client_secret)
            ? bundle
              ? {
                  bundle_setup_intent_client_secret: setup_intent_client_secret,
                }
              : {
                  setup_intent_client_secret,
                }
            : {}),
          ...(save_card && !Array.isArray(save_card)
            ? {
                save_card: save_card === 'true',
              }
            : {}),
          ...(comment_id && !Array.isArray(comment_id)
            ? {
                comment_id,
              }
            : {}),
          ...(comment_content && !Array.isArray(comment_content)
            ? {
                comment_content,
              }
            : {}),
          ...(custom_option_text && !Array.isArray(custom_option_text)
            ? { custom_option_text }
            : {}),
          ...translationContext,
        },
      };
    }

    return {
      props: {
        postUuidOrShortId: post_uuid_or_short_id,
        isServerSide: false,
        ...(setup_intent_client_secret &&
        !Array.isArray(setup_intent_client_secret)
          ? bundle
            ? {
                bundle_setup_intent_client_secret: setup_intent_client_secret,
              }
            : {
                setup_intent_client_secret,
              }
          : {}),
        ...(save_card && !Array.isArray(save_card)
          ? {
              save_card: save_card === 'true',
            }
          : {}),
        ...(comment_id && !Array.isArray(comment_id)
          ? {
              comment_id,
            }
          : {}),
        ...(comment_content && !Array.isArray(comment_content)
          ? {
              comment_content,
            }
          : {}),
        ...(custom_option_text && !Array.isArray(custom_option_text)
          ? { custom_option_text }
          : {}),
        ...translationContext,
      },
    };
  } catch {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};
