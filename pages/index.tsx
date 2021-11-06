import React, { useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from 'styled-components';
import type { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { setColorMode } from '../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../redux-store/store';
import { setUserLoggedIn, setUserRole, setUserAvatar } from '../redux-store/slices/userStateSlice';

import Button from '../components/atoms/Button';
import Headline from '../components/atoms/Headline';
import GeneralTemplate from '../components/templates/General';

const Home: NextPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();
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
      <Headline>
        {t('welcome', { NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME })}
      </Headline>
      <Button
        id="dark-mode-button"
        bg={theme.gradients.blueDiagonal}
        onClick={handleToggleDarkMode}
      >
        Toggle dark mode
      </Button>
      <Button
        bg={theme.gradients.blueDiagonal}
        onClick={handleToggleUserLoggedIn}
      >
        Toggle user loggedIn
      </Button>
      <Button
        bg={theme.gradients.blueDiagonal}
        onClick={handleToggleUserRole}
      >
        Toggle user role
      </Button>
      <Button
        bg={theme.gradients.blueDiagonal}
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
    ['common'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}
