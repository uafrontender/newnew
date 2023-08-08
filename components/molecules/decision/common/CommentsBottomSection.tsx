import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';

import CommentForm, {
  TCommentFormAreaHandle,
} from '../../../atoms/decision/CommentForm';

import { TCommentWithReplies } from '../../../interfaces/tcomment';
import { SocketContext } from '../../../../contexts/socketContext';
import { ChannelsContext } from '../../../../contexts/channelsContext';
import { deleteComment, sendComment } from '../../../../api/endpoints/comments';

import { Mixpanel } from '../../../../utils/mixpanel';
import useErrorToasts from '../../../../utils/hooks/useErrorToasts';
import usePostComments from '../../../../utils/hooks/usePostComments';
import Comments, { SScrollContainer } from './Comments';
import { APIResponse } from '../../../../api/apiConfigs';
import { useAppState } from '../../../../contexts/appStateContext';
import CommentsMobile from './CommentsMobile';

interface ICommentsBottomSection {
  postUuid: string;
  postShortId: string;
  canDeleteComments?: boolean;
  onFormFocus?: () => void;
  onFormBlur?: () => void;
}

const CommentsBottomSection: React.FunctionComponent<
  ICommentsBottomSection
> = ({ postUuid, postShortId, canDeleteComments, onFormFocus, onFormBlur }) => {
  const { userUuid, userLoggedIn } = useAppState();
  const { showErrorToastPredefined } = useErrorToasts();
  const { resizeMode } = useAppState();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Socket
  const { socketConnection, isSocketConnected } = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  // Submit form ref
  const commentFormRef = useRef<TCommentFormAreaHandle>();

  const {
    processedComments: comments,
    addCommentMutation,
    removeCommentMutation,
    updateCommentNumberOfRepliesMutation,
    handleOpenCommentByIdx,
    handleToggleCommentRepliesById,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
  } = usePostComments({
    loggedInUser: userLoggedIn,
    postUuid,
  });

  const commentsLoading = useMemo(
    () => isLoading || isFetchingNextPage,
    [isLoading, isFetchingNextPage]
  );

  const handleAddComment = useCallback(
    async (
      content: string,
      parentMsgId?: number
    ): Promise<APIResponse<newnewapi.ICommentMessage>> => {
      Mixpanel.track('Add Comment', {
        _stage: 'Post',
        _postUuid: postUuid,
      });
      const payload = new newnewapi.SendCommentRequest({
        postUuid,
        content: {
          text: content,
        },
      });

      const res = await sendComment(payload);

      if (res.data?.comment) {
        addCommentMutation?.mutate(res.data.comment);

        const scrollingContainer = document?.getElementById(
          'comments-scrolling-container'
        );

        if (scrollingContainer) {
          if (!isMobile) {
            scrollingContainer.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          } else {
            const scrollTo = document
              ?.getElementById('comments')
              ?.getBoundingClientRect()?.y;
            if (scrollTo) {
              document.documentElement?.scrollBy({
                top: scrollTo,
                behavior: 'smooth',
              });
            }
          }
        }
      }

      if (res.data?.comment && !res.error) {
        return {
          data: res.data.comment,
        };
      }
      return {
        error: res?.error || new Error('Could not add comment'),
      };
    },
    [addCommentMutation, isMobile, postUuid]
  );

  const handleDeleteComment = useCallback(
    async (comment: TCommentWithReplies) => {
      try {
        const payload = new newnewapi.DeleteCommentRequest({
          commentId: comment.id,
        });

        const res = await deleteComment(payload);

        if (!res.error) {
          removeCommentMutation?.mutate(comment);
        }
      } catch (err) {
        console.error(err);
        showErrorToastPredefined(undefined);
      }
    },
    [removeCommentMutation, showErrorToastPredefined]
  );

  useEffect(() => {
    if (postUuid && isSocketConnected) {
      addChannel(`comments_${postUuid.toString()}`, {
        postCommentsUpdates: {
          postUuid,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postUuid, isSocketConnected]);

  useEffect(() => {
    const socketHandlerMessageCreated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CommentMessageCreated.decode(arr);

      if (
        decoded?.newComment &&
        decoded.newComment!!.sender?.uuid !== userUuid &&
        !decoded.newComment?.parentCommentId
      ) {
        addCommentMutation?.mutate(decoded.newComment);
      }
    };

    const socketHandlerMessageDeleted = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CommentMessageDeleted.decode(arr);
      if (decoded.deletedComment && !decoded.deletedComment?.parentCommentId) {
        removeCommentMutation?.mutate(decoded.deletedComment);
      }
    };

    const socketHandlerNumberOfRepliesChanged = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CommentNumberOfRepliesChanged.decode(arr);
      if (decoded.updatedComment) {
        updateCommentNumberOfRepliesMutation?.mutate(decoded.updatedComment);
      }
    };

    if (socketConnection) {
      socketConnection?.on(
        'CommentMessageCreated',
        socketHandlerMessageCreated
      );
      socketConnection?.on(
        'CommentMessageDeleted',
        socketHandlerMessageDeleted
      );
      socketConnection?.on(
        'CommentNumberOfRepliesChanged',
        socketHandlerNumberOfRepliesChanged
      );
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off(
          'CommentMessageCreated',
          socketHandlerMessageCreated
        );
        socketConnection?.off(
          'CommentMessageDeleted',
          socketHandlerMessageDeleted
        );
        socketConnection?.off(
          'CommentNumberOfRepliesChanged',
          socketHandlerNumberOfRepliesChanged
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, userUuid]);

  // Cleanup
  useEffect(
    () => () => {
      if (postUuid) {
        removeChannel(`comments_${postUuid.toString()}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // postUuid, - reason unknown. Why not?
    ]
  );

  return (
    <>
      <STabContainer
        key='comments'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SActionSection>
          <CommentForm
            isRoot
            postUuidOrShortId={postShortId || postUuid}
            ref={(el) => {
              commentFormRef.current = el!!;
            }}
            position='sticky'
            zIndex={1}
            onSubmit={handleAddComment}
            onBlur={onFormBlur ?? undefined}
            onFocus={onFormFocus ?? undefined}
          />
          {isMobile ? (
            <CommentsMobile
              comments={comments}
              postUuid={postUuid}
              postShortId={postShortId}
              onCommentDelete={handleDeleteComment}
              openCommentProgrammatically={handleOpenCommentByIdx}
              handleAddComment={handleAddComment}
              isLoading={commentsLoading}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              onFormBlur={onFormBlur ?? undefined}
              onFormFocus={onFormFocus ?? undefined}
              canDeleteComments={canDeleteComments}
              handleToggleCommentRepliesById={handleToggleCommentRepliesById}
            />
          ) : (
            <Comments
              comments={comments}
              postUuid={postUuid}
              postShortId={postShortId}
              onCommentDelete={handleDeleteComment}
              openCommentProgrammatically={handleOpenCommentByIdx}
              handleAddComment={handleAddComment}
              isLoading={commentsLoading}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              onFormBlur={onFormBlur ?? undefined}
              onFormFocus={onFormFocus ?? undefined}
              canDeleteComments={canDeleteComments}
              handleToggleCommentRepliesById={handleToggleCommentRepliesById}
            />
          )}
        </SActionSection>
      </STabContainer>
    </>
  );
};

CommentsBottomSection.defaultProps = {
  canDeleteComments: false,
  onFormFocus: () => {},
  onFormBlur: () => {},
};

export default CommentsBottomSection;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: calc(100% - 50px);
  align-self: flex-end;

  margin-bottom: 40px;

  &:last-child {
    margin-bottom: 0;
  }

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 56px;
  }
`;

const SActionSection = styled.div`
  &:hover {
    ${SScrollContainer} {
      scrollbar-width: thin;
      &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colorsThemed.background.outlines1};
      }

      &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colorsThemed.background.outlines2};
      }
    }
  }
`;
