import React, { useCallback } from 'react';
import Link from 'next/link';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { setColorMode } from '../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../redux-store/store';
import { setUserLoggedIn, setUserRole, setUserAvatar } from '../redux-store/slices/userStateSlice';

import Button from '../components/atoms/Button';
import TopSection from '../components/organisms/home/TopSection';
import HeroSection from '../components/organisms/home/HeroSection';
import GeneralTemplate from '../components/templates/General';

const Home: NextPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { colorMode } = useAppSelector((state) => state.ui);

  const handleToggleDarkMode = useCallback(() => {
    dispatch(
      setColorMode(colorMode === 'dark' ? 'light' : 'dark'),
    );
  }, [dispatch, colorMode]);
  const handleToggleUserRole = useCallback(() => {
    dispatch(setUserRole(user.role ? '' : 'creator'));
  }, [dispatch, user.role]);
  const handleToggleUserLoggedIn = useCallback(() => {
    dispatch(setUserLoggedIn(!user.loggedIn));
  }, [dispatch, user.loggedIn]);
  const handleToggleUserAvatar = useCallback(() => {
    dispatch(setUserAvatar(user.avatar ? '' : 'https://randomuser.me/api/portraits/women/21.jpg'));
  }, [dispatch, user.avatar]);

  return (
    <GeneralTemplate>
      {!user.loggedIn && <HeroSection />}
      <TopSection />
      <Button
        id="dark-mode-button"
        onClick={handleToggleDarkMode}
      >
        Toggle dark mode
      </Button>
      <Button
        onClick={handleToggleUserLoggedIn}
      >
        Toggle user loggedIn
      </Button>
      <Button
        onClick={handleToggleUserRole}
      >
        Toggle user role
      </Button>
      <Button
        onClick={handleToggleUserAvatar}
      >
        Toggle user avatar
      </Button>
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
    ['common', 'home'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}
