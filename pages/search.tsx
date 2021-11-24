import React, { ReactElement, useMemo } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPage, NextPageContext } from 'next';

import List from '../components/organisms/search/List';
import Filters from '../components/organisms/Filters';
import Headline from '../components/atoms/Headline';
import HomeLayout from '../components/templates/HomeLayout';

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

  return (
    <>
      <SWrapper>
        <STopWrapper>
          <Headline animation="t01" variant={4}>
            {t(`${category}-block-title`)}
          </Headline>
          <Filters />
        </STopWrapper>
        <SListContainer>
          <List
            category={category}
            collection={collection}
          />
        </SListContainer>
      </SWrapper>
    </>
  );
};

(Search as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <HomeLayout>
      { page }
    </HomeLayout>
  );
};

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

const SWrapper = styled.section`
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

const STopWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
