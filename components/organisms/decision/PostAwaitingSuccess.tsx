import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { useInView } from 'react-intersection-observer';

import { usePostInnerState } from '../../../contexts/postInnerContext';

import SuccessView from './success';
import WaitingForResponseView from './awaiting';
import GoBackButton from '../../molecules/GoBackButton';
import PostSuccessOrWaitingControls from '../../molecules/decision/common/PostSuccessOrWaitingControls';
import { useAppState } from '../../../contexts/appStateContext';
import Headline from '../../atoms/Headline';
import ListPostPage from '../see-more/ListPostPage';

const ReportModal = dynamic(() => import('../../molecules/ReportModal'));

interface IPostAwaitingSuccess {}

const PostAwaitingSuccess: React.FunctionComponent<
  IPostAwaitingSuccess
> = () => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const {
    modalContainerRef,
    isMyPost,
    postParsed,
    typeOfPost,
    postStatus,
    recommendedPosts,
    reportPostOpen,
    handleReportSubmit,
    handleReportClose,
    handleCloseAndGoBack,
    // loadingRef,
    recommendedPostsLoading,
  } = usePostInnerState();

  const { ref: recommendationsSectionRef } = useInView({});

  return (
    <>
      {!isMobile && (
        <SGoBackButtonContainer>
          <SGoBackButton longArrow onClick={() => handleCloseAndGoBack()}>
            {t('back')}
          </SGoBackButton>
        </SGoBackButtonContainer>
      )}
      {!isMobile ? <PostSuccessOrWaitingControls /> : null}
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
          <SRecommendationsSection
            id='recommendations-section-heading'
            ref={recommendationsSectionRef}
            loaded={recommendedPosts && recommendedPosts.length > 0}
          >
            <Headline variant={4}>
              {recommendedPosts.length > 0
                ? t('recommendationsSection.heading')
                : null}
            </Headline>
            {recommendedPosts && (
              <ListPostPage
                loading={recommendedPostsLoading}
                collection={recommendedPosts}
                skeletonsBgColor={theme.colorsThemed.background.tertiary}
                skeletonsHighlightColor={
                  theme.colorsThemed.background.secondary
                }
              />
            )}
            {/* <div
              ref={loadingRef}
              style={{
                position: 'relative',
                bottom: '10px',
                ...(recommendedPostsLoading
                  ? {
                      display: 'none',
                    }
                  : {}),
              }}
            /> */}
          </SRecommendationsSection>
        </SPostContainer>
      ) : null}
      {postParsed?.creator && reportPostOpen && (
        <ReportModal
          show={reportPostOpen}
          reportedUser={postParsed?.creator}
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

const SRecommendationsSection = styled.div<{
  loaded: boolean;
}>`
  min-height: ${({ loaded }) => (loaded ? '600px' : '0')};

  margin-top: 24px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 32px;
  }
`;
