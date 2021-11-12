import React, { useCallback } from 'react';
import Link from 'next/link';
import { newnewapi } from 'newnew-api';
import type { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Button from '../components/atoms/Button';
import TopSection from '../components/organisms/home/TopSection';
import HeroSection from '../components/organisms/home/HeroSection';
import CardsSection from '../components/organisms/home/CardsSection';
import GeneralTemplate from '../components/templates/General';

import dateToTimestamp from '../utils/dateToTimestamp';
import { setColorMode } from '../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../redux-store/store';
import {
  setUserLoggedIn, setUserRole, setUserAvatar, setUserData, setCredentialsData,
} from '../redux-store/slices/userStateSlice';

import testBG from '../public/images/test_bg_1.jpg';
import testBG2 from '../public/images/test_bg_2.jpg';
import testBG3 from '../public/images/test_bg_3.jpg';

const Home: NextPage = () => {
  const { t } = useTranslation('home');
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
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
    const mockResponse = new newnewapi.SignInResponse({
      me: {
        username: 'johndoe12345',
        displayName: 'John',
        email: 'johndoe@test.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
        id: 12345,
        options: {
          isCreator: false,
        },
      },
      credential: {
        accessToken: '12345',
        refreshToken: '12345',
        expiresAt: dateToTimestamp(new Date()),
      },
      status: 1,
    });

    if (!user.loggedIn) {
      dispatch(setUserData(mockResponse.me));
      dispatch(setCredentialsData({
        accessToken: mockResponse.credential?.accessToken,
        refreshToken: mockResponse.credential?.refreshToken,
        expiresAt: mockResponse.credential?.expiresAt?.seconds,
      }));
    } else {
      dispatch(setUserData({
        username: '',
        displayName: '',
        email: '',
        avatarUrl: '',
        id: null,
        options: {
          isCreator: false,
        },
      }));
      dispatch(setCredentialsData({
        accessToken: '',
        refreshToken: '',
        expiresAt: '',
      }));
    }

    dispatch(setUserLoggedIn(!user.loggedIn));
  }, [dispatch, user.loggedIn]);
  const handleToggleUserAvatar = useCallback(() => {
    dispatch(setUserAvatar(user.avatar ? '' : 'https://randomuser.me/api/portraits/women/21.jpg'));
  }, [dispatch, user.avatar]);
  const collection = [
    {
      id: 'randomid1',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? fdsn fds jkfhsdkh kjfds fj sdkjl jfdsklj fklsdj jfdsj klfjdlsk jdfslk jflsjd kljfksdj lkjfsdk lj 🙈',
      user: {
        avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
      },
    },
    {
      id: 'randomid2',
      url: testBG2,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: 'https://randomuser.me/api/portraits/women/34.jpg',
      },
    },
    {
      id: 'randomi3',
      url: testBG3,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: 'https://randomuser.me/api/portraits/women/34.jpg',
      },
    },
    {
      id: 'randomid4',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
      },
    },
    {
      id: 'randomid5',
      url: testBG2,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: 'https://randomuser.me/api/portraits/women/34.jpg',
      },
    },
    {
      id: 'randomi6',
      url: testBG3,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: 'https://randomuser.me/api/portraits/women/34.jpg',
      },
    },
    {
      id: 'randomid7',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
      },
    },
    {
      id: 'randomid8',
      url: testBG2,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: 'https://randomuser.me/api/portraits/women/34.jpg',
      },
    },
    {
      id: 'randomi9',
      url: testBG3,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: 'https://randomuser.me/api/portraits/women/34.jpg',
      },
    },
    {
      id: 'randomid10',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
      },
    },
  ];

  return (
    <GeneralTemplate>
      {!user.loggedIn && <HeroSection />}
      <TopSection collection={collection} />
      <CardsSection
        url="/ac"
        title={t('ac-block-title')}
        collection={collection}
      />
      <CardsSection
        url="/mc"
        title={t('mc-block-title')}
        collection={collection}
      />
      <CardsSection
        url="/cf"
        title={t('cf-block-title')}
        collection={collection}
      />
      <CardsSection
        url="/biggest"
        title={t('biggest-block-title')}
        collection={collection}
      />
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
