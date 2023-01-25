/* eslint-disable no-param-reassign */
import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import { usePostInnerState } from '../../../contexts/postInnerContext';
import { useAppSelector } from '../../../redux-store/store';
import getDisplayname from '../../../utils/getDisplayname';

import SuccessView from './success';
import WaitingForResponseView from './awaiting';
import PostSuccessOrWaitingControls from '../../molecules/decision/common/PostSuccessOrWaitingControls';
import GoBackButton from '../../molecules/GoBackButton';

const ReportModal = dynamic(
  () => import('../../molecules/direct-messages/ReportModal')
);

interface IPostAwaitingSuccess {}

const PostAwaitingSuccess: React.FunctionComponent<
  IPostAwaitingSuccess
> = () => {
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const {
    modalContainerRef,
    isMyPost,
    postParsed,
    typeOfPost,
    postStatus,
    isFollowingDecision,
    recommendedPosts,
    reportPostOpen,
    handleReportSubmit,
    handleReportClose,
    handleCloseAndGoBack,
    ellipseMenuOpen,
    shareMenuOpen,
    handleEllipseMenuClose,
    handleFollowDecision,
    handleReportOpen,
    handleShareClose,
    handleOpenShareMenu,
    handleOpenEllipseMenu,
  } = usePostInnerState();

  return (
    <>
      {!isMobile && (
        <SGoBackButtonContainer>
          <SGoBackButton longArrow onClick={() => handleCloseAndGoBack()}>
            {t('back')}
          </SGoBackButton>
        </SGoBackButtonContainer>
      )}
      {postParsed && typeOfPost ? (
        <SPostContainer
          id='post-container'
          isMyPost={isMyPost}
          loaded={recommendedPosts && recommendedPosts.length > 0}
          style={{
            ...(isMobile
              ? {
                  paddingTop: 0,
                }
              : {}),
          }}
          onClick={(e) => e.stopPropagation()}
          ref={(el) => {
            modalContainerRef.current = el!!;
          }}
        >
          {postStatus === 'succeeded' ? (
            <SuccessView postParsed={postParsed} typeOfPost={typeOfPost} />
          ) : null}
          {postStatus === 'waiting_for_response' ||
          postStatus === 'waiting_for_decision' ? (
            <WaitingForResponseView
              postParsed={postParsed}
              typeOfPost={typeOfPost}
            />
          ) : null}
          {isMobile && (
            <PostSuccessOrWaitingControls
              ellipseMenuOpen={ellipseMenuOpen}
              isFollowingDecision={isFollowingDecision}
              isMobile={isMobile}
              postUuid={postParsed?.postUuid ?? ''}
              postShortId={postParsed?.postShortId ?? ''}
              shareMenuOpen={shareMenuOpen}
              typeOfPost={typeOfPost ?? 'ac'}
              handleCloseAndGoBack={handleCloseAndGoBack}
              handleEllipseMenuClose={handleEllipseMenuClose}
              handleFollowDecision={handleFollowDecision}
              handleReportOpen={handleReportOpen}
              handleShareClose={handleShareClose}
              handleOpenShareMenu={handleOpenShareMenu}
              handleOpenEllipseMenu={handleOpenEllipseMenu}
            />
          )}
        </SPostContainer>
      ) : null}
      {postParsed?.creator && reportPostOpen && (
        <ReportModal
          show={reportPostOpen}
          reportedDisplayname={getDisplayname(postParsed?.creator)}
          onSubmit={handleReportSubmit}
          onClose={handleReportClose}
        />
      )}
    </>
  );
};

export default PostAwaitingSuccess;

const SPostContainer = styled.div<{
  isMyPost: boolean;
  loaded: boolean;
}>`
  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  height: 100%;
  width: 100%;
  padding: 16px;
  padding-bottom: 86px;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 16px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
    width: 100%;
    height: calc(100% - 64px);
  }

  ${({ theme }) => theme.media.laptopM} {
    top: 32px;
    left: calc(50% - 496px);
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 24px;
    padding-bottom: 24px;
  }
`;

const SGoBackButtonContainer = styled.div`
  padding-left: 16px;

  ${({ theme }) => theme.media.laptopM} {
    padding-left: 24px;
    width: 100%;
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const SGoBackButton = styled(GoBackButton)`
  margin-right: auto;
`;
