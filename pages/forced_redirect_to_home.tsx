import React from 'react';
import type { NextPage, NextPageContext } from 'next';

const ForcedRedirectPage: NextPage = () => <div />;

export async function getServerSideProps(
  context: NextPageContext
): Promise<any> {
  return {
    redirect: {
      permanent: true,
      destination: '/',
    },
  };
}

export default ForcedRedirectPage;
