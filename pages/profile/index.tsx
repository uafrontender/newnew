import React, { ReactElement, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { SUPPORTED_LANGUAGES } from '../../constants/general';
import useMyPosts from '../../utils/hooks/useMyPosts';

import { NextPageWithLayout } from '../_app';
import MyProfileLayout from '../../components/templates/MyProfileLayout';
import { NoContentDescription } from '../../components/atoms/profile/NoContentCommon';

import assets from '../../constants/assets';

const PostList = dynamic(
  () => import('../../components/organisms/see-more/PostList')
);
const NoContentCard = dynamic(
  () => import('../../components/atoms/profile/NoContentCard')
);

interface IMyProfileIndex {
  postsFilter: newnewapi.Post.Filter;
}

const MyProfileIndex: NextPage<IMyProfileIndex> = ({ postsFilter }) => {
  const { t } = useTranslation('page-Profile');

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useMyPosts({
      relation:
        newnewapi.GetRelatedToMePostsRequest.Relation.MY_ACTIVE_BIDDINGS,
      postsFilter,
    });

  const posts = useMemo(
    () => data?.pages.map((page) => page.posts).flat(),
    [data]
  );

  // Loading state
  const { ref: loadingRef, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <>
      <Head>
        <title>{t('Active.meta.title')}</title>
        <meta name='description' content={t('Active.meta.description')} />
        <meta property='og:title' content={t('Active.meta.title')} />
        <meta
          property='og:description'
          content={t('Active.meta.description')}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <div>
        <SMain>
          <SCardsSection>
            {posts && posts.length > 0 && (
              <PostList
                category=''
                loading={isLoading || isFetchingNextPage}
                collection={posts}
                wrapperStyle={{
                  left: 0,
                }}
              />
            )}
            {posts && posts.length === 0 && !isLoading && (
              <NoContentCard>
                <NoContentDescription>
                  {t('Active.noContent.description')}
                </NoContentDescription>
              </NoContentCard>
            )}
          </SCardsSection>
          {hasNextPage && <div ref={loadingRef} />}
        </SMain>
      </div>
    </>
  );
};

(MyProfileIndex as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <MyProfileLayout
      renderedPage='activelyBidding'
      postsCachedActivelyBiddingOnFilter={newnewapi.Post.Filter.ALL}
    >
      {page}
    </MyProfileLayout>
  );
};

export default MyProfileIndex;

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    [
      'common',
      'page-Profile',
      'component-PostCard',
      'page-Post',
      'modal-PaymentModal',
      'modal-ResponseSuccessModal',
    ],
    null,
    SUPPORTED_LANGUAGES
  );

  if (!context?.req?.cookies?.accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

  return {
    props: {
      ...translationContext,
    },
  };
}

const SMain = styled.main`
  min-height: 60vh;
`;

const SCardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;

  ${(props) => props.theme.media.tablet} {
    margin-right: -32px !important;
  }
`;
