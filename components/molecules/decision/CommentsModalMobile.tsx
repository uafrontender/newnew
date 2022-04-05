/* eslint-disable no-plusplus */
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

import preventParentClick from '../../../utils/preventParentClick';


import Modal from '../../organisms/Modal';
import GoBackButton from '../GoBackButton';
import Comment from '../../atoms/decision/Comment';
import { TCommentWithReplies } from '../../interfaces/tcomment';
import CommentForm from '../../atoms/decision/CommentForm';
import Text from '../../atoms/Text';

import NoContentYetImg from '../../../public/images/decision/no-content-yet-mock.png';

interface ICommentsModalMobile {
  isVisible: boolean;
  comments: any[];
  commentsLoading: boolean;
  commentsNextPageToken: string | undefined | null;
  canDeleteComment?: boolean;
  commentIdFromUrl?: string;
  handleResetCommentIdFromUrl: () => any;
  handleSetComments: React.Dispatch<React.SetStateAction<TCommentWithReplies[]>>;
  handleFetchComments: (token?: string) => void;
  handleAddComment: (newMsg: string, parentId?: number) => void;
  handleDeleteComment: (commentToDelete: TCommentWithReplies) => void;
  closeCommentsModalMobile: () => void;
}

const CommentsModalMobile: React.FC<ICommentsModalMobile> = ({
  comments,
  isVisible,
  commentsLoading,
  commentsNextPageToken,
  canDeleteComment,
  commentIdFromUrl,
  handleResetCommentIdFromUrl,
  handleAddComment,
  handleDeleteComment,
  handleSetComments,
  handleFetchComments,
  closeCommentsModalMobile,
}) => {
  const { t } = useTranslation('decision');
  const scrollRef = useRef<HTMLDivElement>();
  const commentsWrapper = useRef<HTMLDivElement>();

  // Infinite load
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  useEffect(() => {
    if (inView && !commentsLoading && commentsNextPageToken) {
      // console.log(`fetching comments from in view with token ${commentsNextPageToken}`);
      handleFetchComments(commentsNextPageToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, commentsNextPageToken, commentsLoading]);

  useEffect(() => {
    if (commentIdFromUrl) {
      const flat: TCommentWithReplies[] = [];
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].replies && Array.isArray(comments[i].replies) && comments[i].replies!!.length > 0) {
          flat.push(...[comments[i], ...comments[i].replies!!])
        }
        flat.push(comments[i]);
      }

      const idx = flat.findIndex((comment) => comment.id === parseInt(commentIdFromUrl, 10))

      if (idx === -1) {
        // console.log('Looking further');
        scrollRef.current?.scrollBy({
          top: scrollRef.current.scrollHeight,
        })
      } else {
        // console.log('Found the comment');

        if (!flat[idx].parentId || flat[idx].parentId === 0) {
          const offset = (commentsWrapper?.current?.childNodes[idx] as HTMLDivElement).offsetTop

          scrollRef.current?.scrollTo({
            top: offset,
          });
          document?.getElementById(`comment_id_${flat[idx].id}`)?.classList.add('opened-flash');
        } else if (flat[idx].parentId) {
          const parentIdx = comments.findIndex((c) => c.id === flat[idx].parentId);

          if (parentIdx !== -1) {
            handleSetComments((curr) => {
              const working = [...curr];
              working[parentIdx].isOpen = true;
              return working;
            });

            setTimeout(() => {
              document?.getElementById(`comment_id_${flat[idx].id}`)?.scrollIntoView();
              document?.getElementById(`comment_id_${flat[idx].id}`)?.classList.add('opened-flash');
            }, 100);
          }
        }

        handleResetCommentIdFromUrl?.();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentIdFromUrl, comments]);

  return (
    <Modal show={isVisible} onClose={closeCommentsModalMobile}>
      <SContainer>
        <SModal
          ref={(el) => {
            scrollRef.current = el!!;
          }}
          onClick={preventParentClick()}
        >
          <SModalHeader>
            <GoBackButton
              onClick={closeCommentsModalMobile}
            >
              <SModalTitle>{t('comments.comments')}</SModalTitle>
            </GoBackButton>
          </SModalHeader>
          <SWrapper>
            <SActionSection>
              <SCommentsWrapper
                ref={(el) => {
                  commentsWrapper.current = el!!;
                }}
              >
                {comments.length === 0 && !commentsLoading ? (
                  <SNoCommentsYet>
                    <SNoCommentsImgContainer>
                      <img
                        src={NoContentYetImg.src}
                        alt='No content yet'
                      />
                    </SNoCommentsImgContainer>
                    <SNoCommentsCaption
                      variant={3}
                    >
                      { t('comments.noCommentsCaption') }
                    </SNoCommentsCaption>
                  </SNoCommentsYet>
                ) : null}
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

CommentsModalMobile.defaultProps = {
  canDeleteComment: false,
  commentIdFromUrl: undefined,
}

export default CommentsModalMobile;

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

// No Comments yet
const SNoCommentsYet = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  min-height: 600px;
`;

const SNoCommentsImgContainer = styled.div`
  position: absolute;

  top: 300px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  img {
    position: relative;
    top: -24px;
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
