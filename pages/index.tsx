import type { NextPage } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { useAppDispatch, useAppSelector } from '../redux-store/store';
import { toggleColorModeWithLS, _setColorMode } from '../redux-store/slices/uiStateSlice';

import InlineSVG from '../components/atoms/InlineSVG';

import SVGVercel from '../public/vercel.svg';

const Home: NextPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { colorMode } = useAppSelector(state => state.ui);

  return (
    <div>
      <main>
        <h1>
          {t('welcome', {NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME})}
        </h1>
        <div>
          <Link href="/" locale="en">
            <a>English</a>
          </Link>
        </div>
        <div>
          <Link href="/" locale="fr">
            <a>French</a>
          </Link>
        </div>
        <InlineSVG
          svg={SVGVercel}
          fill={colorMode === 'dark' ? 'white' : 'black'}
          width="100px"
          height="100px"
        />
        <button
          onClick={() => dispatch(_setColorMode(colorMode === 'dark' ? 'light' : 'dark'))}
        >
          Toggle dark mode
        </button>
        <button
          onClick={() => dispatch(toggleColorModeWithLS())}
        >
          Toggle dark mode using thunk
        </button>
        <div>
          <Link href="/test">
            <a>Link to test page</a>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;

export async function getStaticProps(context: { locale: string }): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale,
    ['common']
  );

  return {
    props: {
      ...translationContext
    }
  };
}
