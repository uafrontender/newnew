import React, { ReactElement } from 'react';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { Tab } from '../../components/molecules/Tabs';
import MyProfileLayout from '../../components/templates/MyProfileLayout';
import { NextPageWithLayout } from '../_app';

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

const MyProfileFavorites: NextPage = () => (
  <div>
    <main>
      <h1>
        I will be the profile favorites page
      </h1>
      <div
        style={{ height: '500px' }}
      />
    </main>
  </div>
);

(MyProfileFavorites as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <MyProfileLayout
      tabs={tabs}
    >
      { page }
    </MyProfileLayout>
  );
};

export default MyProfileFavorites;

export async function getStaticProps(context: { locale: string }): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale,
    ['common', 'profile'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}
