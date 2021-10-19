import type { NextPage } from 'next'
import Link from 'next/link'
import { toggleColorModeWithLS, _setColorMode } from '../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../redux-store/store';

const Home: NextPage = () => {
  const dispatch = useAppDispatch();
  const { colorMode } = useAppSelector(state => state.ui)

  return (
    <div>
      <main>
        <h1>
          Welcome to NewNew!
        </h1>
        <button
          onClick={() => dispatch(_setColorMode(colorMode === 'dark' ? 'light' : 'dark'))}
        >
          Toggle dark mode
        </button>
        <button
          onClick={() => dispatch(toggleColorModeWithLS())}
        >
          Toggle dark mode using thunk with LS
        </button>
        <div>
          <Link href="/test">
            <a>Link to test page</a>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Home
