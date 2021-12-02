import React, { ReactElement, useCallback, useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage, NextPageContext } from 'next';

import Button from '../components/atoms/Button';
import HomeLayout from '../components/templates/HomeLayout';
import TopSection from '../components/organisms/home/TopSection';
import HeroSection from '../components/organisms/home/HeroSection';
import CardsSection from '../components/organisms/home/CardsSection';

import dateToTimestamp from '../utils/dateToTimestamp';
import { setColorMode } from '../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../redux-store/store';
import {
  setUserLoggedIn, setUserData, setCredentialsData,
} from '../redux-store/slices/userStateSlice';

import { NextPageWithLayout } from './_app';

import testBG from '../public/images/mock/test_bg_1.jpg';
import testBG2 from '../public/images/mock/test_bg_2.jpg';
import testBG3 from '../public/images/mock/test_bg_3.jpg';
import testUser1 from '../public/images/mock/test_user_1.jpg';
import testUser2 from '../public/images/mock/test_user_2.jpg';
import testUser3 from '../public/images/mock/test_user_3.jpg';
import testUser4 from '../public/images/mock/test_user_4.jpg';
import testBGCreator1 from '../public/images/mock/test_bg_creator_1.jpg';
import testBGCreator2 from '../public/images/mock/test_bg_creator_2.jpg';
import testBGCreator3 from '../public/images/mock/test_bg_creator_3.jpg';

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
  const handleToggleUserLoggedIn = useCallback(() => {
    const mockResponse = new newnewapi.SignInResponse({
      me: {
        username: 'johndoe12345',
        displayName: 'John',
        email: 'johndoe@test.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
        coverUrl: '/images/mock/profile-bg.png',
        userUuid: '12345',
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
        coverUrl: '',
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
  const collection = useMemo(() => [
    {
      id: 'randomid1',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid2',
      url: testBG2,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi3',
      url: testBG3,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid4',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid5',
      url: testBG2,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi6',
      url: testBG3,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid7',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid8',
      url: testBG2,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi9',
      url: testBG3,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid10',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
  ], []);
  const collectionAC = useMemo(() => [
    {
      id: 'randomid1',
      url: testBG,
      type: 'ac',
      amount: 300,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid2',
      url: testBG2,
      type: 'ac',
      amount: 500,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi3',
      url: testBG3,
      type: 'ac',
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      amount: 700,
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid4',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 2500,
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid5',
      url: testBG2,
      type: 'ac',
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      amount: 200,
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi6',
      url: testBG3,
      type: 'ac',
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      amount: 250,
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid7',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 2400,
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid8',
      url: testBG2,
      type: 'ac',
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      amount: 2570,
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi9',
      url: testBG3,
      type: 'ac',
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      amount: 200,
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid10',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 500,
      user: {
        avatar: testUser2,
      },
    },
  ], []);
  const collectionMC = useMemo(() => [
    {
      id: 'randomid1',
      url: testBG,
      type: 'mc',
      votes: 300,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid2',
      url: testBG2,
      type: 'mc',
      votes: 320,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi3',
      url: testBG3,
      type: 'mc',
      votes: 200,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid4',
      url: testBG,
      type: 'mc',
      votes: 500,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid5',
      url: testBG2,
      type: 'mc',
      votes: 700,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi6',
      url: testBG3,
      type: 'mc',
      votes: 100,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid7',
      url: testBG,
      type: 'mc',
      votes: 600,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid8',
      url: testBG2,
      type: 'mc',
      votes: 3000,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi9',
      url: testBG3,
      type: 'mc',
      votes: 1300,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid10',
      url: testBG,
      type: 'mc',
      votes: 200,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
  ], []);
  const collectionCF = useMemo(() => [
    {
      id: 'randomid1',
      url: testBG,
      type: 'cf',
      total: 10000,
      backed: 8000,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid2',
      url: testBG2,
      type: 'cf',
      total: 20000,
      backed: 3200,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi3',
      url: testBG3,
      type: 'cf',
      total: 5000,
      backed: 1000,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid4',
      url: testBG,
      type: 'cf',
      total: 100000,
      backed: 10000,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid5',
      url: testBG2,
      type: 'cf',
      total: 30000,
      backed: 1200,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi6',
      url: testBG3,
      type: 'cf',
      total: 10000,
      backed: 1200,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid7',
      url: testBG,
      type: 'cf',
      total: 10000,
      backed: 1200,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid8',
      url: testBG2,
      type: 'cf',
      total: 10000,
      backed: 1200,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi9',
      url: testBG3,
      type: 'cf',
      total: 10000,
      backed: 1200,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid10',
      url: testBG,
      type: 'cf',
      total: 10000,
      backed: 1200,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser2,
      },
    },
  ], []);
  const collectionBiggest = useMemo(() => [
    {
      id: 'randomid1',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 300,
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid2',
      url: testBG2,
      type: 'mc',
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      votes: 200,
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi3',
      url: testBG3,
      type: 'cf',
      total: 10000,
      backed: 1200,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid4',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 4500,
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid5',
      url: testBG2,
      type: 'mc',
      votes: 100,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi6',
      url: testBG3,
      type: 'cf',
      total: 20000,
      backed: 2340,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid7',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 3450,
      user: {
        avatar: testUser2,
      },
    },
    {
      id: 'randomid8',
      url: testBG2,
      type: 'mc',
      votes: 120,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser3,
      },
    },
    {
      id: 'randomi9',
      url: testBG3,
      type: 'cf',
      total: 230,
      backed: 3500,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser4,
      },
    },
    {
      id: 'randomid10',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 230,
      user: {
        avatar: testUser2,
      },
    },
  ], []);
  const collectionCreator = useMemo(() => [
    {
      id: 'randomid1',
      url: testBGCreator1,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 300,
      user: {
        avatar: testUser1,
      },
    },
    {
      id: 'randomid2',
      url: testBGCreator2,
      type: 'mc',
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      votes: 200,
      user: {
        avatar: testUser1,
      },
    },
    {
      id: 'randomi3',
      url: testBGCreator3,
      type: 'cf',
      total: 10000,
      backed: 1200,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        avatar: testUser1,
      },
    },
    {
      id: 'randomid4',
      url: testBGCreator1,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 4500,
      user: {
        avatar: testUser1,
      },
    },
    {
      id: 'randomid5',
      url: testBGCreator2,
      type: 'mc',
      votes: 100,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser1,
      },
    },
    {
      id: 'randomi6',
      url: testBGCreator3,
      type: 'cf',
      total: 20000,
      backed: 2340,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser1,
      },
    },
    {
      id: 'randomid7',
      url: testBGCreator1,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 3450,
      user: {
        avatar: testUser1,
      },
    },
    {
      id: 'randomid8',
      url: testBGCreator2,
      type: 'mc',
      votes: 120,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        avatar: testUser1,
      },
    },
    {
      id: 'randomi9',
      url: testBGCreator3,
      type: 'cf',
      total: 230,
      backed: 3500,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        avatar: testUser1,
      },
    },
    {
      id: 'randomid10',
      url: testBGCreator1,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 230,
      user: {
        avatar: testUser1,
      },
    },
  ], []);

  return (
    <>
      {!user.loggedIn && <HeroSection />}
      <TopSection collection={collection} />
      {user.loggedIn && (
        <CardsSection
          title={t('for-you-block-title')}
          category="for-you"
          collection={collectionBiggest}
        />
      )}
      <CardsSection
        title={t('ac-block-title')}
        category="ac"
        collection={collectionAC}
      />
      <CardsSection
        title={t('mc-block-title')}
        category="mc"
        collection={collectionMC}
      />
      <CardsSection
        title={t('cf-block-title')}
        category="cf"
        collection={collectionCF}
      />
      <CardsSection
        title={t('biggest-block-title')}
        category="biggest"
        collection={collectionBiggest}
      />
      <CardsSection
        user={{
          avatar: testUser1,
          username: 'bellapoarch',
        }}
        type="creator"
        category="bellapoarch"
        collection={collectionCreator}
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
    </>
  );
};

(Home as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <HomeLayout>
    {page}
  </HomeLayout>
);

export default Home;

export async function getStaticProps(context: NextPageContext): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale as string,
    ['common', 'home'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}
