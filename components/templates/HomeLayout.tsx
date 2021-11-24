import React, { useMemo } from 'react';

import TopSection from '../organisms/home/TopSection';
import HeroSection from '../organisms/home/HeroSection';
import GeneralTemplate from './General';

import { useAppSelector } from '../../redux-store/store';

import testBG from '../../public/images/mock/test_bg_1.jpg';
import testBG2 from '../../public/images/mock/test_bg_2.jpg';
import testBG3 from '../../public/images/mock/test_bg_3.jpg';
import testUser2 from '../../public/images/mock/test_user_2.jpg';
import testUser3 from '../../public/images/mock/test_user_3.jpg';
import testUser4 from '../../public/images/mock/test_user_4.jpg';

const HomeLayout: React.FC = (props) => {
  const { children } = props;
  const user = useAppSelector((state) => state.user);

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

  return (
    <GeneralTemplate>
      {!user.loggedIn && <HeroSection />}
      <TopSection collection={collection} />
      {children}
    </GeneralTemplate>
  );
};

export default HomeLayout;
