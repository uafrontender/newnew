import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

import preventParentClick from '../../../utils/preventParentClick';


import Modal from '../../organisms/Modal';
import GoBackButton from '../GoBackButton';
import Comment from '../../atoms/decision/Comment';
import { TCommentWithReplies } from '../../interfaces/tcomment';
import CommentForm from '../../atoms/decision/CommentForm';

interface IMoreCommentsModal {
  isVisible: boolean;
  comments: any[];
  commentsLoading: boolean;
  commentsNextPageToken: string | undefined | null;
  canDeleteComment?: boolean;
  handleFetchComments: (token?: string) => void;
  handleAddComment: (newMsg: string, parentId?: number) => void;
  handleDeleteComment: (commentToDelete: TCommentWithReplies) => void;
  closeMoreCommentsModal: () => void;
}

const MoreCommentsModal: React.FC<IMoreCommentsModal> = ({
  comments,
  isVisible,
  commentsLoading,
  commentsNextPageToken,
  canDeleteComment,
  handleAddComment,
  handleDeleteComment,
  handleFetchComments,
  closeMoreCommentsModal,
}) => {
  const { t } = useTranslation('decision');

  // Infinite load
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  useEffect(() => {
    if (inView && !commentsLoading && commentsNextPageToken) {
      console.log(`fetching comments from in view with token ${commentsNextPageToken}`);
      handleFetchComments(commentsNextPageToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, commentsNextPageToken, commentsLoading]);

  return (
    <Modal show={isVisible} onClose={closeMoreCommentsModal}>
      <SContainer>
        <SModal onClick={preventParentClick()}>
          <SModalHeader>
            <GoBackButton
              onClick={closeMoreCommentsModal}
            >
              <SModalTitle>{t('comments.comments')}</SModalTitle>
            </GoBackButton>
          </SModalHeader>
          <SWrapper>
            <SActionSection>
              <SCommentsWrapper>
                {comments && comments.map((item, index) => (
                  <Comment
                    key={(item.id).toString()}
                    canDeleteComment={canDeleteComment}
                    lastChild={index === comments.length - 1} comment={item}
                    handleAddComment={(newMsg: string) => handleAddComment(newMsg, item.id as number)}
                    handleDeleteComment={() => handleDeleteComment(item)}
                  />
                ))}
                <SLoaderDiv
                  ref={loadingRef}
                  style={{
                    ...(commentsLoading ? {
                      display: 'none'
                    } : {}),
                  }}
                />
              </SCommentsWrapper>
              <SCommentFormWrapper>
                <CommentForm
                  onSubmit={(newMsg: string) => handleAddComment(newMsg)}
                />
              </SCommentFormWrapper>
            </SActionSection>
          </SWrapper>
        </SModal>
      </SContainer>
    </Modal>
  );
};

MoreCommentsModal.defaultProps = {
  canDeleteComment: false,
}

export default MoreCommentsModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  width: 100%;
  background: ${(props) =>
    props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.primary};
  color: ${(props) =>
    props.theme.name === 'light' ? props.theme.colorsThemed.text.primary : props.theme.colors.white};
  padding: 0 16px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
  height: 100%;
  overflow: auto;

  padding-top: 64px;

  ${(props) => props.theme.media.tablet} {
    height: auto;
    padding: 24px;
    max-width: 480px;
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }
`;

const SModalHeader = styled.div`
  position: fixed;
  top: 0;
  width: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};
  z-index: 10;

  display: flex;
  height: 58px;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
  ${(props) => props.theme.media.tablet} {
    display: block;
    height: auto;
    margin: 0 0 24px;
  }
`;

const SModalTitle = styled.strong`
  font-size: 14px;
  margin: 0;
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  ${(props) => props.theme.media.tablet} {
    font-size: 20px;
    margin-bottom: 16px;
  }
`;

const SWrapper = styled.div``;

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

  padding-bottom: 96px;
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SCommentFormWrapper = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;

  padding-top: 16px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  & > form {
    position: static;

    width: calc(100% - 32px);
  }
`;
