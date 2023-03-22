import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'next-i18next';

interface ILanguageWrapper {
  children: React.ReactNode;
}

const LanguageWrapper: React.FunctionComponent<ILanguageWrapper> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const [cookies] = useCookies();
  const { replace, locale, asPath, pathname } = useRouter();

  useEffect(() => {
    if (
      cookies.preferredLocale &&
      cookies.preferredLocale !== locale &&
      i18n?.changeLanguage
    ) {
      replace(pathname, asPath, {
        locale: cookies.preferredLocale,
        shallow: true,
      });
      i18n.changeLanguage(cookies.preferredLocale);
    }
  }, [asPath, cookies.preferredLocale, i18n, locale, pathname, replace]);

  return <>{children}</>;
};

export default LanguageWrapper;
