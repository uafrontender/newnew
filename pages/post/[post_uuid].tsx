/* eslint-disable no-lonely-if */
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
import { useInView } from 'react-intersection-observer';

import {
  deleteMyPost,
  fetchMoreLikePosts,
  fetchPostByUUID,
  markPost,
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
import CommentFromUrlContextProvider, {
  CommentFromUrlContext,
} from '../../contexts/commentFromUrlContext';
import PostInnerContextProvider from '../../contexts/postInnerContext';

import { NextPageWithLayout } from '../_app';
import GeneralLayout from '../../components/templates/General';
import PostSkeleton from '../../components/organisms/decision/PostSkeleton';
import Post from '../../components/organisms/decision';
import { SUPPORTED_LANGUAGES } from '../../constants/general';

interface IPostPage {
  postUuid: string;
  post?: newnewapi.Post;
  setup_intent_client_secret?: string;
  comment_id?: string;
  comment_content?: string;
  save_card?: boolean;
  isServerSide?: boolean;
}

const PostPage: NextPage<IPostPage> = ({
  postUuid,
  post,
  setup_intent_client_secret,
  comment_id,
  comment_content,
  save_card,
  isServerSide,
}) => {
  const router = useRouter();
  const { t } = useTranslation('page-Post');
  const { user, ui } = useAppSelector((state) => state);

  // Socket
  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    ui.resizeMode
  );

  const stripeSetupIntentClientSecretFromRedirect = useMemo(
    () => setup_intent_client_secret,
    [setup_intent_client_secret]
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

  const [postFromAjax, setPostFromAjax] = useState<newnewapi.Post | undefined>(
    undefined
  );
  const [isPostLoading, setIsPostLoading] = useState(!post);

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

  useEffect(() => {
    async function fetchPost() {
      try {
        setIsPostLoading(true);
        const getPostPayload = new newnewapi.GetPostRequest({
          postUuid,
        });

        const res = await fetchPostByUUID(getPostPayload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Post not found');

        setPostFromAjax(res.data);

        setIsPostLoading(false);
      } catch (err) {
        console.error(err);
        router.replace('/404');
      }
    }

    if (!post) {
      // console.log('Fetching post');
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    if (window.history.state && window.history.state.idx > 0) {
      router.back();
    } else {
      router.push(`/${postParsed?.creator?.username}`);
    }
  }, [isConfirmToClosePost, postParsed?.creator?.username, router, t]);

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
    if (window.history.state && window.history.state.idx > 0) {
      router.back();
    } else {
      router.push(`/${postParsed?.creator?.username}`);
    }
  }, [isConfirmToClosePost, postParsed?.creator?.username, router, t]);

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

      router.replace(`/post/${postUuid}`, undefined, {
        shallow: true,
      });
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

  // Increment channel subs after mounting
  // Decrement when unmounting
  useEffect(() => {
    if (postParsed?.postUuid && socketConnection?.connected) {
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
  }, [postParsed?.postUuid, socketConnection?.connected]);

  // Listen for Post status updates
  useEffect(() => {
    const socketHandlerPostStatus = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostStatusUpdated.decode(arr);

      if (!decoded) return;
      if (decoded.postUuid === postParsed?.postUuid) {
        if (decoded.auction) {
          handleUpdatePostStatus(decoded.auction);
        } else if (decoded.multipleChoice) {
          handleUpdatePostStatus(decoded.multipleChoice);
        } else {
          if (decoded.crowdfunding)
            handleUpdatePostStatus(decoded.crowdfunding);
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

  return (
    <motion.div
      key={postUuid}
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
        key={postUuid}
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
        handleSetIsConfirmToClosePost={handleSetIsConfirmToClosePost}
      >
        <Head>
          <title>{typeOfPost ? t(`meta.${typeOfPost}.title`) : ''}</title>
          <meta
            name='description'
            content={typeOfPost ? t(`meta.${typeOfPost}.description`) : ''}
          />
          <meta property='og:title' content={postParsed?.title} />
          <meta
            property='og:url'
            content={`${process.env.NEXT_PUBLIC_APP_URL}/post/${postUuid}`}
          />
          <meta
            property='og:image'
            content={postParsed?.announcement?.thumbnailImageUrl ?? ''}
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
  <GeneralLayout noMobieNavigation noPaddingMobile>
    <CommentFromUrlContextProvider>
      <AnimatePresence>
        <React.Fragment key={page.props.postUuid}>{page}</React.Fragment>
      </AnimatePresence>
    </CommentFromUrlContextProvider>
  </GeneralLayout>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    post_uuid,
    setup_intent_client_secret,
    comment_id,
    comment_content,
    save_card,
  } = context.query;
  const translationContext = await serverSideTranslations(
    context.locale!!,
    [
      'common',
      'page-Post',
      'modal-ResponseSuccessModal',
      'component-PostCard',
      'modal-PaymentModal',
    ],
    null,
    SUPPORTED_LANGUAGES
  );

  if (!post_uuid || Array.isArray(post_uuid)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  if (!context.req.url?.startsWith('/_next')) {
    // console.log('I am from direct link, making SSR request');

    const getPostPayload = new newnewapi.GetPostRequest({
      postUuid: post_uuid,
    });

    const res = await fetchPostByUUID(
      getPostPayload,
      undefined,
      context.req.cookies?.accessToken ?? undefined
    );

    if (!res.data || res.error) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: {
        postUuid: post_uuid,
        isServerSide: true,
        post: res.data.toJSON(),
        ...(setup_intent_client_secret
          ? {
              setup_intent_client_secret,
            }
          : {}),
        ...(save_card
          ? {
              save_card: save_card === 'true',
            }
          : {}),
        ...(comment_id
          ? {
              comment_id,
            }
          : {}),
        ...(comment_content
          ? {
              comment_content,
            }
          : {}),
        ...translationContext,
      },
    };
  }

  // console.log('I am from next router, no SSR needed');

  return {
    props: {
      postUuid: post_uuid,
      isServerSide: false,
      ...(setup_intent_client_secret
        ? {
            setup_intent_client_secret,
          }
        : {}),
      ...(save_card
        ? {
            save_card: save_card === 'true',
          }
        : {}),
      ...(comment_id
        ? {
            comment_id,
          }
        : {}),
      ...(comment_content
        ? {
            comment_content,
          }
        : {}),
      ...translationContext,
    },
  };
};
