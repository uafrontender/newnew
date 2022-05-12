/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import type { NextPage, NextPageContext } from 'next';

const ForcedRedirectPage: NextPage = () => <div />;

export async function getStaticProps(context: NextPageContext): Promise<any> {
  return {
    redirect: {
      permanent: true,
      destination: '/',
    },
  };
}

export default ForcedRedirectPage;
