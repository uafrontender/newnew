import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';

import GradientMask from '../../../atoms/GradientMask';

import { TCommentWithReplies } from '../../../interfaces/tcomment';
import useScrollGradients from '../../../../utils/hooks/useScrollGradients';
import { CommentFromUrlContext } from '../../../../contexts/commentFromUrlContext';

import { Mixpanel } from '../../../../utils/mixpanel';
import useComponentScrollRestoration from '../../../../utils/hooks/useComponentScrollRestoration';
import { useAppState } from '../../../../contexts/appStateContext';
import NoComments from './NoComments';
import Loader from '../../../atoms/Loader';
import { APIResponse } from '../../../../api/apiConfigs';
import CommentParent from '../../../atoms/decision/CommentParent';
import isFirefox from '../../../../utils/isFirefox';
import LoadingModal from '../../LoadingModal';

interface IComments {
  postUuid: string;
  postShortId: string;
  comments: TCommentWithReplies[];
  canDeleteComments?: boolean;
  isLoading: boolean;
  hasNextPage?: boolean;
  handleAddComment: (
    text: string,
    parentId: number
  ) => Promise<APIResponse<newnewapi.ICommentMessage>>;
  openCommentProgrammatically: (parentIdx: number) => void;
  fetchNextPage: () => void;
  onCommentDelete: (comment: TCommentWithReplies) => void;
  onFormFocus?: () => void;
  onFormBlur?: () => void;
  handleToggleCommentRepliesById: (idToOpen: number, newState: boolean) => void;
}

const Comments: React.FunctionComponent<IComments> = ({
  postUuid,
  postShortId,
  comments,
  canDeleteComments,
  isLoading,
  hasNextPage,
  handleAddComment,
  fetchNextPage,
  onCommentDelete,
  onFormFocus,
  onFormBlur,
  openCommentProgrammatically,
  handleToggleCommentRepliesById,
}) => {
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Comment from URL
  const {
    commentIdFromUrl,
    newCommentContentFromUrl,
    handleResetCommentIdFromUrl,
  } = useContext(CommentFromUrlContext);
  const [isSearchingForComment, setIsSearchingForComment] = useState(false);

  // Scrolling gradients
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef);

  // Submit form ref
  const commentFormRef = useRef<HTMLFormElement>();
  const [heightDelta, setHeightDelta] = useState(70);

  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const handleDeleteComment = useCallback(
    async (comment: TCommentWithReplies) => {
      setIsDeletingComment(true);

      Mixpanel.track('Delete Comment', {
        _stage: 'Post',
        _postUuid: postUuid,
        _messageId: comment.id,
      });
      await onCommentDelete(comment);

      setIsDeletingComment(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [postUuid]
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entry: any) => {
      const size = entry[0]?.borderBoxSize
        ? entry[0]?.borderBoxSize[0]?.blockSize
        : entry[0]?.contentRect.height;

      if (size) {
        setHeightDelta(size);
      }
    });

    if (commentFormRef.current) {
      resizeObserver.observe(commentFormRef.current!!);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useComponentScrollRestoration(
    scrollRef.current || undefined,
    'comments-scrolling-container'
  );

  const [commentsReplies, setCommentsReplies] = useState<
    Record<number, { isOpen: boolean; text: string }>
  >({});

  const updateCommentReplies = useCallback(
    ({ id, isOpen, text }: { id: number; isOpen?: boolean; text?: string }) => {
      setCommentsReplies((prevState) => ({
        ...prevState,
        [id]: {
          ...(isOpen !== undefined
            ? { isOpen }
            : { isOpen: !!prevState[id]?.isOpen }),
          ...(text !== undefined ? { text } : { text: prevState[id]?.text }),
        },
      }));
    },
    []
  );

  const flashCommentOnScroll = useCallback(
    (commentId: string, timeOffset?: number) => {
      setTimeout(() => {
        document?.getElementById(commentId)?.classList.add('opened-flash');
      }, 100 + (timeOffset || 0));

      setTimeout(() => {
        document?.getElementById(commentId)?.classList.remove('opened-flash');
      }, 1600 + (timeOffset || 0));
    },
    []
  );

  // Scroll to comment
  useEffect(() => {
    async function findComment(commentId: string) {
      if (commentId) {
        setIsSearchingForComment(true);

        const idx = comments.findIndex(
          (comment) => comment.id === parseInt(commentId as string)
        );

        if (idx === -1 && hasNextPage) {
          scrollRef.current?.scrollIntoView();

          await fetchNextPage();
          scrollRef.current?.scrollBy({
            top: scrollRef.current.scrollHeight,
          });
        } else if (idx === -1 && !hasNextPage) {
          // TODO: some notification on the non-existing comment
          // e.g. toast?
          // console.log('Comment unavailable');
          setIsSearchingForComment(false);
        } else {
          document
            ?.getElementById(`comment_id_${comments[idx].id}`)
            ?.scrollIntoView();

          setIsSearchingForComment(false);

          openCommentProgrammatically(idx);

          flashCommentOnScroll(`comment_id_${comments[idx].id}`);

          if (!newCommentContentFromUrl) {
            handleResetCommentIdFromUrl?.();
          }
        }
      }
    }

    if (commentIdFromUrl) {
      findComment(commentIdFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    commentIdFromUrl,
    newCommentContentFromUrl,
    comments,
    // fetchNextPage, - will be updated with comments, do not need to depend
    // openCommentProgrammatically, - will be updated with comments, do not need to depend
    // flashCommentOnScroll, - doesn't change
    // handleResetCommentIdFromUrl, - doesn't change
  ]);

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <>
      <SScrollContainer ref={scrollRef} id='comments-scrolling-container'>
        {comments.length === 0 && !isLoading && <NoComments />}

        {comments && comments.length > 0 && (
          <SCommentsContainer>
            <SCommentsVisible>
              {comments.map((comment, idx) => {
                const isLoaderRow = idx > comments.length - 1;

                return (
                  <div key={comment.id.toString()}>
                    {isLoaderRow && hasNextPage ? (
                      <SLoaderDiv>
                        <Loader size='sm' isStatic />
                      </SLoaderDiv>
                    ) : (
                      <CommentParent
                        postUuid={postUuid}
                        postShortId={postShortId}
                        canDeleteComment={canDeleteComments}
                        lastChild={idx === comments.length - 1}
                        comment={comment}
                        isDeletingComment={isDeletingComment}
                        handleAddComment={handleAddComment}
                        handleDeleteComment={handleDeleteComment}
                        index={idx}
                        onFormBlur={onFormBlur ?? undefined}
                        onFormFocus={onFormFocus ?? undefined}
                        commentReply={commentsReplies[comment.id as number]}
                        updateCommentReplies={updateCommentReplies}
                        handleToggleReplies={handleToggleCommentRepliesById}
                      />
                    )}
                  </div>
                );
              })}
            </SCommentsVisible>
          </SCommentsContainer>
        )}
        {isLoading ? (
          <SLoaderDiv>
            <Loader size='sm' isStatic />
          </SLoaderDiv>
        ) : null}
        {hasNextPage ? (
          <SLoaderDiv
            ref={loadingRef}
            style={{
              ...(isLoading || isMobile
                ? {
                    display: 'none',
                  }
                : {}),
            }}
          />
        ) : null}
      </SScrollContainer>
      <GradientMask
        gradientType='blended'
        positionTop={heightDelta}
        active={showTopGradient}
        width={isFirefox() ? 'calc(100% - 12px)' : 'calc(100% - 4px)'}
        height='100px'
        animateOpacity
      />
      <GradientMask
        gradientType='blended'
        active={showBottomGradient}
        width={isFirefox() ? 'calc(100% - 12px)' : 'calc(100% - 4px)'}
        height='100px'
        animateOpacity
      />
      <LoadingModal isOpen={isSearchingForComment} zIndex={20} />
    </>
  );
};

Comments.defaultProps = {
  canDeleteComments: false,
  onFormFocus: () => {},
  onFormBlur: () => {},
};

export default Comments;

export const SScrollContainer = styled.div`
  height: 100%;
  max-height: 500px;

  overflow-y: auto;

  // Scrollbar
  // Firefox
  scrollbar-width: thin;
  // Other browsers
  @supports not (-moz-appearance: none) {
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
    }
    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
    }
    &:hover {
      &::-webkit-scrollbar-track {
        cursor: grab;
        background: ${({ theme }) => theme.colorsThemed.background.outlines1};
      }

      &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colorsThemed.background.outlines2};
      }
    }
  }
`;

const SCommentsContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const SCommentsVisible = styled.div`
  /* position: absolute;
  top: 0;
  left: 0;
  width: 100%; */

  ${({ theme }) => theme.media.tablet} {
    padding: 0 16px 0 32px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding: 0 16px;
  }
`;

const SLoaderDiv = styled.div`
  position: relative;
`;
