import React, { ReactElement } from 'react';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';

import { Tab } from '../../components/molecules/Tabs';
import MyProfileLayout from '../../components/templates/MyProfileLayout';
import { NextPageWithLayout } from '../_app';
import { TTokenCookie } from '../../api/apiConfigs';
import { getMyPosts } from '../../api/endpoints/user';

// Temp
const tabs: Tab[] = [
  {
    nameToken: 'activelyBidding',
    url: '/profile',
  },
  {
    nameToken: 'purchases',
    url: '/profile/purchases',
  },
  {
    nameToken: 'viewHistory',
    url: '/profile/view-history',
  },
  {
    nameToken: 'subscriptions',
    url: '/profile/subscriptions',
  },
  {
    nameToken: 'favorites',
    url: '/profile/favorites',
  },
];

const MyProfileIndex: NextPage = () => (
  <div>
    <main>
      <h1>
        I will be the index profile page
      </h1>
      <div
        style={{ height: '500px' }}
      />
    </main>
  </div>
);

(MyProfileIndex as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <MyProfileLayout
      tabs={tabs}
    >
      { page }
    </MyProfileLayout>
  );
};

export default MyProfileIndex;

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'profile'],
  );

  const { req } = context;
  // Example of using protected & intercepted fetching function is SSR context
  const payload = new newnewapi.GetMyPostsRequest({
    kind: newnewapi.GetMyPostsRequest.Kind.MY_ACTIVE_BIDDINGS,
  });
  const res = await getMyPosts(
    payload,
    {
      accessToken: req.cookies?.accessToken,
      refreshToken: req.cookies?.refreshToken,
    },
    (tokens: TTokenCookie[]) => {
      const parsedTokens = tokens.map((t) => `${t.name}=${t.value}; ${t.expires ? `expires=${t.expires}; ` : ''} ${t.maxAge ? `max-age=${t.maxAge}; ` : ''}`);
      context.res.setHeader(
        'set-cookie',
        parsedTokens,
      );
    },
  );
  console.log(res);

  return {
    props: {
      ...translationContext,
    },
  };
}
