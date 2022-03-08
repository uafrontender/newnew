import React, { useRef, useState } from 'react';
import moment from 'moment';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import Button from '../Button';
import randomID from '../../../utils/randomIdGenerator';
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import { useAppSelector } from '../../../redux-store/store';
import InlineSVG from '../InlineSVG';
import UserAvatar from '../../molecules/UserAvatar';
import CommentForm from './CommentForm';
import { useOnClickOutside } from '../../../utils/hooks/useOnClickOutside';

const ChatEllipseMenu = dynamic(() => import('../../molecules/decision/ChatEllipseMenu'));
const ChatEllipseModal = dynamic(() => import('../../molecules/decision/ChatEllipseModal'));
const ReportUserModal = dynamic(() => import('../../molecules/chat/ReportUserModal'));

interface IComment {
  lastChild?: boolean;
  comment: {
    id: number;
    parent_id: number;
    user: newnewapi.IUser;
    message: string;
    bid: string;
    created_at: moment.Moment;
    replies: any[];
  };
}

const Comment: React.FC<IComment> = ({ lastChild, comment }) => {
  const { t } = useTranslation('decision');
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
  const [reply, setReply] = useState(false);
  const [replies, setReplice] = useState(false);
  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);

  const formRef: any = useRef();
  useOnClickOutside(formRef, () => {
    setReply(false);
  });

  const onUserReport = () => {
    setConfirmReportUser(true);
  };

  const replyHandler = () => {
    setReply(!reply);
  };

  const repliesHandler = () => {
    setReplice(!replies);
  };

  return (
    <SComment key={randomID()}>
      <SUserAvatar avatarUrl={comment.user.avatarUrl ? comment.user.avatarUrl : ''} />
      <SCommentContent ref={formRef}>
        <SCommentHeader>
          <SNickname>{comment.user.nickname}</SNickname>
          <SBid>
            {' '}
            bid <span>{comment.bid}</span>
          </SBid>
          <SDate> &bull; {moment(comment.created_at).format('MMM DD')}</SDate>
          <SActionsDiv>
            <SMoreButton view="transparent" iconOnly onClick={() => handleOpenEllipseMenu()}>
              <InlineSVG svg={MoreIconFilled} fill={theme.colorsThemed.text.secondary} width="20px" height="20px" />
            </SMoreButton>
            {/* Ellipse menu */}
            {!isMobile && (
              <ChatEllipseMenu
                isVisible={ellipseMenuOpen}
                handleClose={handleCloseEllipseMenu}
                onUserReport={onUserReport}
              />
            )}
            {isMobile && ellipseMenuOpen ? (
              <ChatEllipseModal
                isOpen={ellipseMenuOpen}
                zIndex={11}
                onClose={handleCloseEllipseMenu}
                onUserReport={onUserReport}
              />
            ) : null}
          </SActionsDiv>
        </SCommentHeader>
        <SText>{comment.message}</SText>
        {!reply ? (
          <SReply onClick={replyHandler}>{t('comments.send-reply')}</SReply>
        ) : (
          <CommentForm onBlur={replyHandler} />
        )}
        {comment.replies.length > 0 && (
          <SReply onClick={repliesHandler}>
            {replies ? t('comments.hide-replies') : t('comments.view-replies')} {comment.replies.length}{' '}
            {comment.replies.length > 1 ? t('comments.replies') : t('comments.reply')}
          </SReply>
        )}
        {replies && comment.replies.map((item) => <Comment key={randomID()} comment={item} />)}
        {!lastChild && <SSeparator />}
      </SCommentContent>
      <ReportUserModal
        confirmReportUser={confirmReportUser}
        user={comment.user}
        closeModal={() => setConfirmReportUser(false)}
      />
    </SComment>
  );
};

export default Comment;

Comment.defaultProps = {
  lastChild: false,
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
  display: flex;
`;

const SCommentContent = styled.div``;

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
