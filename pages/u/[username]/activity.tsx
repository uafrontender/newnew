import React, { ReactElement } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';

import { Tab } from '../../../components/molecules/Tabs';
import ProfileLayout from '../../../components/templates/ProfileLayout';
import { NextPageWithLayout } from '../../_app';

interface IUserPageActivity {
  user: Omit<newnewapi.User, 'toJSON'>;
}

const UserPageActivity: NextPage<IUserPageActivity> = ({
  user,
}) => (
  <div>
    <main>
      <h1>
        I will be
        {' '}
        {user.nickname}
        &apos;s activity page
      </h1>
      <div
        style={{ height: '500px' }}
      />
    </main>
  </div>
);

(UserPageActivity as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
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

export default UserPageActivity;

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

  const userDataBuffer = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/get_user_by_username?username=${username}`).then((res) => res.arrayBuffer());

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
