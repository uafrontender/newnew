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

const CommentsMobile: React.FunctionComponent<ICommentsMobile> = ({
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
  const { t } = useTranslation('page-Post');
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
        const idx = comments.findIndex(
          (comment) => comment.id === parseInt(commentId as string)
        );

        if (idx === -1) {
          scrollRef.current?.scrollIntoView();

          await fetchNextPage();
          scrollRef.current?.scrollBy({
            top: scrollRef.current.scrollHeight,
          });
        } else {
          document
            ?.getElementById(`comment_id_${comments[idx].id}`)
            ?.scrollIntoView();

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

  return (
    <>
      <SScrollContainer ref={scrollRef} id='comments-scrolling-container'>
        {comments.length === 0 && !isLoading && <NoComments />}

        {comments && comments.length > 0 && (
          <SCommentsContainer>
            <SCommentsVisible>
              {comments.map((item, index) => {
                const isLoaderRow = index > comments.length - 1;

                return (
                  <div key={item.id?.toString() || index.toString()}>
                    {isLoaderRow && hasNextPage ? (
                      <SLoaderDiv>
                        <Loader size='sm' isStatic />
                      </SLoaderDiv>
                    ) : (
                      <CommentParent
                        postUuid={postUuid}
                        postShortId={postShortId}
                        canDeleteComment={canDeleteComments}
                        lastChild={index === comments.length - 1}
                        comment={comments[index]}
                        isDeletingComment={isDeletingComment}
                        handleAddComment={handleAddComment}
                        handleDeleteComment={handleDeleteComment}
                        index={index}
                        onFormBlur={onFormBlur ?? undefined}
                        onFormFocus={onFormFocus ?? undefined}
                        commentReply={
                          commentsReplies[comments[index].id as number]
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
