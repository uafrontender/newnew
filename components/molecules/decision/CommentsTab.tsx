/* eslint-disable no-plusplus */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';

import GradientMask from '../../atoms/GradientMask';
import Comment from '../../atoms/decision/Comment';
import CommentForm from '../../atoms/decision/CommentForm';

import { useAppSelector } from '../../../redux-store/store';
import { TCommentWithReplies } from '../../interfaces/tcomment';
import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import useScrollGradients from '../../../utils/hooks/useScrollGradients';
import { deleteMessage, getMessages, sendMessage } from '../../../api/endpoints/chat';
import { CommentFromUrlContext } from '../../../contexts/commentFromUrlContext';

const CommentsMobileModal = dynamic(() => import('./MoreCommentsModal'));

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

  // Comment from URL
  const {
    commentIdFromUrl,
    handleResetCommentIdFromUrl,
  } = useContext(CommentFromUrlContext);

  // Socket
  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  // Scrolling gradients
  const scrollRef = useRef<HTMLDivElement>();
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

        if (lastParentIdx !== -1) {
          if (!goalArr[lastParentIdx].replies) {
            goalArr[lastParentIdx].replies = []
          }

          // @ts-ignore
          const workingSubarr = [...goalArr[lastParentIdx].replies];

          goalArr[lastParentIdx].replies = [...workingSubarr, workingItem];
        }
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

        console.log(res.data)

        if (res.data && res.data.messages) {
          setComments((curr) => {
            const workingArr = [...curr, ...(res.data?.messages as newnewapi.ChatMessage[])];

            return processComments(workingArr);
          });

          console.log(res.data.paging?.nextPageToken)
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

  const markCommentAsDeleted = useCallback((comment: TCommentWithReplies) => {
    setComments((curr) => {
      const workingArr = [...curr];

      if (!comment.parentId || comment.parentId === 0) {
        const commentIdx = workingArr.findIndex((c) => c.id === comment.id);
        if (commentIdx === -1) return workingArr;
        workingArr[commentIdx].isDeleted = true;
        workingArr[commentIdx].content!!.text = '';
        return workingArr;
      }

      const parentIdx = workingArr.findIndex((c) => c.id === comment.parentId);

      if (parentIdx === -1) return workingArr;

      const commentIdx = workingArr[parentIdx].replies?.findIndex((c) => c.id === comment.id);

      if (commentIdx === -1) return workingArr;

      workingArr[parentIdx].replies!![commentIdx!!].isDeleted = true;
      workingArr[parentIdx].replies!![commentIdx!!].content!!.text = '';

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
        markCommentAsDeleted(comment);
      }
    } catch (err) {
      console.log(err);
    }
  }, [markCommentAsDeleted]);

  useEffect(() => {
    console.log('hey')
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

        setComments((curr) => {
          const workingArr = [...curr];

          if (decoded.newMessage?.parentId && decoded.newMessage !== 0) {
            const parentMsgIdx = workingArr.findIndex((msg) => msg.id === decoded.newMessage?.parentId);

            if (parentMsgIdx === -1 || !workingArr[parentMsgIdx]) return workingArr;

            if (!workingArr[parentMsgIdx].replies) {
              workingArr[parentMsgIdx].replies = [];
            }

            // @ts-ignore
            const workingSubarr = [...workingArr[parentMsgIdx].replies];

            // NB! Fix
            workingArr[parentMsgIdx].replies = [(decoded.newMessage as newnewapi.ChatMessage), ...workingSubarr];

            return workingArr;
          }

          return [decoded.newMessage, ...workingArr] as TCommentWithReplies[];
        })
      }
    };

    const socketHandlerMessageDeleted = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatMessageDeleted.decode(arr);
      if (decoded.deletedMessage) {
        markCommentAsDeleted(decoded.deletedMessage as TCommentWithReplies);
      }
    };

    if (socketConnection) {
      socketConnection.on('ChatMessageCreated', socketHandlerMessageCreated);
      socketConnection.on('ChatMessageDeleted', socketHandlerMessageDeleted);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('ChatMessageCreated', socketHandlerMessageCreated);
        socketConnection.off('ChatMessageDeleted', socketHandlerMessageDeleted);
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

  useEffect(() => {
    if (commentIdFromUrl && !isMobile) {
      const flat: TCommentWithReplies[] = [];
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].replies && Array.isArray(comments[i].replies) && comments[i].replies!!.length > 0) {
          flat.push(...[comments[i], ...comments[i].replies!!])
        }
        flat.push(comments[i]);
      }

      const idx = flat.findIndex((comment) => comment.id === parseInt(commentIdFromUrl, 10))

      if (idx === -1) {
        console.log('Looking further');
        scrollRef.current?.scrollBy({
          top: scrollRef.current.scrollHeight,
        })
      } else {
        console.log('Found the comment');

        if (!flat[idx].parentId || flat[idx].parentId === 0) {
          const offset = (scrollRef.current?.childNodes[1].childNodes[idx] as HTMLDivElement).offsetTop

          scrollRef.current?.scrollTo({
            top: offset,
          });
          document?.getElementById(`comment_id_${flat[idx].id}`)?.classList.add('opened-flash');
        } else if (flat[idx].parentId) {
          const parentIdx = comments.findIndex((c) => c.id === flat[idx].parentId);

          if (parentIdx !== -1) {
            const offsetTopParent = (scrollRef.current?.childNodes[1].childNodes[parentIdx] as HTMLDivElement).offsetTop
            setComments((curr) => {
              const working = [...curr];
              working[parentIdx].isOpen = true;
              return working;
            });

            setTimeout(() => {
              document?.getElementById(`comment_id_${flat[idx].id}`)?.scrollIntoView({
                block: "end",
                inline: "nearest"
              })
              document?.getElementById(`comment_id_${flat[idx].id}`)?.classList.add('opened-flash');
            }, 100);
          }
        }

        handleResetCommentIdFromUrl?.();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentIdFromUrl, comments, isMobile]);

  return (
    <>
      <STabContainer
        key="comments"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SActionSection
          ref={(el) => {
            scrollRef.current = el!!;
          }}
        >
          <CommentForm
            ref={(el) => {
              commentFormRef.current = el!!;
            }}
            position="sticky"
            zIndex={1}
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
                <CommentsMobileModal
                  isVisible={isMobile}
                  comments={comments}
                  commentsLoading={commentsLoading}
                  commentsNextPageToken={commentsNextPageToken}
                  commentIdFromUrl={commentIdFromUrl ?? undefined}
                  handleResetCommentIdFromUrl={handleResetCommentIdFromUrl!!}
                  handleAddComment={handleAddComment}
                  handleSetComments={setComments}
                  handleFetchComments={fetchComments}
                  handleDeleteComment={handleDeleteComment}
                  closeCommentsModalMobile={() => handleGoBack()}
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
  height: calc(100% - 50px);
  align-self: flex-end;

  ${({ theme }) => theme.media.tablet} {
    height: calc(100% - 56px);
  }
`;

const SActionSection = styled.div`
  padding-right: 0;
  height: 100%;

  max-height: 500px;

  overflow-y: auto;

  // Scrollbar
  &::-webkit-scrollbar {
    width: 4px;
  }
  scrollbar-width: none;
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
    transition: .2s linear;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
    transition: .2s linear;
  }

  &:hover {
    scrollbar-width: thin;
    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.colorsThemed.background.outlines1};
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colorsThemed.background.outlines2};
    }
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
