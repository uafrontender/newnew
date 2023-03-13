/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import moment from 'moment';

import Button from '../Button';
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import { useAppSelector } from '../../../redux-store/store';
import InlineSVG from '../InlineSVG';
import UserAvatar from '../../molecules/UserAvatar';
import CommentForm from './CommentForm';
import { TCommentWithReplies } from '../../interfaces/tcomment';
import { reportMessage } from '../../../api/endpoints/report';
import getDisplayname from '../../../utils/getDisplayname';
import { useAppState } from '../../../contexts/appStateContext';
import DisplayName from '../../DisplayName';

const CommentEllipseMenu = dynamic(
  () => import('../../molecules/decision/common/CommentEllipseMenu')
);
const CommentEllipseModal = dynamic(
  () => import('../../molecules/decision/common/CommentEllipseModal')
);
const ReportModal = dynamic(
  () => import('../../molecules/direct-messages/ReportModal')
);
const DeleteCommentModal = dynamic(
  () => import('../../molecules/decision/common/DeleteCommentModal')
);

interface IComment {
  lastChild?: boolean;
  comment: TCommentWithReplies;
  isDeletingComment: boolean;
  canDeleteComment?: boolean;
  handleAddComment: (newMsg: string) => void;
  handleDeleteComment: (commentToDelete: TCommentWithReplies) => void;
  onFormFocus?: () => void;
  onFormBlur?: () => void;
}

const Comment: React.FC<IComment> = ({
  comment,
  lastChild,
  canDeleteComment,
  isDeletingComment,
  handleAddComment,
  handleDeleteComment,
  onFormFocus,
  onFormBlur,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('page-Post');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);

  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
  const [confirmDeleteComment, setConfirmDeleteComment] =
    useState<boolean>(false);

  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);

  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);

  const isMyComment = useMemo(
    () => user.loggedIn && user.userData?.userUuid === comment.sender?.uuid,
    [user.loggedIn, user.userData?.userUuid, comment.sender?.uuid]
  );

  const replies = useMemo(() => comment.replies ?? [], [comment.replies]);

  const onUserReport = useCallback(() => {
    // Redirect only after the persist data is pulled
    if (!user.loggedIn && user._persist?.rehydrated) {
      router.push(
        `/sign-up?reason=report&redirect=${encodeURIComponent(
          window.location.href
        )}`
      );
      return;
    }

    setConfirmReportUser(true);
  }, [user, router]);

  const onDeleteComment = () => {
    setConfirmDeleteComment(true);
  };

  const replyHandler = () => {
    setIsReplyFormOpen(!isReplyFormOpen);
  };

  useEffect(() => {
    if (comment.isOpen) {
      setIsReplyFormOpen(true);
    }
  }, [comment.isOpen]);

  const moreButtonRef: any = useRef<HTMLButtonElement>();

  if (comment.isDeleted || comment?.sender?.options?.isTombstone) return null;

  return (
    <>
      <SComment key={comment.id.toString()} id={`comment_id_${comment.id}`}>
        {!comment.isDeleted && !comment?.sender?.options?.isTombstone ? (
          comment.sender?.options?.isVerified ||
          comment.sender?.uuid === user.userData?.userUuid ? (
            <Link href={`/${comment.sender?.username}`}>
              <SUserAvatar avatarUrl={comment.sender?.avatarUrl ?? ''} />
            </Link>
          ) : (
            <SUserAvatar noHover avatarUrl={comment.sender?.avatarUrl ?? ''} />
          )
        ) : (
          <SUserAvatar noHover avatarUrl='' onClick={() => {}} />
        )}
        <SCommentContent>
          <SCommentHeader>
            {!comment.isDeleted ? (
              <>
                {comment.sender?.options?.isVerified ||
                comment.sender?.uuid === user.userData?.userUuid ? (
                  <SDisplayName
                    user={comment.sender}
                    altName={
                      comment.sender?.uuid === user.userData?.userUuid
                        ? t('comments.me')
                        : undefined
                    }
                    href={`/${comment.sender?.username}`}
                  />
                ) : (
                  <SDisplayName
                    user={comment.sender}
                    altName={
                      comment.sender?.uuid === user.userData?.userUuid
                        ? t('comments.me')
                        : undefined
                    }
                    noHover
                  />
                )}
              </>
            ) : (
              <SCommentDeleted>{t('comments.commentDeleted')}</SCommentDeleted>
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
          {!comment.parentId &&
            !comment.isDeleted &&
            (!isReplyFormOpen ? (
              <SReply onClick={replyHandler}>{t('comments.sendReply')}</SReply>
            ) : (
              <>
                {replies.length === 0 ? (
                  <SReply onClick={replyHandler}>
                    {t('comments.hideReplies')}
                  </SReply>
                ) : null}
                <CommentForm
                  onSubmit={(newMsg: string) => handleAddComment(newMsg)}
                  onBlur={onFormBlur ?? undefined}
                  onFocus={onFormFocus ?? undefined}
                />
              </>
            ))}
          {!comment.parentId &&
            !comment.isDeleted &&
            replies &&
            replies.length > 0 && (
              <SReply onClick={replyHandler}>
                {isReplyFormOpen
                  ? t('comments.hideReplies')
                  : t('comments.viewReplies')}{' '}
                {replies.length}{' '}
                {replies.length > 1
                  ? t('comments.replies')
                  : t('comments.reply')}
              </SReply>
            )}
          {isReplyFormOpen &&
            replies &&
            replies.map((item, index) => (
              <Comment
                key={item.id.toString()}
                isDeletingComment={isDeletingComment}
                canDeleteComment={canDeleteComment}
                lastChild={index === replies.length - 1}
                comment={item}
                handleAddComment={(newMsg: string) => handleAddComment(newMsg)}
                handleDeleteComment={handleDeleteComment}
              />
            ))}
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
          reportedDisplayname={getDisplayname(comment.sender)}
          onClose={() => setConfirmReportUser(false)}
          onSubmit={async ({ reasons, message }) => {
            await reportMessage(comment.id, reasons, message);
          }}
        />
      )}
    </>
  );
};

export default Comment;

Comment.defaultProps = {
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

const SComment = styled.div`
  position: relative;
  display: flex;

  width: 100%;

  // For scrollIntoView when comment_id is provided in URL
  scroll-margin-top: -320px;

  &.opened-flash {
    &::before {
      content: '';

      position: absolute;

      width: 100%;
      height: 100%;

      background: ${({ theme }) =>
        theme.name === 'dark'
          ? 'linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 102.97%)'
          : 'linear-gradient(90deg, rgb(11, 10, 19, 0.8) 0%, rgba(11, 10, 19, 0) 100%)'};
      box-shadow: 4px 4px 100px 75px rgba(34, 60, 80, 0.2);
      animation: ${OpenedFlash} 1.5s forwards linear;
    }
  }
`;

const SCommentContent = styled.div`
  width: 100%;
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

const SMoreButton = styled(Button)`
  background: none;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  padding: 8px;
  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;

const SDisplayName = styled(DisplayName)<{
  noHover?: boolean;
}>`
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
`;

const SReply = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 16px;
  cursor: pointer;
`;

const SSeparator = styled.div`
  margin: 0 0 12px;
  height: 1px;
  overflow: hidden;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.outlines1
      : props.theme.colorsThemed.background.tertiary};
  border: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
`;
