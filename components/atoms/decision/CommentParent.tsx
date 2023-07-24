/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  useContext,
} from 'react';
import styled, { keyframes, useTheme, css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import moment from 'moment';
import { newnewapi } from 'newnew-api';

import Button from '../Button';
import InlineSVG from '../InlineSVG';
import UserAvatar from '../../molecules/UserAvatar';
import CommentForm, { TCommentFormAreaHandle } from './CommentForm';

import { useAppState } from '../../../contexts/appStateContext';
import { TCommentWithReplies } from '../../interfaces/tcomment';
import { reportMessage } from '../../../api/endpoints/report';
import { APIResponse } from '../../../api/apiConfigs';

import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import DisplayName from '../DisplayName';
import CommentChild from './CommentChild';
import usePostComments from '../../../utils/hooks/usePostComments';
import { Mixpanel } from '../../../utils/mixpanel';
import { deleteComment, sendComment } from '../../../api/endpoints/comments';
import { SocketContext } from '../../../contexts/socketContext';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import Loader from '../Loader';
import { useUserData } from '../../../contexts/userDataContext';

const CommentEllipseMenu = dynamic(
  () => import('../../molecules/decision/common/CommentEllipseMenu')
);
const CommentEllipseModal = dynamic(
  () => import('../../molecules/decision/common/CommentEllipseModal')
);
const ReportModal = dynamic(() => import('../../molecules/ReportModal'));
const DeleteCommentModal = dynamic(
  () => import('../../molecules/decision/common/DeleteCommentModal')
);

interface ICommentParent {
  postUuid: string;
  postShortId: string;
  lastChild?: boolean;
  comment: TCommentWithReplies;
  isDeletingComment: boolean;
  canDeleteComment?: boolean;
  index?: number;
  commentReply?: {
    isOpen: boolean;
    text: string;
  };
  handleAddComment: (
    text: string,
    parentId: number
  ) => Promise<APIResponse<newnewapi.ICommentMessage>>;
  handleDeleteComment: (commentToDelete: TCommentWithReplies) => void;
  onFormFocus?: () => void;
  onFormBlur?: () => void;
  setCommentHeight?: (index: number, height: number) => void;
  updateCommentReplies: ({
    id,
    isOpen,
    text,
  }: {
    id: number;
    isOpen?: boolean | undefined;
    text?: string | undefined;
  }) => void;
  handleToggleReplies: (idToOpen: number, newState: boolean) => void;
}

const CommentParent = React.forwardRef<HTMLDivElement, ICommentParent>(
  (
    {
      postUuid,
      postShortId,
      comment,
      lastChild,
      canDeleteComment,
      isDeletingComment,
      index,
      commentReply,
      handleDeleteComment,
      onFormFocus,
      onFormBlur,
      updateCommentReplies,
      handleToggleReplies,
    },
    ref: any
  ) => {
    const theme = useTheme();
    const router = useRouter();
    const { t } = useTranslation('page-Post');
    const { userData } = useUserData();
    const { resizeMode, userLoggedIn } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const { socketConnection } = useContext(SocketContext);

    const { showErrorToastPredefined } = useErrorToasts();

    const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);

    const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
    const [confirmDeleteComment, setConfirmDeleteComment] =
      useState<boolean>(false);

    const isReplyFormOpen = useMemo(() => !!comment?.isOpen, [comment?.isOpen]);

    const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
    const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);

    const isMyComment = useMemo(
      () => userLoggedIn && userData?.userUuid === comment.sender?.uuid,
      [userLoggedIn, userData?.userUuid, comment.sender?.uuid]
    );

    const {
      processedComments: replies,
      addCommentMutation,
      removeCommentMutation,
      fetchNextPage,
      isLoading,
      isFetchingNextPage,
      hasNextPage,
    } = usePostComments(
      {
        loggedInUser: userLoggedIn,
        postUuid,
        parentCommentId: comment.id as number,
      },
      {
        enabled: isReplyFormOpen,
      }
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
          parentCommentId: comment.id,
        });

        const res = await sendComment(payload);

        if (res.data?.comment) {
          addCommentMutation?.mutate(res.data.comment);
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
      [addCommentMutation, comment.id, postUuid]
    );

    const handleDeleteChildComment = useCallback(
      async (commentToDelete: TCommentWithReplies) => {
        try {
          const payload = new newnewapi.DeleteCommentRequest({
            commentId: commentToDelete.id,
          });

          const res = await deleteComment(payload);

          if (!res.error) {
            removeCommentMutation?.mutate(commentToDelete);
          }
        } catch (err) {
          console.error(err);
          showErrorToastPredefined(undefined);
        }
      },
      [removeCommentMutation, showErrorToastPredefined]
    );

    const onUserReport = useCallback(() => {
      // Redirect only after the persist data is pulled
      if (!userLoggedIn) {
        router.push(
          `/sign-up?reason=report&redirect=${encodeURIComponent(
            window.location.href
          )}`
        );
        return;
      }

      setConfirmReportUser(true);
    }, [userLoggedIn, router]);

    const onDeleteComment = () => {
      setConfirmDeleteComment(true);
    };

    const commentFormRef = useRef<TCommentFormAreaHandle>(null);

    const replyHandler = useCallback(() => {
      handleToggleReplies(comment.id as number, !comment?.isOpen);
      setTimeout(() => {
        commentFormRef.current?.handleFocusFormTextArea();
      }, 100);
    }, [comment.id, comment?.isOpen, handleToggleReplies]);

    const toggleRepliesHandler = useCallback(() => {
      handleToggleReplies(comment.id as number, !comment?.isOpen);
    }, [comment.id, comment?.isOpen, handleToggleReplies]);

    const isReplyFormOpenRef = useRef(isReplyFormOpen);

    useEffect(() => {
      if (
        isReplyFormOpen !== isReplyFormOpenRef.current &&
        updateCommentReplies
      ) {
        updateCommentReplies({
          id: comment.id as number,
          isOpen: isReplyFormOpen,
        });
      }

      if (
        isReplyFormOpen &&
        !isReplyFormOpenRef.current &&
        commentFormRef.current
      ) {
        isReplyFormOpenRef.current = true;
      }

      if (!isReplyFormOpen) {
        isReplyFormOpenRef.current = false;
      }
    }, [comment.id, isReplyFormOpen, updateCommentReplies]);

    const handleReplyChange = useCallback(
      (value: string) => {
        if (updateCommentReplies) {
          updateCommentReplies({
            id: comment.id as number,
            text: value,
          });
        }
      },
      [comment.id, updateCommentReplies]
    );

    useEffect(() => {
      const socketHandlerMessageCreated = async (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.CommentMessageCreated.decode(arr);
        if (
          decoded?.newComment &&
          decoded.newComment!!.sender?.uuid !== userData?.userUuid &&
          decoded.newComment?.parentCommentId &&
          decoded.newComment.parentCommentId === comment.id
        ) {
          addCommentMutation?.mutate(decoded.newComment);
        }
      };

      const socketHandlerMessageDeleted = (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.CommentMessageDeleted.decode(arr);
        if (
          decoded.deletedComment &&
          decoded.deletedComment?.parentCommentId &&
          decoded.deletedComment.parentCommentId === comment.id
        ) {
          removeCommentMutation?.mutate(decoded.deletedComment);
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
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketConnection, comment?.id, userData?.userUuid]);

    const moreButtonRef: any = useRef<HTMLButtonElement>();

    if (comment.isDeleted || comment?.sender?.options?.isTombstone) {
      return null;
    }

    return (
      <>
        <SComment
          id={`comment_id_${comment.id}`}
          isMoreMenuOpened={ellipseMenuOpen}
          ref={ref}
          data-index={index}
        >
          {!comment.isDeleted && !comment?.sender?.options?.isTombstone ? (
            comment.sender?.options?.isVerified ||
            comment.sender?.uuid === userData?.userUuid ? (
              <Link
                href={
                  comment.sender?.uuid === userData?.userUuid
                    ? userData?.options?.isCreator
                      ? '/profile/my-posts'
                      : '/profile'
                    : `/${comment.sender?.username}`
                }
              >
                <SUserAvatarAnchor
                  style={{
                    height: 'fit-content',
                  }}
                >
                  <SUserAvatar avatarUrl={comment.sender?.avatarUrl ?? ''} />
                </SUserAvatarAnchor>
              </Link>
            ) : (
              <SUserAvatar
                noHover
                avatarUrl={comment.sender?.avatarUrl ?? ''}
              />
            )
          ) : (
            <SUserAvatar noHover avatarUrl='' onClick={() => {}} />
          )}
          <SCommentContent>
            <SCommentHeader>
              {!comment.isDeleted ? (
                <>
                  {comment.sender?.options?.isVerified ||
                  comment.sender?.uuid === userData?.userUuid ? (
                    <SDisplayName
                      user={comment.sender}
                      altName={
                        comment.sender?.uuid === userData?.userUuid
                          ? t('comments.me')
                          : undefined
                      }
                      href={
                        comment.sender?.uuid === userData?.userUuid
                          ? userData?.options?.isCreator
                            ? '/profile/my-posts'
                            : '/profile'
                          : `/${comment.sender?.username}`
                      }
                    />
                  ) : (
                    <SDisplayName
                      user={comment.sender}
                      altName={
                        comment.sender?.uuid === userData?.userUuid
                          ? t('comments.me')
                          : undefined
                      }
                      noHover
                    />
                  )}
                </>
              ) : (
                <SCommentDeleted>
                  {t('comments.commentDeleted')}
                </SCommentDeleted>
              )}
              <SBid> </SBid>
              {!comment.isDeleted && (
                <SDate>
                  {/* &bull; {moment(comment.createdAt?.seconds as number * 1000).format('MMM DD')} */}
                  &bull;{' '}
                  {moment((comment.createdAt?.seconds as number) * 1000)
                    .locale(router.locale || 'en-US')
                    .fromNow()}
                </SDate>
              )}
              <SActionsDiv>
                {!comment.isDeleted && (
                  <SMoreButton
                    view='transparent'
                    iconOnly
                    ref={moreButtonRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEllipseMenu();
                    }}
                  >
                    <InlineSVG
                      svg={MoreIconFilled}
                      fill={theme.colorsThemed.text.secondary}
                      width='20px'
                      height='20px'
                    />
                  </SMoreButton>
                )}
                {/* Ellipse menu */}
                {!isMobile && (
                  <CommentEllipseMenu
                    isVisible={ellipseMenuOpen}
                    isMyComment={isMyComment}
                    canDeleteComment={
                      isMyComment ? true : canDeleteComment ?? false
                    }
                    handleClose={handleCloseEllipseMenu}
                    onDeleteComment={onDeleteComment}
                    onUserReport={onUserReport}
                    anchorElement={moreButtonRef.current}
                  />
                )}
              </SActionsDiv>
            </SCommentHeader>
            {!comment.isDeleted && <SText>{comment.content?.text}</SText>}
            {/* TODO: SReply is not clickable element */}
            {!comment.isDeleted &&
              (!isReplyFormOpen ? (
                <SReply onClick={replyHandler}>
                  {t('comments.sendReply')}
                </SReply>
              ) : (
                <>
                  {comment.numberOfReplies === 0 ? (
                    <SReply onClick={toggleRepliesHandler}>
                      {t('comments.hideReplies')}
                    </SReply>
                  ) : null}
                  <CommentForm
                    commentId={comment.id as number}
                    postUuidOrShortId={postShortId || postUuid}
                    onSubmit={(newMsg: string) =>
                      handleAddComment(newMsg, comment.id as number)
                    }
                    onBlur={onFormBlur ?? undefined}
                    onFocus={onFormFocus ?? undefined}
                    ref={commentFormRef}
                    value={commentReply?.text}
                    onChange={handleReplyChange}
                  />
                </>
              ))}
            {!comment.isDeleted &&
            comment.numberOfReplies &&
            (comment.numberOfReplies as number) > 0 ? (
              <SReply onClick={toggleRepliesHandler}>
                {isReplyFormOpen
                  ? t('comments.hideReplies')
                  : t('comments.viewReplies')}{' '}
                {comment.numberOfReplies?.toString()}{' '}
                {(comment.numberOfReplies as number) > 1
                  ? t('comments.replies')
                  : t('comments.reply')}
              </SReply>
            ) : null}
            {isReplyFormOpen &&
              replies &&
              replies.map((item, i) => (
                <CommentChild
                  key={item.id.toString()}
                  isDeletingComment={isDeletingComment}
                  canDeleteComment={canDeleteComment}
                  lastChild={i === replies.length - 1}
                  comment={item}
                  handleDeleteComment={handleDeleteChildComment}
                />
              ))}
            {/* TEMP */}
            {isReplyFormOpen &&
              hasNextPage &&
              !isFetchingNextPage &&
              !isLoading && (
                <SReply onClick={() => fetchNextPage()}>
                  {t('comments.loadReplies')}
                </SReply>
              )}
            {(comment.numberOfReplies &&
              (comment.numberOfReplies as number) > 0 &&
              isLoading) ||
            isFetchingNextPage ? (
              <SLoaderDiv>
                <Loader size='sm' isStatic />
              </SLoaderDiv>
            ) : null}
          </SCommentContent>
          <DeleteCommentModal
            isVisible={confirmDeleteComment}
            isDeletingComment={isDeletingComment}
            closeModal={() => setConfirmDeleteComment(false)}
            handleConfirmDelete={async () => {
              await handleDeleteComment(comment);
              setConfirmDeleteComment(false);
            }}
          />
        </SComment>
        {!lastChild && <SSeparator />}
        {isMobile ? (
          <CommentEllipseModal
            isOpen={ellipseMenuOpen}
            zIndex={16}
            isMyComment={isMyComment}
            canDeleteComment={isMyComment ? true : canDeleteComment ?? false}
            onClose={handleCloseEllipseMenu}
            onUserReport={onUserReport}
            onDeleteComment={onDeleteComment}
          />
        ) : null}
        {!comment.isDeleted && comment.sender && (
          <ReportModal
            show={confirmReportUser}
            reportedUser={comment.sender}
            onClose={() => setConfirmReportUser(false)}
            onSubmit={async ({ reasons, message }) => {
              await reportMessage(comment.id as number, reasons, message);
            }}
          />
        )}
      </>
    );
  }
);

export default CommentParent;

CommentParent.defaultProps = {
  lastChild: false,
  canDeleteComment: false,
  onFormFocus: () => {},
  onFormBlur: () => {},
};

const SUserAvatar = styled(UserAvatar)<{
  noHover?: boolean;
}>`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  flex-shrink: 0;
  margin-right: 12px;
  margin-bottom: 14px;
  cursor: ${({ noHover }) => (!noHover ? 'pointer' : 'default')};
`;

const OpenedFlash = keyframes`
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
  }
`;

const SMoreButton = styled(Button)`
  padding: 2px;

  background: none;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  ${({ theme }) => theme.media.laptop} {
    opacity: 0;

    padding: 8px;
  }

  @media (hover: none) {
    &:active:enabled {
      background: none;
    }
  }
`;

const SComment = styled.div<{ isMoreMenuOpened: boolean }>`
  position: relative;
  display: flex;

  width: 100%;

  padding-top: 12px;

  // For scrollIntoView when comment_id is provided in URL
  scroll-margin-top: 100px;

  &.opened-flash {
    &::before {
      content: '';

      position: absolute;

      width: 100%;
      height: 100%;

      z-index: 1;

      background: ${({ theme }) =>
        theme.name === 'dark'
          ? 'linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 102.97%)'
          : 'linear-gradient(90deg, rgb(11, 10, 19, 0.8) 0%, rgba(11, 10, 19, 0) 100%)'};
      box-shadow: ${({ theme }) =>
        theme.name === 'dark'
          ? '4px 4px 100px 75px rgba(34, 60, 80, 0.2)'
          : '4px 4px 100px 75px rgba(34, 60, 80, 0.8) inset'};
      animation: ${OpenedFlash} 1.5s infinite linear;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    &:hover {
      ${SMoreButton} {
        opacity: 1;
      }
    }

    ${({ isMoreMenuOpened }) =>
      isMoreMenuOpened
        ? css`
            ${SMoreButton} {
              opacity: 1;
            }
          `
        : null}
  }
`;

const SCommentContent = styled.div`
  width: 100%;
  overflow: hidden;
`;

const SCommentHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  margin-bottom: 6px;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  cursor: text;
  display: flex;
  align-items: center;
`;

const SActionsDiv = styled.div`
  position: relative;
  margin-left: auto;
`;

const SDisplayName = styled(DisplayName)<{
  noHover?: boolean;
}>`
  flex-shrink: 0;
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  cursor: ${({ noHover }) => (!noHover ? 'pointer' : 'default')};

  transition: 0.2s linear;

  :hover {
    color: ${(props) =>
      !props.noHover
        ? props.theme.colorsThemed.text.primary
        : props.theme.colorsThemed.text.secondary};
  }
`;

const SCommentDeleted = styled.span`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;

const SBid = styled.span`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-left: 5px;
  span {
    color: ${(props) => props.theme.colors.white};
    margin: 0 5px;
  }
`;

const SDate = styled.span`
  flex-shrink: 1;
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
`;

const SText = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 14px;
  cursor: text;

  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
  user-select: text;

  // Don't go under more button
  margin-right: 24px;

  ${({ theme }) => theme.media.laptop} {
    margin-right: 36px;
  }
`;

const SReply = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 16px;
  cursor: pointer;
`;

const SSeparator = styled.div`
  height: 1px;
  overflow: hidden;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.outlines1
      : props.theme.colorsThemed.background.tertiary};
  border: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
`;

const SLoaderDiv = styled.div`
  position: relative;
  height: 50px;
`;

const SUserAvatarAnchor = styled.a`
  height: fit-content;
`;
