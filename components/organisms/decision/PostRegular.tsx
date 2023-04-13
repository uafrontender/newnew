/* eslint-disable no-param-reassign */
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Trans, useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { useInView } from 'react-intersection-observer';

import { usePostInnerState } from '../../../contexts/postInnerContext';

import RegularView from './regular';
import Headline from '../../atoms/Headline';

// Icons
import assets from '../../../constants/assets';
import GoBackButton from '../../molecules/GoBackButton';
import isBrowser from '../../../utils/isBrowser';
import { useAppState } from '../../../contexts/appStateContext';
import DisplayName from '../../atoms/DisplayName';

const ListPostPage = dynamic(() => import('../see-more/ListPostPage'));
const PostFailedBox = dynamic(
  () => import('../../molecules/decision/common/PostFailedBox')
);
const ReportModal = dynamic(
  () => import('../../molecules/direct-messages/ReportModal')
);

const DARK_IMAGES: Record<string, () => string> = {
  ac: assets.common.ac.darkAcAnimated,
  cf: assets.creation.darkCfAnimated,
  mc: assets.common.mc.darkMcAnimated,
};

const LIGHT_IMAGES: Record<string, () => string> = {
  ac: assets.common.ac.lightAcAnimated,
  cf: assets.creation.lightCfAnimated,
  mc: assets.common.mc.lightMcAnimated,
};

interface IPostRegular {}

const PostRegular: React.FunctionComponent<IPostRegular> = () => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { t: tCommon } = useTranslation('common');
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
    deletedByCreator,
    recommendedPosts,
    handleSeeNewDeletedBox,
    handleOpenRecommendedPost,
    loadingRef,
    recommendedPostsLoading,
    reportPostOpen,
    handleReportSubmit,
    handleReportClose,
    handleCloseAndGoBack,
  } = usePostInnerState();

  const { ref: recommendationsSectionRef, inView } = useInView({});

  useEffect(() => {
    if (
      isBrowser() &&
      inView &&
      isMobile &&
      !!document.getElementById('action-button-mobile')
    ) {
      document.getElementById('action-button-mobile')!!.style.display = 'none';
    }
    if (
      isBrowser() &&
      !inView &&
      isMobile &&
      !!document.getElementById('action-button-mobile')
    ) {
      document.getElementById('action-button-mobile')!!.style.display = '';
    }
  }, [inView, isMobile]);

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
          loaded={recommendedPosts && recommendedPosts.length > 0}
          id='post-container'
          isMyPost={isMyPost}
          onClick={(e) => e.stopPropagation()}
          ref={(el) => {
            modalContainerRef.current = el!!;
          }}
        >
          {postStatus !== 'deleted_by_admin' &&
          postStatus !== 'deleted_by_creator' ? (
            <RegularView />
          ) : (
            <>
              {isMobile ? (
                <SGoBackButtonContainer>
                  <SGoBackButton onClick={() => handleCloseAndGoBack()}>
                    {t('back')}
                  </SGoBackButton>
                </SGoBackButtonContainer>
              ) : null}
              <PostFailedBox
                title={t('postDeleted.title', {
                  postType: t(`postType.${typeOfPost}`),
                })}
                body={
                  deletedByCreator ? (
                    <Trans
                      t={t}
                      i18nKey='postDeleted.body.byCreator'
                      // @ts-ignore
                      components={[
                        <DisplayName user={postParsed.creator} />,
                        { postType: t(`postType.${typeOfPost}`) },
                      ]}
                    />
                  ) : (
                    t('postDeleted.body.byAdmin', {
                      postType: t(`postType.${typeOfPost}`),
                    })
                  )
                }
                buttonCaption={tCommon('button.takeMeHome')}
                imageSrc={
                  theme.name === 'light'
                    ? LIGHT_IMAGES[typeOfPost]()
                    : DARK_IMAGES[typeOfPost]()
                }
                style={{
                  marginBottom: '24px',
                }}
                handleButtonClick={handleSeeNewDeletedBox}
              />
            </>
          )}
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
                handlePostClicked={handleOpenRecommendedPost}
              />
            )}
            <div
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
            />
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

export default PostRegular;

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

  ${({ theme }) => theme.media.tablet} {
    width: 100%;
    padding-bottom: 16px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${({ theme }) => theme.media.laptopM} {
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;

    padding: 24px;
    padding-bottom: 24px;
  }
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

const SGoBackButtonContainer = styled.div`
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding-left: 16px;
    margin-bottom: initial;
  }

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
