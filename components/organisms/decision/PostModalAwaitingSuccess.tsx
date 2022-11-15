/* eslint-disable no-param-reassign */
import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import { usePostModalInnerState } from '../../../contexts/postModalInnerContext';
import { useAppSelector } from '../../../redux-store/store';
import getDisplayname from '../../../utils/getDisplayname';

import SuccessView from './success';
import WaitingForResponseView from './awaiting';
import PostSuccessOrWaitingControls from '../../molecules/decision/common/PostSuccessOrWaitingControls';
import GoBackButton from '../../molecules/GoBackButton';

const ReportModal = dynamic(() => import('../../molecules/chat/ReportModal'));

interface IPostModalAwaitingSuccess {}

const PostModalAwaitingSuccess: React.FunctionComponent<
  IPostModalAwaitingSuccess
> = () => {
  const { t } = useTranslation('modal-Post');
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
  } = usePostModalInnerState();

  return (
    <>
      <Head>
        <title>{t(`meta.${typeOfPost}.title`)}</title>
        <meta
          name='description'
          content={t(`meta.${typeOfPost}.description`)}
        />
        <meta property='og:title' content={t(`meta.${typeOfPost}.title`)} />
        <meta
          property='og:description'
          content={t(`meta.${typeOfPost}.description`)}
        />
      </Head>
      {!isMobile && (
        <SGoBackButtonContainer>
          <SGoBackButton longArrow onClick={() => handleCloseAndGoBack()}>
            {t('back')}
          </SGoBackButton>
        </SGoBackButtonContainer>
      )}
      {postParsed && typeOfPost ? (
        <SPostModalContainer
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
        </SPostModalContainer>
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

export default PostModalAwaitingSuccess;

const SPostModalContainer = styled.div<{
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
