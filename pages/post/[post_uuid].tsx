/* eslint-disable camelcase */
/* eslint-disable no-nested-ternary */
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import { fetchPostByUUID } from '../../api/endpoints/post';
import switchPostType, { TPostType } from '../../utils/switchPostType';

import { NextPageWithLayout } from '../_app';
import GeneralLayout from '../../components/templates/General';
import PostSkeleton from '../../components/organisms/decision/PostSkeleton';

const PostModal = dynamic(() => import('../../components/organisms/decision'));

interface IPostPage {
  top10posts: newnewapi.NonPagedPostsResponse;
  postUuid: string;
  post?: newnewapi.Post;
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
  const router = useRouter();
  const { t } = useTranslation('modal-Post');

  const [[postParsed, typeOfPost], setPostData] = useState<
    | [
        newnewapi.Auction | newnewapi.Crowdfunding | newnewapi.MultipleChoice,
        TPostType
      ]
    | [undefined, undefined]
  >(() => (post ? switchPostType(post) : [undefined, undefined]));
  const [postFromAjax, setPostFromAjax] = useState<newnewapi.Post | undefined>(
    undefined
  );
  const [isPostLoading, setIsPostLoading] = useState(!post);

  useEffect(() => {
    async function fetchPost() {
      try {
        setIsPostLoading(true);
        const getPostPayload = new newnewapi.GetPostRequest({
          postUuid,
        });

        const res = await fetchPostByUUID(getPostPayload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Post not found');

        setPostFromAjax(res.data);
        setPostData(switchPostType(res.data));

        setIsPostLoading(false);
      } catch (err) {
        console.error(err);
        router.replace('/404');
      }
    }

    if (!post) {
      console.log('fetching post');
      fetchPost();
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
      {!isPostLoading ? (
        <PostModal
          post={post ?? postFromAjax}
          stripeSetupIntentClientSecretFromRedirect={setup_intent_client_secret}
          saveCardFromRedirect={save_card}
          commentIdFromUrl={comment_id}
          commentContentFromUrl={comment_content}
        />
      ) : (
        <PostSkeleton />
      )}
    </>
  );
};
export default PostPage;

(PostPage as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <GeneralLayout noMobieNavigation noPaddingMobile>
    {page}
  </GeneralLayout>
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

  if (!context.req.url?.startsWith('/_next')) {
    console.log('I am from direct link, making SSR request');

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
  }

  console.log('I am from next router, no SSR needed');

  return {
    props: {
      postUuid: post_uuid,
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
