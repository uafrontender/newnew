import { createContext } from 'react';

const AuthLayoutContext = createContext({
  shouldHeroUnmount: false,
  setShouldHeroUnmount: (newValue: boolean) => {},
});
export default AuthLayoutContext;
