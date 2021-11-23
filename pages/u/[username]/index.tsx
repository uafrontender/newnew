import React, { ReactElement } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';

import { NextPageWithLayout } from '../../_app';
import ProfileLayout from '../../../components/templates/ProfileLayout';
import { Tab } from '../../../components/molecules/profile/ProfileTabs';

interface IUserPageIndex {
  user: Omit<newnewapi.User, 'toJSON'>;
}

const UserPageIndex: NextPage<IUserPageIndex> = ({
  user,
}) => (
  <div>
    <main>
      <h1>
        I will be
        {' '}
        {user.displayName}
        &apos;s index page
      </h1>
      <div
        style={{ height: '500px' }}
      />
    </main>
  </div>
);

(UserPageIndex as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  const tabs: Tab[] = [
    {
      nameToken: 'userInitial',
      url: `/u/${page.props.user.username}`,
    },
    {
      nameToken: 'activity',
      url: `/u/${page.props.user.username}/activity`,
    },
  ];

  return (
    <ProfileLayout
      user={page.props.user}
      tabs={tabs}
    >
      { page }
    </ProfileLayout>
  );
};

export default UserPageIndex;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.query;
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'profile'],
  );

  if (!username) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Temp URL
  const userDataBuffer = await fetch(`http://localhost:4000/api/user/get_user_by_username?username=${username}`).then((res) => res.arrayBuffer());

  if (!userDataBuffer) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const user = newnewapi.User.decode(new Uint8Array(userDataBuffer));

  return {
    props: {
      user: user.toJSON(),
      ...translationContext,
    },
  };
};
