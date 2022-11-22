import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';

interface ILanguageWrapper {
  children: React.ReactNode;
}

const LanguageWrapper: React.FunctionComponent<ILanguageWrapper> = ({
  children,
}) => {
  const [cookies] = useCookies();
  const { replace, locale, asPath, pathname } = useRouter();

  useEffect(() => {
    if (cookies.preferredLocale && cookies.preferredLocale !== locale) {
      replace(pathname, asPath, { locale: cookies.preferredLocale });
    }
  }, [asPath, cookies.preferredLocale, locale, pathname, replace]);

  return <>{children}</>;
};

export default LanguageWrapper;
