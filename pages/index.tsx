import type { NextPage } from 'next';
import Link from 'next/link';
import { toggleColorModeWithLS, _setColorMode } from '../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../redux-store/store';

import InlineSVG from '../components/atoms/InlineSVG';

import SVGVercel from '../public/vercel.svg';

const Home: NextPage = () => {
  const dispatch = useAppDispatch();
  const { colorMode } = useAppSelector(state => state.ui);

  return (
    <div>
      <main>
        <h1>
          Welcome to NewNew!
        </h1>
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
