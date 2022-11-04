/* eslint-disable no-param-reassign */
import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import { usePostModalInnerState } from '../../../contexts/postModalInnerContext';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppSelector } from '../../../redux-store/store';

import Modal from '../Modal';
import ModerationView from './moderation';
import PostModerationControls from '../../molecules/decision/moderation/PostModerationControls';

// Icons
import assets from '../../../constants/assets';
import AnimatedBackground from '../../atoms/AnimationBackground';

const PostFailedBox = dynamic(
  () => import('../../molecules/decision/common/PostFailedBox')
);

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

interface IPostModalModeration {}

const PostModalModeration: React.FunctionComponent<
  IPostModalModeration
> = () => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('modal-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const {
    open,
    modalContainerRef,
    isMyPost,
    postParsed,
    typeOfPost,
    postStatus,
    deletedByCreator,
    recommendedPosts,
    shareMenuOpen,
    deletePostOpen,
    ellipseMenuOpen,
    handleDeletePost,
    handleEllipseMenuClose,
    handleOpenDeletePostModal,
    handleShareClose,
    handleOpenShareMenu,
    handleOpenEllipseMenu,
    handleCloseDeletePostModal,
    handleCloseAndGoBack,
  } = usePostModalInnerState();

  return (
    <>
      <Modal show={open} overlaydim onClose={() => handleCloseAndGoBack()}>
        {(postStatus === 'succeeded' ||
          postStatus === 'waiting_for_response') &&
          !isMobile && (
            <AnimatedBackground src={assets.decision.gold} alt='coin' />
          )}
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
          <PostModerationControls
            isMobile={isMobile}
            postUuid={postParsed?.postUuid ?? ''}
            postStatus={postStatus}
            shareMenuOpen={shareMenuOpen}
            typeOfPost={typeOfPost ?? 'ac'}
            deletePostOpen={deletePostOpen}
            ellipseMenuOpen={ellipseMenuOpen}
            handleCloseAndGoBack={handleCloseAndGoBack}
            handleDeletePost={handleDeletePost}
            handleEllipseMenuClose={handleEllipseMenuClose}
            handleOpenDeletePostModal={handleOpenDeletePostModal}
            handleShareClose={handleShareClose}
            handleOpenShareMenu={handleOpenShareMenu}
            handleOpenEllipseMenu={handleOpenEllipseMenu}
            handleCloseDeletePostModal={handleCloseDeletePostModal}
          />
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
              <ModerationView />
            ) : (
              <PostFailedBox
                title={t('postDeletedByMe.title', {
                  postType: t(`postType.${typeOfPost}`),
                })}
                body={
                  deletedByCreator
                    ? t('postDeletedByMe.body.byCreator', {
                        postType: t(`postType.${typeOfPost}`),
                      })
                    : t('postDeletedByMe.body.byAdmin', {
                        postType: t(`postType.${typeOfPost}`),
                      })
                }
                imageSrc={
                  theme.name === 'light'
                    ? LIGHT_IMAGES[typeOfPost]
                    : DARK_IMAGES[typeOfPost]
                }
                buttonCaption={t('postDeletedByMe.buttonText')}
                handleButtonClick={() => {
                  Mixpanel.track('Post Failed Redirect to Creation', {
                    _stage: 'Post',
                  });
                  router.push('/creation');
                }}
              />
            )}
            {isMobile && (
              <PostModerationControls
                isMobile={isMobile}
                postUuid={postParsed?.postUuid ?? ''}
                postStatus={postStatus}
                shareMenuOpen={shareMenuOpen}
                typeOfPost={typeOfPost ?? 'ac'}
                deletePostOpen={deletePostOpen}
                ellipseMenuOpen={ellipseMenuOpen}
                handleCloseAndGoBack={handleCloseAndGoBack}
                handleDeletePost={handleDeletePost}
                handleEllipseMenuClose={handleEllipseMenuClose}
                handleOpenDeletePostModal={handleOpenDeletePostModal}
                handleShareClose={handleShareClose}
                handleOpenShareMenu={handleOpenShareMenu}
                handleOpenEllipseMenu={handleOpenEllipseMenu}
                handleCloseDeletePostModal={handleCloseDeletePostModal}
              />
            )}
          </SPostModalContainer>
        ) : null}
      </Modal>
    </>
  );
};

export default PostModalModeration;

const SPostModalContainer = styled.div<{
  isMyPost: boolean;
  loaded: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;

  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 1;
  overscroll-behavior: none;

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

    background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? theme.colorsThemed.background.secondary
        : theme.colorsThemed.background.primary};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    width: 100%;
    height: calc(100% - 64px);
  }

  ${({ theme }) => theme.media.laptopM} {
    top: 32px;
    left: calc(50% - 496px);
    width: 992px;
    height: calc(100% - 64px);
    max-height: ${({ loaded }) => (loaded ? 'unset' : '840px')};

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 24px;
    padding-bottom: 24px;
  }
`;
