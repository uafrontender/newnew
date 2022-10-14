/* eslint-disable no-param-reassign */
import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import { usePostModalInnerState } from '../../../contexts/postModalInnerContext';
import { useAppSelector } from '../../../redux-store/store';
import getDisplayname from '../../../utils/getDisplayname';

import RegularView from './regular';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import assets from '../../../constants/assets';
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';

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
    handleCloseAndGoBack,
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
        <SGoBackButtonDesktop
          view='secondary'
          iconOnly
          onClick={handleCloseAndGoBack}
        >
          <InlineSvg
            svg={CancelIcon}
            fill={theme.colorsThemed.text.primary}
            width='24px'
            height='24px'
          />
        </SGoBackButtonDesktop>
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
  /* position: absolute;
  top: 0;
  left: 0;

  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 1;
  overscroll-behavior: none; */

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
    top: 64px;
    /*transform: none; */
    /* top: 50%; */
    /* transform: translateY(-50%); */
    padding-bottom: 16px;

    /* background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? theme.colorsThemed.background.secondary
        : theme.colorsThemed.background.primary}; */
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    width: 100%;
    /* height: calc(100% - 64px); */
  }

  ${({ theme }) => theme.media.laptopM} {
    top: 32px;
    left: calc(50% - 496px);
    /* width: 992px;
    height: calc(100% - 64px); */
    max-height: ${({ loaded }) => (loaded ? 'unset' : '840px')};

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

const SGoBackButtonDesktop = styled(Button)`
  position: absolute;
  right: 0;
  top: 0;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  border: transparent;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;

  z-index: 2;

  ${({ theme }) => theme.media.laptopM} {
    right: 24px;
    top: 32px;
  }
`;
