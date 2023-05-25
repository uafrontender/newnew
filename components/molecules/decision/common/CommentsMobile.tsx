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
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { newnewapi } from 'newnew-api';

import { TCommentWithReplies } from '../../../interfaces/tcomment';
import { CommentFromUrlContext } from '../../../../contexts/commentFromUrlContext';

import Button from '../../../atoms/Button';
import { Mixpanel } from '../../../../utils/mixpanel';
import { useAppState } from '../../../../contexts/appStateContext';
import NoComments from './NoComments';
import Loader from '../../../atoms/Loader';
import { APIResponse } from '../../../../api/apiConfigs';
import CommentParent from '../../../atoms/decision/CommentParent';

interface ICommentsMobile {
  postUuid: string;
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

const CommentsMobile: React.FunctionComponent<ICommentsMobile> = ({
  postUuid,
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Virtualization
  const commentsVirtualizer = useWindowVirtualizer({
    count: comments.length,
    estimateSize: () => 190,
    overscan: 15,
  });

  const commentItems = commentsVirtualizer.getVirtualItems();

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
    async function findComment() {
      const flat: TCommentWithReplies[] = [];
      for (let i = 0; i < comments.length; i++) {
        if (
          comments[i].replies &&
          Array.isArray(comments[i].replies) &&
          comments[i].replies!!.length > 0
        ) {
          flat.push(
            ...[
              { ...comments[i], index: i } as TCommentWithReplies,
              ...comments[i].replies!!,
            ]
          );
        }
        flat.push({ ...comments[i], index: i } as TCommentWithReplies);
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
        if (!flat[idx]?.parentCommentId || flat[idx]?.parentCommentId === 0) {
          commentsVirtualizer.scrollToIndex(flat[idx].index!!, {
            align: 'center',
          });

          flashCommentOnScroll(`comment_id_${flat[idx].id}`);
        } else if (flat[idx]?.parentCommentId) {
          const parentIdx = comments.findIndex(
            (c) => c.id === flat[idx]?.parentCommentId
          );

          if (parentIdx !== -1) {
            commentsVirtualizer.scrollToIndex(flat[parentIdx].index!!, {
              align: 'center',
            });

            openCommentProgrammatically(parentIdx);

            setTimeout(() => {
              document
                ?.getElementById(`comment_id_${flat[idx].id}`)
                ?.scrollIntoView({
                  block: 'end',
                  inline: 'nearest',
                });
            }, 200);

            flashCommentOnScroll(`comment_id_${flat[idx].id}`, 300);
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

  return (
    <>
      <SScrollContainer ref={scrollRef} id='comments-scrolling-container'>
        {comments.length === 0 && !isLoading && <NoComments />}

        {comments && comments.length > 0 && (
          <SCommentsContainer>
            <SCommentsVisible>
              {commentItems.map((virtualItem) => {
                const isLoaderRow = virtualItem.index > comments.length - 1;

                return (
                  <div key={virtualItem.index}>
                    {isLoaderRow && hasNextPage ? (
                      <SLoaderDiv>
                        <Loader size='sm' isStatic />
                      </SLoaderDiv>
                    ) : (
                      <CommentParent
                        postUuid={postUuid}
                        canDeleteComment={canDeleteComments}
                        lastChild={virtualItem.index === comments.length - 1}
                        comment={comments[virtualItem.index]}
                        isDeletingComment={isDeletingComment}
                        handleAddComment={handleAddComment}
                        handleDeleteComment={handleDeleteComment}
                        index={virtualItem.index}
                        ref={commentsVirtualizer.measureElement}
                        onFormBlur={onFormBlur ?? undefined}
                        onFormFocus={onFormFocus ?? undefined}
                        commentReply={
                          commentsReplies[
                            comments[virtualItem.index].id as number
                          ]
                        }
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
      </SScrollContainer>
    </>
  );
};

CommentsMobile.defaultProps = {
  canDeleteComments: false,
  onFormFocus: () => {},
  onFormBlur: () => {},
};

export default CommentsMobile;

export const SScrollContainer = styled.div``;

const SCommentsContainer = styled.div`
  width: 100%;
  position: relative;
`;

const SCommentsVisible = styled.div`
  width: 100%;
`;

const SLoaderDiv = styled.div`
  position: relative;
`;

const SLoadMoreButton = styled(Button)`
  width: 100%;
  margin-bottom: 12px;
  margin-top: 40px;
`;
