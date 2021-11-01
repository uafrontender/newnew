import React from 'react';
import Link from 'next/link';
import type { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { setColorMode } from '../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../redux-store/store';

import Headline from '../components/atoms/Headline';
import InlineSVG from '../components/atoms/InlineSVG';
import GeneralTemplate from '../components/templates/General';

import SVGVercel from '../public/vercel.svg';

const Home: NextPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { colorMode } = useAppSelector((state) => state.ui);

  return (
    <GeneralTemplate>
      <Headline>
        {t('welcome', { NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME })}
      </Headline>
      <div>
        <Link href="/" locale="en" passHref>
          <a href="#en">English</a>
        </Link>
      </div>
      <div>
        <Link href="/" locale="fr" passHref>
          <a href="#fr">French</a>
        </Link>
      </div>
      <InlineSVG
        svg={SVGVercel}
        fill={colorMode === 'dark' ? 'white' : 'black'}
        width="100px"
        height="100px"
      />
      <button
        type="button"
        onClick={() => dispatch(
          setColorMode(colorMode === 'dark' ? 'light' : 'dark'),
        )}
      >
        Toggle dark mode
      </button>
      <div>
        <Link href="/test">
          <a href="#test">Link to test page</a>
        </Link>
      </div>
    </GeneralTemplate>
  );
};

export default Home;

export async function getStaticProps(context: { locale: string }): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale,
    ['common'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}
