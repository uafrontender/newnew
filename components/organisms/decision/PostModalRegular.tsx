/* eslint-disable no-param-reassign */
import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';

import { usePostModalInnerState } from '../../../contexts/postModalInnerContext';
import { useAppSelector } from '../../../redux-store/store';
import getDisplayname from '../../../utils/getDisplayname';

import RegularView from './regular';
import Headline from '../../atoms/Headline';

// Icons
import assets from '../../../constants/assets';
import GoBackButton from '../../molecules/GoBackButton';

const ListPostModal = dynamic(() => import('../see-more/ListPostModal'));
const PostFailedBox = dynamic(
  () => import('../../molecules/decision/common/PostFailedBox')
);
const ReportModal = dynamic(() => import('../../molecules/chat/ReportModal'));

const DARK_IMAGES = {
  ac: assets.creation.darkAcAnimated,
  cf: assets.creation.darkCfAnimated,
  mc: assets.creation.darkMcAnimated,
};

const LIGHT_IMAGES = {
  ac: assets.creation.lightAcAnimated,
  cf: assets.creation.lightCfAnimated,
  mc: assets.creation.lightMcAnimated,
};

interface IPostModalRegular {}

const PostModalRegular: React.FunctionComponent<IPostModalRegular> = () => {
  const theme = useTheme();
  const router = useRouter();
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
    deletedByCreator,
    recommendedPosts,
    handleSeeNewDeletedBox,
    handleOpenRecommendedPost,
    loadingRef,
    recommendedPostsLoading,
    reportPostOpen,
    handleReportSubmit,
    handleReportClose,
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
        <SGoBackButton longArrow onClick={() => router.back()}>
          {t('back')}
        </SGoBackButton>
      )}
      {postParsed && typeOfPost ? (
        <SPostModalContainer
          loaded={recommendedPosts && recommendedPosts.length > 0}
          id='post-modal-container'
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
            <PostFailedBox
              title={t('postDeleted.title', {
                postType: t(`postType.${typeOfPost}`),
              })}
              body={
                deletedByCreator
                  ? t('postDeleted.body.byCreator', {
                      creator: getDisplayname(postParsed.creator!!),
                      postType: t(`postType.${typeOfPost}`),
                    })
                  : t('postDeleted.body.byAdmin', {
                      creator: getDisplayname(postParsed.creator!!),
                      postType: t(`postType.${typeOfPost}`),
                    })
              }
              buttonCaption={t('postDeleted.buttonText', {
                postTypeMultiple: t(`postType.multiple.${typeOfPost}`),
              })}
              imageSrc={
                theme.name === 'light'
                  ? LIGHT_IMAGES[typeOfPost]
                  : DARK_IMAGES[typeOfPost]
              }
              style={{
                marginBottom: '24px',
              }}
              handleButtonClick={handleSeeNewDeletedBox}
            />
          )}
          <SRecommendationsSection
            id='recommendations-section-heading'
            loaded={recommendedPosts && recommendedPosts.length > 0}
          >
            <Headline variant={4}>
              {recommendedPosts.length > 0
                ? t('recommendationsSection.heading')
                : null}
            </Headline>
            {recommendedPosts && (
              <ListPostModal
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

export default PostModalRegular;

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
    /* height: calc(100% - 64px); */
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

const SRecommendationsSection = styled.div<{
  loaded: boolean;
}>`
  min-height: ${({ loaded }) => (loaded ? '600px' : '0')};
`;

const SGoBackButton = styled(GoBackButton)`
  padding-left: 16px;

  ${({ theme }) => theme.media.laptopM} {
    padding-left: 24px;
  }
`;
