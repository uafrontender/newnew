/* eslint-disable no-unused-vars */
import React, { ReactElement } from 'react';
import styled from 'styled-components';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { NextPageWithLayout } from '../_app';
// import { TTokenCookie } from '../../api/apiConfigs';

import MyProfileLayout from '../../components/templates/MyProfileLayout';
// import useUpdateEffect from '../../utils/hooks/useUpdateEffect';
import { useGetSubscriptions } from '../../contexts/subscriptionsContext';
import { NoContentDescription } from '../../components/atoms/profile/NoContentCommon';
import assets from '../../constants/assets';

const NoContentCard = dynamic(
  () => import('../../components/atoms/profile/NoContentCard')
);
const CreatorsList = dynamic(
  () => import('../../components/organisms/search/CreatorsList')
);

interface IMyProfileSubscriptions {
  user: Omit<newnewapi.User, 'toJSON'>;
  pagedPosts?: newnewapi.PagedPostsResponse;
  posts?: newnewapi.Post[];
  postsFilter: newnewapi.Post.Filter;
  nextPageTokenFromServer?: string;
  pageToken: string | null | undefined;
  totalCount: number;
  handleUpdatePageToken: (value: string | null | undefined) => void;
  handleUpdateCount: (value: number) => void;
  handleUpdateFilter: (value: newnewapi.Post.Filter) => void;
  handleSetPosts: React.Dispatch<React.SetStateAction<newnewapi.Post[]>>;
}

const MyProfileSubscriptions: NextPage<IMyProfileSubscriptions> = ({
  user,
  pagedPosts,
  nextPageTokenFromServer,
  posts,
  postsFilter,
  pageToken,
  totalCount,
  handleUpdatePageToken,
  handleUpdateCount,
  handleUpdateFilter,
  handleSetPosts,
}) => {
  const { isCreatorsImSubscribedToLoading, creatorsImSubscribedTo } =
    useGetSubscriptions();
  const { t } = useTranslation('profile');

  return (
    <div>
      <Head>
        <title>{t('Subscriptions.meta.title')}</title>
        <meta
          name='description'
          content={t('Subscriptions.meta.description')}
        />
        <meta property='og:title' content={t('Subscriptions.meta.title')} />
        <meta
          property='og:description'
          content={t('Subscriptions.meta.description')}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <SMain>
        <SCardsSection>
          {creatorsImSubscribedTo.length > 0 ? (
            <CreatorsList
              loading={isCreatorsImSubscribedToLoading}
              collection={creatorsImSubscribedTo}
              subscribedTo
              showSubscriptionPrice
            />
          ) : (
            <NoContentCard>
              <NoContentDescription>
                {t('Subscriptions.no-content.description')}
              </NoContentDescription>
            </NoContentCard>
          )}
        </SCardsSection>
      </SMain>
      {/* Displayed creator modal? */}
    </div>
  );
};

(MyProfileSubscriptions as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <MyProfileLayout
      renderedPage='subscriptions'
      postsCachedSubscriptions={page.props.pagedPosts.posts}
      postsCachedSubscriptionsFilter={newnewapi.Post.Filter.ALL}
      postsCachedSubscriptionsPageToken={page.props.nextPageTokenFromServer}
      postsCachedSubscriptionsCount={page.props.pagedPosts.totalCount}
    >
      {page}
    </MyProfileLayout>
  );
};

export default MyProfileSubscriptions;

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<any> {
  try {
    const translationContext = await serverSideTranslations(context.locale!!, [
      'common',
      'profile',
      'home',
      'decision',
      'payment-modal',
    ]);

    return {
      props: {
        pagedPosts: {},
        ...translationContext,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        error: {
          message: (err as Error).message,
          statusCode: 400,
        },
      },
    };
  }
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
