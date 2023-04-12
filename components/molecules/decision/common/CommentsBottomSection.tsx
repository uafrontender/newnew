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

import CommentForm from '../../../atoms/decision/CommentForm';

import { useAppSelector } from '../../../../redux-store/store';
import { TCommentWithReplies } from '../../../interfaces/tcomment';
import { SocketContext } from '../../../../contexts/socketContext';
import { ChannelsContext } from '../../../../contexts/channelsContext';
import { deleteMessage, sendMessage } from '../../../../api/endpoints/chat';

import { Mixpanel } from '../../../../utils/mixpanel';
import useErrorToasts from '../../../../utils/hooks/useErrorToasts';
import usePostComments from '../../../../utils/hooks/usePostComments';
import Comments, { SScrollContainer } from './Comments';
import { APIResponse } from '../../../../api/apiConfigs';

interface ICommentsBottomSection {
  postUuid: string;
  postShortId: string;
  commentsRoomId: number;
  canDeleteComments?: boolean;
  onFormFocus?: () => void;
  onFormBlur?: () => void;
}

const CommentsBottomSection: React.FunctionComponent<
  ICommentsBottomSection
> = ({
  postUuid,
  postShortId,
  canDeleteComments,
  commentsRoomId,
  onFormFocus,
  onFormBlur,
}) => {
  const user = useAppSelector((state) => state.user);
  const { showErrorToastPredefined } = useErrorToasts();

  // Socket
  const { socketConnection, isSocketConnected } = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  // Submit form ref
  const commentFormRef = useRef<HTMLFormElement>();

  const {
    processedComments: comments,
    addCommentMutation,
    removeCommentMutation,
    handleOpenCommentProgrammatically,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
  } = usePostComments({
    loggedInUser: user.loggedIn,
    commentsRoomId,
  });

  const commentsLoading = useMemo(
    () => isLoading || isFetchingNextPage,
    [isLoading, isFetchingNextPage]
  );

  const handleAddComment = useCallback(
    async (
      content: string,
      parentMsgId?: number
    ): Promise<APIResponse<newnewapi.IChatMessage>> => {
      Mixpanel.track('Add Comment', {
        _stage: 'Post',
        _postUuid: postUuid,
      });
      const payload = new newnewapi.SendMessageRequest({
        roomId: commentsRoomId,
        content: {
          text: content,
        },
        ...(parentMsgId
          ? {
              parentMessageId: parentMsgId,
            }
          : {}),
      });

      const res = await sendMessage(payload);

      if (res.data?.message) {
        addCommentMutation?.mutate(res.data.message);
      }

      if (res.data?.message && !res.error) {
        return {
          data: res.data.message,
        };
      }
      return {
        error: res?.error || new Error('Could not add comment'),
      };
    },
    [addCommentMutation, commentsRoomId, postUuid]
  );

  const handleDeleteComment = useCallback(
    async (comment: TCommentWithReplies) => {
      try {
        const payload = new newnewapi.DeleteMessageRequest({
          messageId: comment.id,
        });

        const res = await deleteMessage(payload);

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
    if (commentsRoomId && isSocketConnected) {
      addChannel(`comments_${commentsRoomId.toString()}`, {
        chatRoomUpdates: {
          chatRoomId: commentsRoomId,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsRoomId, isSocketConnected]);

  useEffect(() => {
    const socketHandlerMessageCreated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatMessageCreated.decode(arr);
      if (
        decoded?.newMessage &&
        decoded.newMessage!!.sender?.uuid !== user.userData?.userUuid
      ) {
        addCommentMutation?.mutate(decoded.newMessage);
      }
    };

    const socketHandlerMessageDeleted = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatMessageDeleted.decode(arr);
      if (decoded.deletedMessage) {
        removeCommentMutation?.mutate(decoded.deletedMessage);
      }
    };

    if (socketConnection) {
      socketConnection?.on('ChatMessageCreated', socketHandlerMessageCreated);
      socketConnection?.on('ChatMessageDeleted', socketHandlerMessageDeleted);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off(
          'ChatMessageCreated',
          socketHandlerMessageCreated
        );
        socketConnection?.off(
          'ChatMessageDeleted',
          socketHandlerMessageDeleted
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, user.userData?.userUuid]);

  // Cleanup
  useEffect(
    () => () => {
      if (commentsRoomId) {
        if (commentsRoomId)
          removeChannel(`comments_${commentsRoomId.toString()}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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
          <Comments
            comments={comments}
            postUuid={postUuid}
            onCommentDelete={handleDeleteComment}
            openCommentProgrammatically={handleOpenCommentProgrammatically}
            handleAddComment={handleAddComment}
            isLoading={commentsLoading}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            onFormBlur={onFormBlur ?? undefined}
            onFormFocus={onFormFocus ?? undefined}
            canDeleteComments={canDeleteComments}
          />
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
