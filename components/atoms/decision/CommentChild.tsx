/* eslint-disable no-nested-ternary */
import React, { useCallback, useMemo, useState, useRef } from 'react';
import styled, { keyframes, useTheme, css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import moment from 'moment';

import Button from '../Button';
import InlineSVG from '../InlineSVG';
import UserAvatar from '../../molecules/UserAvatar';

import { useUserData } from '../../../contexts/userDataContext';
import { useAppState } from '../../../contexts/appStateContext';
import { TCommentWithReplies } from '../../interfaces/tcomment';
import { reportMessage } from '../../../api/endpoints/report';

import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import DisplayName from '../DisplayName';

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

interface ICommentChild {
  lastChild?: boolean;
  comment: TCommentWithReplies;
  isDeletingComment: boolean;
  canDeleteComment?: boolean;
  index?: number;
  handleDeleteComment: (commentToDelete: TCommentWithReplies) => void;
  setCommentHeight?: (index: number, height: number) => void;
}

const CommentChild = React.forwardRef<HTMLDivElement, ICommentChild>(
  (
    {
      comment,
      lastChild,
      canDeleteComment,
      isDeletingComment,
      index,
      handleDeleteComment,
    },
    ref: any
  ) => {
    const theme = useTheme();
    const router = useRouter();
    const { t } = useTranslation('page-Post');
    const { userData } = useUserData();
    const { resizeMode, userLoggedIn, userIsCreator } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);

    const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
    const [confirmDeleteComment, setConfirmDeleteComment] =
      useState<boolean>(false);

    const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
    const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);

    const isMyComment = useMemo(
      () => userLoggedIn && userData?.userUuid === comment.sender?.uuid,
      [userLoggedIn, userData?.userUuid, comment.sender?.uuid]
    );

    const onUserReport = useCallback(() => {
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
          {
            // eslint-disable-next-line no-nested-ternary
            !comment.isDeleted && !comment?.sender?.options?.isTombstone ? (
              comment.sender?.options?.isVerified ||
              comment.sender?.uuid === userData?.userUuid ? (
                <Link
                  href={
                    comment.sender?.uuid === userData?.userUuid
                      ? userIsCreator
                        ? '/profile/my-posts'
                        : '/profile'
                      : `/${comment.sender?.username}`
                  }
                >
                  <a>
                    <SUserAvatar avatarUrl={comment.sender?.avatarUrl ?? ''} />
                  </a>
                </Link>
              ) : (
                <SUserAvatar
                  noHover
                  avatarUrl={comment.sender?.avatarUrl ?? ''}
                />
              )
            ) : (
              <SUserAvatar noHover avatarUrl='' onClick={() => {}} />
            )
          }
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
                          ? userIsCreator
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

export default CommentChild;

CommentChild.defaultProps = {
  lastChild: false,
  canDeleteComment: false,
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

const SSeparator = styled.div`
  height: 1px;
  overflow: hidden;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.outlines1
      : props.theme.colorsThemed.background.tertiary};
  border: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
`;
