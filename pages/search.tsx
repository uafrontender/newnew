/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage, NextPageContext } from 'next';

import List from '../components/organisms/search/List';
import TitleBlock from '../components/organisms/search/TitleBlock';
import HomeLayout from '../components/templates/HomeLayout';
import TopSection from '../components/organisms/home/TopSection';

import { NextPageWithLayout } from './_app';

import testBG from '../public/images/mock/test_bg_1.jpg';
import testBG2 from '../public/images/mock/test_bg_2.jpg';
import testBG3 from '../public/images/mock/test_bg_3.jpg';
import testUser2 from '../public/images/mock/test_user_2.jpg';
import testUser3 from '../public/images/mock/test_user_3.jpg';
import testUser4 from '../public/images/mock/test_user_4.jpg';

const Search: NextPage = () => {
  const { t } = useTranslation('home');
  const router = useRouter();
  const category = router.query.category?.toString() ?? '';

  const collection = useMemo(() => [
    {
      id: 'randomid1',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid2',
      url: testBG2,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        userData: {
          avatarUrl: testUser3,
        },
      },
    },
    {
      id: 'randomi3',
      url: testBG3,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid4',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid5',
      url: testBG2,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        userData: {
          avatarUrl: testUser3,
        },
      },
    },
    {
      id: 'randomi6',
      url: testBG3,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid7',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid8',
      url: testBG2,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        userData: {
          avatarUrl: testUser3,
        },
      },
    },
    {
      id: 'randomi9',
      url: testBG3,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid10',
      url: testBG,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        userData: {
          avatarUrl: testUser2,
        },
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
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid2',
      url: testBG2,
      type: 'ac',
      amount: 500,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        userData: {
          avatarUrl: testUser3,
        },
      },
    },
    {
      id: 'randomi3',
      url: testBG3,
      type: 'ac',
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      amount: 700,
      user: {
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid4',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 2500,
      user: {
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid5',
      url: testBG2,
      type: 'ac',
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      amount: 200,
      user: {
        userData: {
          avatarUrl: testUser3,
        },
      },
    },
    {
      id: 'randomi6',
      url: testBG3,
      type: 'ac',
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      amount: 250,
      user: {
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid7',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 2400,
      user: {
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid8',
      url: testBG2,
      type: 'ac',
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      amount: 2570,
      user: {
        userData: {
          avatarUrl: testUser3,
        },
      },
    },
    {
      id: 'randomi9',
      url: testBG3,
      type: 'ac',
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      amount: 200,
      user: {
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid10',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 500,
      user: {
        userData: {
          avatarUrl: testUser2,
        },
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
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid2',
      url: testBG2,
      type: 'mc',
      votes: 320,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        userData: {
          avatarUrl: testUser3,
        },
      },
    },
    {
      id: 'randomi3',
      url: testBG3,
      type: 'mc',
      votes: 200,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid4',
      url: testBG,
      type: 'mc',
      votes: 500,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid5',
      url: testBG2,
      type: 'mc',
      votes: 700,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        userData: {
          avatarUrl: testUser3,
        },
      },
    },
    {
      id: 'randomi6',
      url: testBG3,
      type: 'mc',
      votes: 100,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid7',
      url: testBG,
      type: 'mc',
      votes: 600,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid8',
      url: testBG2,
      type: 'mc',
      votes: 3000,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        userData: {
          avatarUrl: testUser3,
        },
      },
    },
    {
      id: 'randomi9',
      url: testBG3,
      type: 'mc',
      votes: 1300,
      title: 'If 200 of you guys back this decision, I\'ll eat 10 🍋',
      user: {
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid10',
      url: testBG,
      type: 'mc',
      votes: 200,
      title: 'Want a new tattoo. Where should I get it? 🙈',
      user: {
        userData: {
          avatarUrl: testUser2,
        },
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
        userData: {
          avatarUrl: testUser2,
        },
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
        userData: {
          avatarUrl: testUser3,
        },
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
        userData: {
          avatarUrl: testUser4,
        },
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
        userData: {
          avatarUrl: testUser2,
        },
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
        userData: {
          avatarUrl: testUser3,
        },
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
        userData: {
          avatarUrl: testUser4,
        },
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
        userData: {
          avatarUrl: testUser2,
        },
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
        userData: {
          avatarUrl: testUser3,
        },
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
        userData: {
          avatarUrl: testUser4,
        },
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
        userData: {
          avatarUrl: testUser2,
        },
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
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid2',
      url: testBG2,
      type: 'mc',
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      votes: 200,
      user: {
        userData: {
          avatarUrl: testUser3,
        },
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
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid4',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 4500,
      user: {
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid5',
      url: testBG2,
      type: 'mc',
      votes: 100,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        userData: {
          avatarUrl: testUser3,
        },
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
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid7',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 3450,
      user: {
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
    {
      id: 'randomid8',
      url: testBG2,
      type: 'mc',
      votes: 120,
      title: 'New Iron Man. Who will it be? It\'s all depends on you!',
      user: {
        userData: {
          avatarUrl: testUser3,
        },
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
        userData: {
          avatarUrl: testUser4,
        },
      },
    },
    {
      id: 'randomid10',
      url: testBG,
      type: 'ac',
      title: 'Want a new tattoo. Where should I get it? 🙈',
      amount: 230,
      user: {
        userData: {
          avatarUrl: testUser2,
        },
      },
    },
  ], []);

  const collections: any = {
    'for-you': collectionBiggest,
    ac: collectionAC,
    mc: collectionMC,
    cf: collectionCF,
    biggest: collectionBiggest,
  };

  useEffect(() => {
    scroller.scrollTo(category, {
      smooth: true,
      offset: -100,
      containerId: 'generalScrollContainer',
    });
  }, [category]);

  return (
    <>
      <Head>
        <title>
          {t('search.meta.title')}
        </title>
      </Head>
      {/* Temp */}
      {/* <TopSection collection={collection} />
      <SWrapper name={category}>
        <TitleBlock />
        <SListContainer>
          <List
            category={category}
            collection={collections[category] || []}
          />
        </SListContainer>
      </SWrapper> */}
    </>
  );
};

(Search as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>
    {page}
  </HomeLayout>
);

export default Search;

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

interface ISWrapper {
  name: string;
}

const SWrapper = styled.section<ISWrapper>`
  padding: 0 0 24px 0;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${(props) => props.theme.media.tablet} {
    padding: 32px 0;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 40px 0;
  }
`;

const SListContainer = styled.div`
  position: relative;
`;
