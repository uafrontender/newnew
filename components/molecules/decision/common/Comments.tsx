/* eslint-disable no-plusplus */
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useInView } from 'react-intersection-observer';

import GradientMask from '../../../atoms/GradientMask';
import Comment from '../../../atoms/decision/Comment';

import { TCommentWithReplies } from '../../../interfaces/tcomment';
import useScrollGradients from '../../../../utils/hooks/useScrollGradients';
import { CommentFromUrlContext } from '../../../../contexts/commentFromUrlContext';

import Button from '../../../atoms/Button';
import { Mixpanel } from '../../../../utils/mixpanel';
import useComponentScrollRestoration from '../../../../utils/hooks/useComponentScrollRestoration';
import { useAppState } from '../../../../contexts/appStateContext';
import NoComments from './NoComments';

interface IComments {
  postUuid: string;
  comments: TCommentWithReplies[];
  canDeleteComments?: boolean;
  isLoading: boolean;
  hasNextPage?: boolean;
  addComment: (text: string, id: number) => void;
  openCommentProgrammatically: (parentIdx: number) => void;
  fetchNextPage: () => void;
  onCommentDelete: (comment: TCommentWithReplies) => void;
  onFormFocus?: () => void;
  onFormBlur?: () => void;
}

const Comments: React.FunctionComponent<IComments> = ({
  postUuid,
  comments,
  canDeleteComments,
  isLoading,
  hasNextPage,
  addComment,
  fetchNextPage,
  onCommentDelete,
  onFormFocus,
  onFormBlur,
  openCommentProgrammatically,
}) => {
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Comment from URL
  const { commentIdFromUrl, handleResetCommentIdFromUrl } = useContext(
    CommentFromUrlContext
  );

  // Scrolling gradients
  const scrollRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef);

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

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
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to comment
  useEffect(() => {
    async function findComment() {
      const flat: TCommentWithReplies[] = [];
      for (let i = 0; i < comments.length; i++) {
        if (
          comments[i].replies &&
          Array.isArray(comments[i].replies) &&
          comments[i].replies!!.length > 0
        ) {
          flat.push(...[comments[i], ...comments[i].replies!!]);
        }
        flat.push(comments[i]);
      }

      const idx = flat.findIndex(
        (comment) => comment.id === parseInt(commentIdFromUrl as string)
      );

      if (idx === -1) {
        scrollRef.current?.scrollIntoView();

        if (isMobile && hasNextPage && !isLoading) {
          await fetchNextPage();
        } else {
          scrollRef.current?.scrollBy({
            top: scrollRef.current.scrollHeight,
          });
        }
      } else {
        if (!flat[idx].parentId || flat[idx].parentId === 0) {
          document
            ?.getElementById(`comment_id_${flat[idx].id}`)
            ?.scrollIntoView({
              block: 'end',
              inline: 'nearest',
            });
          document
            ?.getElementById(`comment_id_${flat[idx].id}`)
            ?.classList.add('opened-flash');
        } else if (flat[idx].parentId) {
          const parentIdx = comments.findIndex(
            (c) => c.id === flat[idx].parentId
          );

          if (parentIdx !== -1) {
            openCommentProgrammatically(parentIdx);

            setTimeout(() => {
              document
                ?.getElementById(`comment_id_${flat[idx].id}`)
                ?.scrollIntoView({
                  block: 'end',
                  inline: 'nearest',
                });
              document
                ?.getElementById(`comment_id_${flat[idx].id}`)
                ?.classList.add('opened-flash');
            }, 200);
          }
        }

        handleResetCommentIdFromUrl?.();
      }
    }

    if (commentIdFromUrl) {
      findComment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentIdFromUrl, comments, isMobile, isLoading]);

  useComponentScrollRestoration(
    scrollRef.current,
    'comments-scrolling-container'
  );

  return (
    <>
      <SScrollContainer
        ref={(el) => {
          scrollRef.current = el!!;
        }}
        id='comments-scrolling-container'
      >
        <SCommentsWrapper>
          {comments.length === 0 && !isLoading && <NoComments />}

          {comments &&
            comments.map((item, index) => (
              <Comment
                key={item.id.toString()}
                canDeleteComment={canDeleteComments}
                lastChild={index === comments.length - 1}
                comment={item}
                isDeletingComment={isDeletingComment}
                handleAddComment={(newMsg: string) =>
                  addComment(newMsg, item.id as number)
                }
                handleDeleteComment={handleDeleteComment}
                onFormBlur={onFormBlur ?? undefined}
                onFormFocus={onFormFocus ?? undefined}
              />
            ))}
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
          {isMobile && hasNextPage && (
            <SLoadMoreButton
              view='secondary'
              disabled={isLoading}
              onClick={() => {
                Mixpanel.track('Click Load More Comments', {
                  _stage: 'Post',
                  _postUuid: postUuid,
                });
                fetchNextPage();
              }}
            >
              {t('comments.seeMore')}
            </SLoadMoreButton>
          )}
        </SCommentsWrapper>
      </SScrollContainer>
      <GradientMask
        gradientType='blended'
        positionTop={heightDelta}
        active={showTopGradient}
        width='calc(100% - 4px)'
        height='100px'
        animateOpacity
      />
      <GradientMask
        gradientType='blended'
        active={showBottomGradient}
        width='calc(100% - 4px)'
        height='100px'
        animateOpacity
      />
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
  ${({ theme }) => theme.media.tablet} {
    padding-right: 0;
    max-height: 500px;
    height: 100%;

    overflow-y: auto;

    // Scrollbar
    &::-webkit-scrollbar {
      width: 4px;
    }
    scrollbar-width: none;
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
  }
`;

const SCommentsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    padding: 0 16px 0 32px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding: 0 16px;
  }
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SLoadMoreButton = styled(Button)`
  width: 100%;
  margin-bottom: 12px;
`;
