import React, { ReactElement } from 'react';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from '../_app';
import MyProfileLayout from '../../components/templates/MyProfileLayout';
import { Tab } from '../../components/molecules/profile/ProfileTabs';

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

const MyProfilePurchases: NextPage = () => (
  <div>
    <main>
      <h1>
        I will be the profile purchases page
      </h1>
      <div
        style={{ height: '500px' }}
      />
    </main>
  </div>
);

(MyProfilePurchases as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <MyProfileLayout
      tabs={tabs}
    >
      { page }
    </MyProfileLayout>
  );
};

export default MyProfilePurchases;

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
