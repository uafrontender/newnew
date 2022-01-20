/* eslint-disable no-nested-ternary */
import React, { useEffect } from 'react';
import Head from 'next/head';
import type { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { fetchPostByUUID } from '../../api/endpoints/post';

import General from '../../components/templates/General';

import loadingAnimation from '../../public/animations/logo-loading-blue.json';
import Lottie from '../../components/atoms/Lottie';

interface IPostPage {
  postUuid: string;
  post: newnewapi.Post;
}

const PostPage: NextPage<IPostPage> = ({
  postUuid,
  post,
}) => {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/?post=${postUuid}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <General>
      <Head>
        <title>
          {post.auction ? (
            post.auction.title
          ) : (
            post.crowdfunding ? (
              post.crowdfunding.title
            ) : post.multipleChoice?.title
          )}
        </title>
      </Head>
      <div>
        <main>
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimation,
            }}
          />
        </main>
      </div>
    </General>
  );
};
export default PostPage;

export const getServerSideProps:GetServerSideProps = async (context) => {
  const { uuid } = context.query;
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'profile'],
  );

  if (!uuid || Array.isArray(uuid)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const getPostPayload = new newnewapi.GetPostRequest({
    postUuid: uuid,
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
      postUuid: uuid,
      post: res.data.toJSON(),
      ...translationContext,
    },
  };
};
