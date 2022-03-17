/* eslint-disable no-plusplus */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';

import GradientMask from '../../atoms/GradientMask';
import Comment from '../../atoms/decision/Comment';
import CommentForm from '../../atoms/decision/CommentForm';

import { useAppSelector } from '../../../redux-store/store';
import { TCommentWithReplies } from '../../interfaces/tcomment';
import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import useScrollGradients from '../../../utils/hooks/useScrollGradients';
import { deleteMessage, getMessages, sendMessage } from '../../../api/endpoints/chat';

const MoreCommentsModal = dynamic(() => import('./MoreCommentsModal'));

interface ICommentsTab {
  commentsRoomId: number;
  canDeleteComments?: boolean;
  handleGoBack: () => void;
}

const CommentsTab: React.FunctionComponent<ICommentsTab> = ({
  canDeleteComments,
  commentsRoomId,
  handleGoBack,
}) => {
  const { t } = useTranslation('decision');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  // Socket
  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  // Scrolling gradients
  const scrollRef: any = useRef();
  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef);

  // Infinite load
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  // Submit form ref
  const commentFormRef = useRef<HTMLFormElement>();
  const [heightDelta, setHeightDelta] = useState(70);

  // Comments
  const [comments, setComments] = useState<TCommentWithReplies[]>([]);
  const [commentsNextPageToken, setCommentsNextPageToken] = useState<string | undefined | null>('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [loadingCommentsError, setLoadingCommentsError] = useState('');

  const processComments = (
    commentsRaw: Array<newnewapi.ChatMessage | TCommentWithReplies>,
  ): TCommentWithReplies[] => {
    let lastParentId;
    let lastParentIdx;
    const goalArr: TCommentWithReplies[] = [];

    const workingArr = [...commentsRaw];

    workingArr.forEach((rawItem, i) => {
      const workingItem = {...rawItem};

      if (!rawItem.parentId || rawItem.parentId === 0) {
        lastParentId = undefined;
        lastParentIdx = undefined;

        workingItem.parentId = undefined;
        goalArr.push(workingItem as TCommentWithReplies);
      } else {
        lastParentId = workingItem.parentId;
        lastParentIdx = goalArr.findIndex((o) => o.id === workingItem.parentId);

        if (!goalArr[lastParentIdx].replies) {
          goalArr[lastParentIdx].replies = []
        }

        // @ts-ignore
        const workingSubarr = [...goalArr[lastParentIdx].replies];

        goalArr[lastParentIdx].replies = [...workingSubarr, workingItem];
      }
    });

    return goalArr;
  };

  const fetchComments = useCallback(
    async (pageToken?: string) => {
      if (commentsLoading) return;
      try {
        setCommentsLoading(true);
        setLoadingCommentsError('');

        const getCommentsPayload = new newnewapi.GetMessagesRequest({
          roomId: commentsRoomId,
          ...(pageToken
            ? {
              paging: {
                pageToken,
              },
            }
            : {}),
        });

        const res = await getMessages(getCommentsPayload);

        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

        if (res.data && res.data.messages) {
          // console.log(res.data.messages)

          setComments((curr) => {
            const workingArr = [...curr, ...(res.data?.messages as newnewapi.ChatMessage[])];

            return processComments(workingArr);
          });

          setCommentsNextPageToken(res.data.paging?.nextPageToken);
        }

        setCommentsLoading(false);
      } catch (err) {
        setCommentsLoading(false);
        setLoadingCommentsError((err as Error).message);
        console.error(err);
      }
    },
    [commentsLoading, commentsRoomId]
  );

  const handleAddComment = useCallback(async (content: string, parentMsgId?: number) => {
    try {
      const payload = new newnewapi.SendMessageRequest({
        roomId: commentsRoomId,
        content: {
          text: content,
        },
        ...(parentMsgId ? {
          parentMessageId: parentMsgId,
        } : {}),
      });

      const res = await sendMessage(payload);

      if (res.data?.message) {
        setComments((curr) => {
          const workingArr = [...curr];

          if (res.data?.message?.parentId && res.data?.message?.parentId !== 0) {
            const parentMsgIdx = workingArr.findIndex((msg) => msg.id === res.data?.message?.parentId);

            if (parentMsgIdx === -1 || !workingArr[parentMsgIdx]) return workingArr;

            if (workingArr[parentMsgIdx].replies && Array.isArray(workingArr[parentMsgIdx].replies)) {
              workingArr[parentMsgIdx].replies!!.push(res.data.message as newnewapi.ChatMessage);
              return workingArr;
            }

            workingArr[parentMsgIdx].replies = [(res.data.message as newnewapi.ChatMessage)];
            return workingArr;
          }
          return [res.data?.message, ...curr] as TCommentWithReplies[];
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [commentsRoomId]);

  const deleteCommentIterativelyById = useCallback((comment: TCommentWithReplies) => {
    setComments((curr) => {
      const workingArr = [...curr];

      if (!comment.parentId || comment.parentId === 0) {
        return workingArr.filter((c) => c.id !== comment.id)
      }

      const parentIdx = workingArr.findIndex((c) => c.id === comment.parentId);

      if (!parentIdx || parentIdx === -1) return workingArr;

      workingArr[parentIdx].replies = workingArr[parentIdx].replies?.filter((c) => c.id !== comment.id);

      return workingArr;
    });
  }, [setComments]);

  const handleDeleteComment = useCallback(async (comment: TCommentWithReplies) => {
    try {
      const payload = new newnewapi.DeleteMessageRequest({
        messageId: comment.id,
      });

      const res = await deleteMessage(payload);

      if (!res.error) {
        deleteCommentIterativelyById(comment);
      }
    } catch (err) {
      console.log(err);
    }
  }, [deleteCommentIterativelyById]);

  useEffect(() => {
    fetchComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (inView && !commentsLoading && commentsNextPageToken) {
      console.log(`fetching comments from in view with token ${commentsNextPageToken}`);
      fetchComments(commentsNextPageToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, commentsNextPageToken, commentsLoading]);

  useEffect(() => {
    if (commentsRoomId && socketConnection) {
      addChannel(`comments_${commentsRoomId.toString()}`, {
        chatRoomUpdates: {
          chatRoomId: commentsRoomId,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  useEffect(() => {
    const socketHandlerMessageCreated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatMessageCreated.decode(arr);
      if (decoded.newMessage!!.sender?.uuid!! !== user.userData?.userUuid) {
        console.log('Adding comment from socket');

        setComments((curr) => {
          const workingArr = [...curr];

          if (decoded.newMessage?.parentId && decoded.newMessage !== 0) {
            console.log('Searching for parent comment')

            const parentMsgIdx = workingArr.findIndex((msg) => msg.id === decoded.newMessage?.parentId);

            if (parentMsgIdx === -1 || !workingArr[parentMsgIdx]) return workingArr;

            if (!workingArr[parentMsgIdx].replies) {
              workingArr[parentMsgIdx].replies = [];
            }

            // @ts-ignore
            const workingSubarr = [...workingArr[parentMsgIdx].replies];

            workingArr[parentMsgIdx].replies = [(decoded.newMessage as newnewapi.ChatMessage), ...workingSubarr];

            return workingArr;
          }
          console.log('Adding comment directly');

          return [decoded.newMessage, ...workingArr] as TCommentWithReplies[];
        })
      }
    };

    if (socketConnection) {
      socketConnection.on('ChatMessageCreated', socketHandlerMessageCreated);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('ChatMessageCreated', socketHandlerMessageCreated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, user.userData?.userUuid, setComments]);

  // Cleanup
  useEffect(
    () => () => {
      if (commentsRoomId) {
        if (commentsRoomId) removeChannel(`comments_${commentsRoomId.toString()}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entry) => {
      const size = entry[0]?.borderBoxSize
        ? entry[0]?.borderBoxSize[0]?.blockSize : entry[0]?.contentRect.height;
      if (size) {
        setHeightDelta(size);
      }
    });

    if (commentFormRef.current) {
      resizeObserver.observe(commentFormRef.current!!);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <STabContainer
        key="comments"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SActionSection
          ref={scrollRef}
        >
          <CommentForm
            ref={(el) => {
              commentFormRef.current = el!!;
            }}
            onSubmit={(newMsg: string) => handleAddComment(newMsg)}
          />
          <SCommentsWrapper>
            {!isMobile && comments && comments.map((item, index) => {
              return (
                <Comment
                  key={(item.id).toString()}
                  canDeleteComment={canDeleteComments}
                  lastChild={index === comments.length - 1 || (isMobile && index === 2)}
                  comment={item}
                  handleAddComment={(newMsg: string) => handleAddComment(newMsg, item.id as number)}
                  handleDeleteComment={handleDeleteComment}
                />
              );
            })}
            {!isMobile && (
              <SLoaderDiv
                ref={loadingRef}
                style={{
                  ...(commentsLoading ? {
                    display: 'none'
                  } : {}),
                }}
              />
            )}
            {isMobile && comments && (
              <>
                <MoreCommentsModal
                  isVisible={isMobile}
                  comments={comments}
                  commentsLoading={commentsLoading}
                  commentsNextPageToken={commentsNextPageToken}
                  handleAddComment={handleAddComment}
                  handleFetchComments={fetchComments}
                  handleDeleteComment={handleDeleteComment}
                  closeMoreCommentsModal={() => handleGoBack()}
                />
              </>
            )}
          </SCommentsWrapper>
        </SActionSection>
        <GradientMask gradientType="secondary" positionTop={heightDelta} active={showTopGradient} />
        <GradientMask gradientType="secondary" active={showBottomGradient} />
      </STabContainer>
    </>
  );
};

CommentsTab.defaultProps = {
  canDeleteComments: false,
};

export default CommentsTab;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  padding-right: 20px;
  height: calc(100% - 50px);
  align-self: flex-end;

  ${({ theme }) => theme.media.tablet} {
    height: calc(100% - 56px);
  }
`;

const SActionSection = styled.div`
  padding-right: 0;
  height: 100%;
  overflow: hidden;
  &:hover {
    overflow-y: auto;
  }
  ${(props) => props.theme.media.desktop} {
    padding-right: 24px;
  }
`;

const SCommentsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;
