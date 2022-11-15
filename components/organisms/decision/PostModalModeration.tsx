/* eslint-disable no-param-reassign */
import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import { usePostModalInnerState } from '../../../contexts/postModalInnerContext';
import { Mixpanel } from '../../../utils/mixpanel';

import ModerationView from './moderation';

// Icons
import GoBackButton from '../../molecules/GoBackButton';
import { useAppSelector } from '../../../redux-store/store';

// Icons
import assets from '../../../constants/assets';

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
    modalContainerRef,
    isMyPost,
    postParsed,
    typeOfPost,
    postStatus,
    deletedByCreator,
    recommendedPosts,
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
        <SGoBackButton longArrow onClick={() => handleCloseAndGoBack()}>
          {t('back')}
        </SGoBackButton>
      )}
      {postParsed && typeOfPost ? (
        <SPostModalContainer
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
        </SPostModalContainer>
      ) : null}
    </>
  );
};

export default PostModalModeration;

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

const SGoBackButton = styled(GoBackButton)`
  padding-left: 16px;

  ${({ theme }) => theme.media.laptopM} {
    padding-left: 24px;
    width: 100%;
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;
  }
`;
