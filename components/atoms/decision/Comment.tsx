/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
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

const CommentEllipseMenu = dynamic(
  () => import('../../molecules/decision/CommentEllipseMenu')
);
const CommentEllipseModal = dynamic(
  () => import('../../molecules/decision/CommentEllipseModal')
);
const ReportModal = dynamic(() => import('../../molecules/chat/ReportModal'));
const DeleteCommentModal = dynamic(
  () => import('../../molecules/decision/DeleteCommentModal')
);

interface IComment {
  lastChild?: boolean;
  comment: TCommentWithReplies;
  canDeleteComment?: boolean;
  handleAddComment: (newMsg: string) => void;
  handleDeleteComment: (commentToDelete: TCommentWithReplies) => void;
}

const Comment: React.FC<IComment> = ({
  comment,
  lastChild,
  canDeleteComment,
  handleAddComment,
  handleDeleteComment,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('decision');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
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
    setConfirmReportUser(true);
  }, []);

  const onDeleteComment = () => {
    setConfirmDeleteComment(true);
  };

  const replyHandler = () => {
    setIsReplyFormOpen(!isReplyFormOpen);
  };

  const handleRedirectToUser = () => {
    window?.history.replaceState(
      {
        fromPost: true,
      },
      '',
      ''
    );
    router.push(`/${comment.sender?.username}`);
  };

  useEffect(() => {
    if (comment.isOpen) {
      setIsReplyFormOpen(true);
    }
  }, [comment.isOpen]);

  return (
    <>
      <SComment key={comment.id.toString()} id={`comment_id_${comment.id}`}>
        {!comment.isDeleted ? (
          <SUserAvatar
            avatarUrl={
              comment.sender?.avatarUrl ? comment.sender?.avatarUrl : ''
            }
            onClick={() => handleRedirectToUser()}
          />
        ) : (
          <SUserAvatar avatarUrl='' onClick={() => {}} />
        )}
        <SCommentContent>
          <SCommentHeader>
            <SNickname
              onClick={() => {
                if (!comment.isDeleted) {
                  handleRedirectToUser();
                }
              }}
            >
              {!comment.isDeleted
                ? comment.sender?.uuid === user.userData?.userUuid
                  ? t('comments.me')
                  : comment.sender?.nickname ?? comment.sender?.username
                : t('comments.comment_deleted')}
            </SNickname>
            <SBid> </SBid>
            <SDate>
              {/* &bull; {moment(comment.createdAt?.seconds as number * 1000).format('MMM DD')} */}
              &bull;{' '}
              {moment((comment.createdAt?.seconds as number) * 1000).fromNow()}
            </SDate>
            <SActionsDiv>
              <SMoreButton
                view='transparent'
                iconOnly
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
                />
              )}
            </SActionsDiv>
          </SCommentHeader>
          <SText>{comment.content?.text}</SText>
          {!comment.parentId &&
            (!isReplyFormOpen ? (
              <SReply onClick={replyHandler}>{t('comments.send-reply')}</SReply>
            ) : (
              <>
                {replies.length === 0 ? (
                  <SReply onClick={replyHandler}>
                    {t('comments.hide-replies')}
                  </SReply>
                ) : null}
                <CommentForm
                  onSubmit={(newMsg: string) => handleAddComment(newMsg)}
                />
              </>
            ))}
          {!comment.parentId && replies && replies.length > 0 && (
            <SReply onClick={replyHandler}>
              {isReplyFormOpen
                ? t('comments.hide-replies')
                : t('comments.view-replies')}{' '}
              {replies.length}{' '}
              {replies.length > 1 ? t('comments.replies') : t('comments.reply')}
            </SReply>
          )}
          {isReplyFormOpen &&
            replies &&
            replies.map((item) => (
              <Comment
                key={item.id.toString()}
                canDeleteComment={
                  isMyComment ? true : canDeleteComment ?? false
                }
                comment={item}
                handleAddComment={(newMsg: string) => handleAddComment(newMsg)}
                handleDeleteComment={handleDeleteComment}
              />
            ))}
          {!lastChild && <SSeparator />}
        </SCommentContent>
        <DeleteCommentModal
          isVisible={confirmDeleteComment}
          closeModal={() => setConfirmDeleteComment(false)}
          handleConfirmDelete={async () => {
            await handleDeleteComment(comment);
            setConfirmDeleteComment(false);
          }}
        />
      </SComment>
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
          onSubmit={async ({ reason, message }) => {
            reportMessage(comment.id, reason, message);
            setConfirmReportUser(false);
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
};

const SUserAvatar = styled(UserAvatar)`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  flex-shrink: 0;
  margin-right: 12px;
  cursor: pointer;
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

const SNickname = styled.span`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  cursor: pointer;
  margin-right: 5px;

  transition: 0.2s linear;

  :hover {
    color: ${(props) => props.theme.colorsThemed.text.primary};
  }
`;

const SBid = styled.span`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  span {
    color: ${(props) => props.theme.colors.white};
    margin: 0 5px;
  }
`;

const SDate = styled.span`
  font-size: 12px;
`;

const SText = styled.p`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 14px;
  cursor: text;
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
