/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { fetchMoreLikePosts } from '../../../api/endpoints/post';
import { fetchAcOptionById } from '../../../api/endpoints/auction';
import { setOverlay } from '../../../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';

import Modal from '../Modal';
import List from '../search/List';
import Headline from '../../atoms/Headline';
import InlineSvg from '../../atoms/InlineSVG';
import PostFailedBox from '../../molecules/decision/PostFailedBox';
// Posts views
import PostViewAC from './PostViewAC';
import PostViewMC from './PostViewMC';
import PostViewCF from './PostViewCF';
import PostModerationAC from './PostModerationAC';
import PostModerationMC from './PostModerationMC';
import PostModerationCF from './PostModerationCF';
import PostViewScheduled from './PostViewScheduled';
import PostViewProcessing from './PostViewProcessing';

// Icons
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';

// Utils
import isBrowser from '../../../utils/isBrowser';
import switchPostType, { TPostType } from '../../../utils/switchPostType';
import switchPostStatus, { TPostStatusStringified } from '../../../utils/switchPostStatus';
import switchPostStatusString from '../../../utils/switchPostStatusString';

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
  const router = useRouter();
  const { t } = useTranslation('decision');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [postParsed, typeOfPost] = post ? switchPostType(post) : [undefined, undefined];
  const [postStatus, setPostStatus] = useState<TPostStatusStringified>(() => {
    if (typeOfPost && postParsed?.status) {
      if (typeof postParsed.status === 'string') {
        return switchPostStatusString(typeOfPost, postParsed?.status);
      }
      return switchPostStatus(typeOfPost, postParsed?.status);
    }
    return 'processing'
  });

  const handleUpdatePostStatus = useCallback((newStatus: number | string) => {
    let status;
    if (typeof newStatus === 'number') {
      status = switchPostStatus(typeOfPost!!, newStatus);
    } else {
      status = switchPostStatusString(typeOfPost!!, newStatus);
    }
    setPostStatus(status);
  }, [typeOfPost]);

  const isMyPost = useMemo(
    () => user.loggedIn && user.userData?.userUuid === postParsed?.creator?.uuid,
    [postParsed?.creator?.uuid, user.loggedIn, user.userData?.userUuid]
  );

  const [currLocation] = useState(manualCurrLocation ?? (isBrowser() ? window.location.href : ''));
  const [acSuggestionFromUrl, setAcSuggestionFromUrl] = useState<newnewapi.Auction.Option | undefined>(undefined);
  const acSuggestionIDFromUrl = isBrowser() ? new URL(window.location.href).searchParams.get('suggestion') : undefined;

  const [sessionId, setSessionId] = useState(() => (
    isBrowser()
    ? new URL(window.location.href).searchParams.get('?session_id') ||
      new URL(window.location.href).searchParams.get('session_id')
    : undefined
  ));

  const resetSessionId = () => setSessionId(undefined);

  const [open, setOpen] = useState(false);

  const modalContainerRef = useRef<HTMLDivElement>();

  // Recommendations (with infinite scroll)
  const innerHistoryStack = useRef<newnewapi.Post[]>([]);
  const [recommenedPosts, setRecommenedPosts] = useState<newnewapi.Post[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null | undefined>('');
  const [recommenedPostsLoading, setRecommenedPostsLoading] = useState(false);
  const { ref: loadingRef, inView } = useInView();

  const handleCloseAndGoBack = () => {
    handleClose();
    window.history.replaceState('', '', currLocation);
    innerHistoryStack.current = [];
  };

  const handleGoBackInsidePost = () => {
    if (innerHistoryStack.current.length !== 0) {
      window.history.back();
    } else {
      handleClose();
      window.history.replaceState('', '', currLocation);
    }
  }

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
    if (postStatus === 'scheduled') {
      return (
        <PostViewScheduled
          key={postParsed?.postUuid}
          post={postParsed!!}
          postStatus={postStatus}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
        />
      );
    }

    if (postStatus === 'processing') {
      return (
        <PostViewProcessing
          key={postParsed?.postUuid}
          post={postParsed!!}
          postStatus={postStatus}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
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
        />
      );
    }
    return <div />;
  };

  const renderPostModeration = (postToRender: TPostType) => {
    if (postStatus === 'processing') {
      return (
        <PostViewProcessing
          key={postParsed?.postUuid}
          post={postParsed!!}
          postStatus={postStatus}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
        />
      );
    }

    if (postToRender === 'mc') {
      return (
        <PostModerationMC
          key={postParsed?.postUuid}
          postStatus={postStatus}
          post={postParsed as newnewapi.MultipleChoice}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
        />
      );
    }
    if (postToRender === 'ac') {
      return (
        <PostModerationAC
          key={postParsed?.postUuid}
          post={postParsed as newnewapi.Auction}
          postStatus={postStatus}
          handleUpdatePostStatus={handleUpdatePostStatus}
          handleGoBack={handleGoBackInsidePost}
        />
      );
    }
    if (postToRender === 'cf') {
      return (
        <PostModerationCF
          key={postParsed?.postUuid}
          postStatus={postStatus}
          post={postParsed as newnewapi.Crowdfunding}
          handleGoBack={handleGoBackInsidePost}
          handleUpdatePostStatus={handleUpdatePostStatus}
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
      window.history.pushState(
        postParsed.postUuid,
        'Post',
        `/?post=${postParsed.postUuid}${additionalHash ?? ''}`);
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

  useEffect(() => {
    setPostStatus(() => {
      if (typeOfPost && postParsed?.status) {
        if (typeof postParsed.status === 'string') {
          return switchPostStatusString(typeOfPost, postParsed?.status);
        }
        return switchPostStatus(typeOfPost, postParsed?.status);
      }
      return 'processing'
    });
  }, [postParsed, typeOfPost]);

  // Try to pre-fetch the content
  useEffect(() => {
    router.prefetch('/sign-up');
    router.prefetch('/creation');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal show={open} overlayDim onClose={() => handleCloseAndGoBack()}>
      <Head>
        <title>{ postParsed?.title }</title>
      </Head>
      {!isMobile && (
        <SGoBackButtonDesktop onClick={handleCloseAndGoBack}>
          <InlineSvg svg={CancelIcon} fill={theme.colorsThemed.text.primary} width="24px" height="24px" />
        </SGoBackButtonDesktop>
      )}
      {postParsed && typeOfPost ? (
        <SPostModalContainer
          id="post-modal-container"
          isMyPost={isMyPost}
          onClick={(e) => e.stopPropagation()}
          ref={(el) => {
            modalContainerRef.current = el!!;
          }}
        >
          {postStatus !== 'deleted' ? (
            isMyPost ? renderPostModeration(typeOfPost) : renderPostView(typeOfPost)
          ) : isMyPost ? (
              <PostFailedBox
                title={t('PostDeletedByMe.title')}
                body={t('PostDeletedByMe.body.by_creator')}
                buttonCaption={t('PostDeletedByMe.ctaButton')}
                handleButtonClick={() => {
                  router.push('/creation');
                }}
              />
          ) : (
            <PostFailedBox
              title={t('PostDeleted.title')}
              body={t('PostDeleted.body.by_creator')}
              buttonCaption={t('PostDeleted.ctaButton')}
              style={{
                marginBottom: '24px',
              }}
              handleButtonClick={() => {
                document.getElementById('post-modal-container')?.scrollTo({
                  top: document.getElementById('recommendations-section-heading')?.offsetTop,
                  behavior: 'smooth',
                })
              }}
            />
          )}
          {!isMyPost && (
            <SRecommendationsSection
              id="recommendations-section-heading"
            >
              <Headline variant={4}>
                {t('RecommendationsSection.heading')}
              </Headline>
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
                  ...(recommenedPostsLoading ? {
                    display: 'none'
                  } : {}),
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

const SGoBackButtonDesktop = styled.button`
  position: absolute;
  right: 0;
  top: 0;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  border: transparent;
  background: transparent;
  padding: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;
`;
