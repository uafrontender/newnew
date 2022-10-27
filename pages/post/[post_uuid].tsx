/* eslint-disable camelcase */
/* eslint-disable no-nested-ternary */
import React, { ReactElement, useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import { newnewapi } from 'newnew-api';

import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { fetchPostByUUID } from '../../api/endpoints/post';

import { NextPageWithLayout } from '../_app';
import switchPostType from '../../utils/switchPostType';
import { toggleMutedMode } from '../../redux-store/slices/uiStateSlice';
import GeneralLayout from '../../components/templates/General';

const PostModal = dynamic(() => import('../../components/organisms/decision'));

interface IPostPage {
  top10posts: newnewapi.NonPagedPostsResponse;
  postUuid: string;
  post: newnewapi.Post;
  setup_intent_client_secret?: string;
  comment_id?: string;
  comment_content?: string;
  save_card?: boolean;
}

const PostPage: NextPage<IPostPage> = ({
  top10posts,
  postUuid,
  post,
  setup_intent_client_secret,
  comment_id,
  comment_content,
  save_card,
}) => {
  const { t } = useTranslation('modal-Post');
  const dispatch = useAppDispatch();
  const { mutedMode } = useAppSelector((state) => state.ui);

  const [postParsed, typeOfPost] = useMemo(
    () => (post ? switchPostType(post) : [undefined, undefined]),
    [post]
  );

  useEffect(() => {
    // if (isSafari() && !mutedMode) {
    if (!mutedMode) {
      dispatch(toggleMutedMode(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>{t(`meta.${typeOfPost}.title`)}</title>
        <meta
          name='description'
          content={t(`meta.${typeOfPost}.description`)}
        />
        <meta property='og:title' content={postParsed?.title} />
        <meta
          property='og:url'
          content={`${process.env.NEXT_PUBLIC_APP_URL}/post/${postUuid}`}
        />
        <meta
          property='og:image'
          content={postParsed?.announcement?.thumbnailImageUrl ?? ''}
        />
      </Head>
      {post && (
        <PostModal
          post={post}
          stripeSetupIntentClientSecretFromRedirect={setup_intent_client_secret}
          saveCardFromRedirect={save_card}
          commentIdFromUrl={comment_id}
          commentContentFromUrl={comment_content}
        />
      )}
    </>
  );
};
export default PostPage;

(PostPage as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <GeneralLayout noMobieNavigation>{page}</GeneralLayout>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    post_uuid,
    setup_intent_client_secret,
    comment_id,
    comment_content,
    save_card,
  } = context.query;
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'modal-Post',
    'modal-ResponseSuccessModal',
    'component-PostCard',
    'modal-PaymentModal',
  ]);

  if (!post_uuid || Array.isArray(post_uuid)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const getPostPayload = new newnewapi.GetPostRequest({
    postUuid: post_uuid,
  });

  const res = await fetchPostByUUID(getPostPayload);

  if (!res.data || res.error) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      postUuid: post_uuid,
      post: res.data.toJSON(),
      ...(setup_intent_client_secret
        ? {
            setup_intent_client_secret,
          }
        : {}),
      ...(save_card
        ? {
            save_card: save_card === 'true',
          }
        : {}),
      ...(comment_id
        ? {
            comment_id,
          }
        : {}),
      ...(comment_content
        ? {
            comment_content,
          }
        : {}),
      ...translationContext,
    },
  };
};
