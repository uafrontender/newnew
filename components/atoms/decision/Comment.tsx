/* eslint-disable no-unsafe-optional-chaining */
import React, { useMemo, useRef, useState } from 'react';
import moment from 'moment';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import Button from '../Button';
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import { useAppSelector } from '../../../redux-store/store';
import InlineSVG from '../InlineSVG';
import UserAvatar from '../../molecules/UserAvatar';
import CommentForm from './CommentForm';
import { useOnClickOutside } from '../../../utils/hooks/useOnClickOutside';
import { TCommentWithReplies } from '../../interfaces/tcomment';

const CommentEllipseMenu = dynamic(() => import('../../molecules/decision/CommentEllipseMenu'));
const CommentEllipseModal = dynamic(() => import('../../molecules/decision/CommentEllipseModal'));
const ReportUserModal = dynamic(() => import('../../molecules/chat/ReportUserModal'));
const DeleteCommentModal = dynamic(() => import('../../molecules/decision/DeleteCommentModal'));

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
  const { t } = useTranslation('decision');
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
  const [confirmDeleteComment, setConfirmDeleteComment] = useState<boolean>(false);

  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);

  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);

  const replies = useMemo(() => (
    comment.replies ?? []
  ), [comment.replies]);

  const formRef: any = useRef();
  useOnClickOutside(formRef, () => {
    setIsReplyFormOpen(false);
  });

  const onUserReport = () => {
    setConfirmReportUser(true);
  };

  const onDeleteComment = () => {
    setConfirmDeleteComment(true);
  }

  const replyHandler = () => {
    setIsReplyFormOpen(!isReplyFormOpen);
  };

  return (
    <>
      <SComment
        key={(comment.id).toString()}
      >
        <SUserAvatar avatarUrl={comment.sender?.avatarUrl ? comment.sender?.avatarUrl : ''} />
        <SCommentContent ref={formRef}>
          <SCommentHeader>
            <SNickname>{comment.sender?.nickname}</SNickname>
            <SBid>
              {' '}
            </SBid>
            <SDate> &bull; {moment(comment.createdAt?.seconds as number * 1000).format('MMM DD')}</SDate>
            <SActionsDiv>
              <SMoreButton
                view="transparent"
                iconOnly
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEllipseMenu();
                }}
              >
                <InlineSVG svg={MoreIconFilled} fill={theme.colorsThemed.text.secondary} width="20px" height="20px" />
              </SMoreButton>
              {/* Ellipse menu */}
              {!isMobile && (
                <CommentEllipseMenu
                  isVisible={ellipseMenuOpen}
                  canDeleteComment={canDeleteComment ?? false}
                  handleClose={handleCloseEllipseMenu}
                  onDeleteComment={onDeleteComment}
                  onUserReport={onUserReport}
                />
              )}
            </SActionsDiv>
          </SCommentHeader>
          <SText>{comment.content?.text}</SText>
          {!comment.parentId && (
            !isReplyFormOpen ? (
              <SReply onClick={replyHandler}>{t('comments.send-reply')}</SReply>
            ) : (
              <CommentForm
                onSubmit={(newMsg: string) => handleAddComment(newMsg)}
              />
            )
          )}
          {!comment.parentId && replies && replies.length > 0 && (
            <SReply
              onClick={replyHandler}
            >
              {isReplyFormOpen ? t('comments.hide-replies') : t('comments.view-replies')} {replies.length}{' '}
              {replies.length > 1 ? t('comments.replies') : t('comments.reply')}
            </SReply>
          )}
          {isReplyFormOpen && replies && replies.map((item) => (
            <Comment
              key={(item.id).toString()}
              canDeleteComment={canDeleteComment}
              comment={item}
              handleAddComment={(newMsg: string) => handleAddComment(newMsg)}
              handleDeleteComment={() => handleDeleteComment(item as TCommentWithReplies)}
            />
            )
          )}
          {!lastChild && <SSeparator />}
        </SCommentContent>
        <ReportUserModal
          confirmReportUser={confirmReportUser}
          user={comment.sender!!}
          closeModal={() => setConfirmReportUser(false)}
        />
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
          canDeleteComment={canDeleteComment ?? false}
          onClose={handleCloseEllipseMenu}
          onUserReport={onUserReport}
          onDeleteComment={onDeleteComment}
        />
      ) : null}
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

const SComment = styled.div`
  /* display: grid; */

  display: flex;

  width: 100%;
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
