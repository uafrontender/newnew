import React, { ReactElement } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';

import { Tab } from '../../../components/molecules/Tabs';
import ProfileLayout from '../../../components/templates/ProfileLayout';
import { NextPageWithLayout } from '../../_app';
import { getUserByUsername } from '../../../api/endpoints/user';

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
        {user.nickname}
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

  if (!username || Array.isArray(username)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const getUserRequestPayload = new newnewapi.GetUserRequest({
    username,
  });

  const res = await getUserByUsername(getUserRequestPayload);

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
      user: res.data.toJSON(),
      ...translationContext,
    },
  };
};
