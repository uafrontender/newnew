/* eslint-disable no-plusplus */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useInView } from 'react-intersection-observer';

import GradientMask from '../../../atoms/GradientMask';
import Comment from '../../../atoms/decision/Comment';
import CommentForm from '../../../atoms/decision/CommentForm';

import { useAppSelector } from '../../../../redux-store/store';
import { TCommentWithReplies } from '../../../interfaces/tcomment';
import { SocketContext } from '../../../../contexts/socketContext';
import { ChannelsContext } from '../../../../contexts/channelsContext';
import useScrollGradients from '../../../../utils/hooks/useScrollGradients';
import { deleteMessage, sendMessage } from '../../../../api/endpoints/chat';
import { CommentFromUrlContext } from '../../../../contexts/commentFromUrlContext';

import NoContentYetImg from '../../../../public/images/decision/no-content-yet-mock.png';
import MakeFirstBidArrow from '../../../../public/images/svg/icons/filled/MakeFirstBidArrow.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import { Mixpanel } from '../../../../utils/mixpanel';
import useErrorToasts from '../../../../utils/hooks/useErrorToasts';
import usePostComments from '../../../../utils/hooks/usePostComments';
import useComponentScrollRestoration from '../../../../utils/hooks/useComponentScrollRestoration';

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
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const { showErrorToastPredefined } = useErrorToasts();

  // Comment from URL
  const { commentIdFromUrl, handleResetCommentIdFromUrl } = useContext(
    CommentFromUrlContext
  );

  // Socket
  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  // Scrolling gradients
  const scrollRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef);

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  // Submit form ref
  const commentFormRef = useRef<HTMLFormElement>();
  const [heightDelta, setHeightDelta] = useState(70);

  const {
    processedComments: comments,
    handleOpenCommentProgrammatically,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = usePostComments({
    loggedInUser: user.loggedIn,
    commentsRoomId,
  });

  const commentsLoading = useMemo(
    () => isLoading || isFetchingNextPage,
    [isLoading, isFetchingNextPage]
  );

  const handleAddComment = useCallback(
    async (content: string, parentMsgId?: number) => {
      try {
        Mixpanel.track('Added Comment', {
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
          await refetch();
        }
      } catch (err) {
        console.error(err);
        showErrorToastPredefined(undefined);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commentsRoomId, postUuid]
  );

  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const handleDeleteComment = useCallback(
    async (comment: TCommentWithReplies) => {
      setIsDeletingComment(true);
      try {
        Mixpanel.track('Deleted Comment', {
          _stage: 'Post',
          _postUuid: postUuid,
          _messageId: comment.id,
        });
        const payload = new newnewapi.DeleteMessageRequest({
          messageId: comment.id,
        });

        const res = await deleteMessage(payload);

        if (!res.error) {
          refetch();
        }
      } catch (err) {
        console.error(err);
        showErrorToastPredefined(undefined);
      } finally {
        setIsDeletingComment(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [postUuid, showErrorToastPredefined]
  );

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  useEffect(() => {
    if (commentsRoomId && socketConnection?.connected) {
      addChannel(`comments_${commentsRoomId.toString()}`, {
        chatRoomUpdates: {
          chatRoomId: commentsRoomId,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection?.connected, commentsRoomId]);

  useEffect(() => {
    const socketHandlerMessageCreated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatMessageCreated.decode(arr);
      if (decoded.newMessage!!.sender?.uuid !== user.userData?.userUuid) {
        refetch();
      }
    };

    const socketHandlerMessageDeleted = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatMessageDeleted.decode(arr);
      if (decoded.deletedMessage) {
        refetch();
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

        if (isMobile && hasNextPage && !commentsLoading) {
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
            handleOpenCommentProgrammatically(parentIdx);

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
  }, [commentIdFromUrl, comments, isMobile, commentsLoading]);

  useComponentScrollRestoration(
    scrollRef.current,
    'comments-scrolling-container'
  );

  return (
    <>
      <STabContainer
        key='comments'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SActionSection
          id='comments-scrolling-container'
          ref={(el) => {
            scrollRef.current = el!!;
          }}
        >
          <CommentForm
            isRoot
            postUuidOrShortId={postShortId || postUuid}
            ref={(el) => {
              commentFormRef.current = el!!;
            }}
            position='sticky'
            zIndex={1}
            onSubmit={(newMsg: string) => handleAddComment(newMsg)}
            onBlur={onFormBlur ?? undefined}
            onFocus={onFormFocus ?? undefined}
          />
          <SCommentsWrapper>
            {comments.length === 0 && !commentsLoading ? (
              <SNoCommentsYet>
                <SNoCommentsImgContainer>
                  <img src={NoContentYetImg.src} alt='No content yet' />
                </SNoCommentsImgContainer>
                <SNoCommentsCaption variant={3}>
                  {t('comments.noCommentsCaption')}
                </SNoCommentsCaption>
                {!isMobile && (
                  <SMakeBidArrowSvg
                    svg={MakeFirstBidArrow}
                    fill={theme.colorsThemed.background.quinary}
                    width='36px'
                  />
                )}
              </SNoCommentsYet>
            ) : null}
            {comments &&
              comments.map((item, index) => (
                <Comment
                  key={item.id.toString()}
                  canDeleteComment={canDeleteComments}
                  lastChild={index === comments.length - 1}
                  comment={item}
                  isDeletingComment={isDeletingComment}
                  handleAddComment={(newMsg: string) =>
                    handleAddComment(newMsg, item.id as number)
                  }
                  handleDeleteComment={handleDeleteComment}
                  onFormBlur={onFormBlur ?? undefined}
                  onFormFocus={onFormFocus ?? undefined}
                />
              ))}
            <SLoaderDiv
              ref={loadingRef}
              style={{
                ...(commentsLoading || isMobile
                  ? {
                      display: 'none',
                    }
                  : {}),
              }}
            />
            {isMobile && hasNextPage && (
              <SLoadMoreButton
                view='secondary'
                disabled={commentsLoading}
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
        </SActionSection>
        <GradientMask
          gradientType='primary'
          positionTop={heightDelta}
          active={showTopGradient}
          width='calc(100% - 4px)'
        />
        <GradientMask
          gradientType='primary'
          active={showBottomGradient}
          width='calc(100% - 4px)'
        />
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
  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 56px;
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
    transition: 0.2s linear;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
    transition: 0.2s linear;
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

// No Comments yet
const SNoCommentsYet = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  min-height: 300px;
`;

const SNoCommentsImgContainer = styled.div`
  position: absolute;

  top: 100px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  img {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
  }

  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    position: initial;
  }
`;

const SNoCommentsCaption = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SMakeBidArrowSvg = styled(InlineSvg)`
  position: absolute;
  left: 30%;
  top: -56px;

  transform: scale(1, -1);
`;

const SLoadMoreButton = styled(Button)`
  width: calc(100% - 12px);
  margin-bottom: 12px;
`;
