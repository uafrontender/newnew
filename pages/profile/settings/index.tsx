/* eslint-disable react/jsx-no-target-blank */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useUpdateEffect } from 'react-use';

// Redux
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import {
  setColorMode,
  TColorMode,
} from '../../../redux-store/slices/uiStateSlice';
import {
  logoutUser,
  logoutUserClearCookiesAndRedirect,
  // setUserData,
} from '../../../redux-store/slices/userStateSlice';

// API
import { logout /* , updateMe */ } from '../../../api/endpoints/user';

// import useErrorToasts from '../../../utils/hooks/useErrorToasts';

import { NextPageWithLayout } from '../../_app';
import MyProfileSettingsLayout from '../../../components/templates/MyProfileSettingsLayout';

import Headline from '../../../components/atoms/Headline';
import GoBackButton from '../../../components/molecules/GoBackButton';
import SettingsColorModeSwitch from '../../../components/molecules/profile/SettingsColorModeSwitch';
import SettingsAccordion, {
  AccordionSection,
} from '../../../components/organisms/settings/SettingsAccordion';
import SettingsPersonalInformationSection from '../../../components/organisms/settings/SettingsPersonalInformationSection';
import SettingsNotificationsSection from '../../../components/organisms/settings/SettingsNotificationSection';
import SettingsCardsSection from '../../../components/organisms/settings/SettingsCards';
import TransactionsSection from '../../../components/organisms/settings/TransactionsSection';
import PrivacySection from '../../../components/organisms/settings/PrivacySection';
import { getMyTransactions } from '../../../api/endpoints/payments';
import assets from '../../../constants/assets';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';
import useGoBackOrRedirect from '../../../utils/useGoBackOrRedirect';

const MyProfileSettingsIndex = () => {
  const theme = useTheme();
  const router = useRouter();
  const { goBackOrRedirect } = useGoBackOrRedirect();

  // const { showErrorToastPredefined } = useErrorToasts();

  // Translations
  const { t } = useTranslation('page-Profile');
  // TEMP
  // const { t: commonT } = useTranslation('common');
  // useCookies
  const [, , removeCookie] = useCookies();
  // Redux
  const dispatch = useAppDispatch();

  const { userData, loggedIn, _persist } = useAppSelector(
    (state: any) => state.user
  );

  const { colorMode } = useAppSelector((state: any) => state.ui);
  const { resizeMode, setUserLoggedIn } = useAppState();
  // Measurements
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  // Logout loading
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const handleSetColorMode = useCallback(
    (mode: TColorMode) => {
      Mixpanel.track('Color Mode Set', {
        _stage: 'Profile Settings',
        _mode: mode,
      });
      dispatch(setColorMode(mode));
    },
    [dispatch]
  );

  const handleLogout = useCallback(async () => {
    try {
      Mixpanel.track('Logout', {
        _stage: 'Profile Settings',
      });

      setIsLogoutLoading(true);

      const payload = new newnewapi.EmptyRequest({});
      const res = await logout(payload);

      if (!res?.data || res.error) {
        throw new Error(res?.error?.message ?? 'Log out failed');
      }

      setUserLoggedIn(false);
      dispatch(logoutUser(''));

      // Unset credential cookies
      removeCookie('accessToken', {
        path: '/',
      });

      removeCookie('refreshToken', {
        path: '/',
      });

      setIsLogoutLoading(false);
    } catch (err) {
      console.error(err);
      setIsLogoutLoading(false);
      if ((err as Error).message === 'No token') {
        setUserLoggedIn(false);
        dispatch(logoutUserClearCookiesAndRedirect());
      }

      // Refresh token was present, session probably expired
      // Redirect to sign up page
      if ((err as Error).message === 'Refresh token invalid') {
        setUserLoggedIn(false);
        dispatch(
          logoutUserClearCookiesAndRedirect('/sign-up?reason=session_expired')
        );
      }
    }
  }, [dispatch, setIsLogoutLoading, removeCookie, setUserLoggedIn]);

  const [spendingHidden, setSpendingHidden] = useState(false);

  // NOTE: activity is temporarily disabled
  /* const handleToggleAccountPrivate = async () => {
    try {
      Mixpanel.track('Set profile privacy', {
        _stage: 'Privacy Profile Settings',
        _isActivityPrivate: !userData?.options?.isActivityPrivate,
      });

      const updateMePayload = new newnewapi.UpdateMeRequest({
        isActivityPrivate: !userData?.options?.isActivityPrivate,
      });

      const res = await updateMe(updateMePayload);

      const { data, error } = res;

      if (!data || error) throw new Error(error?.message ?? 'Request failed');

      dispatch(
        setUserData({
          options: {
            ...userData?.options,
            isActivityPrivate: data.me?.options?.isActivityPrivate,
            isCreator: data.me?.options?.isCreator,
            isVerified: data.me?.options?.isVerified,
            creatorStatus: data.me?.options?.creatorStatus,
          },
        })
      );
    } catch (err) {
      console.error(err);
      showErrorToastPredefined(undefined);
    }
  }; */

  const [myTransactions, setMyTransactions] = useState<
    newnewapi.ITransaction[]
  >([]);

  const [myTransactionsTotal, setMyTransactionsTotal] = useState(0);

  const fetchMyTransactions = useCallback(async () => {
    try {
      const payload = new newnewapi.GetMyTransactionsRequest({
        paging: { limit: 5 },
      });
      const res = await getMyTransactions(payload);
      const { data, error } = res;

      if (!data || error) throw new Error(error?.message ?? 'Request failed');
      if (data.paging?.total) setMyTransactionsTotal(data.paging?.total);
      if (data.transactions) setMyTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const accordionSections: AccordionSection[] = [
    {
      id: 'cards',
      title: t('Settings.sections.cards.title'),
      content: <SettingsCardsSection />,
    },
    {
      id: 'info',
      title: t('Settings.sections.personalInformation.title'),
      content: (
        <SettingsPersonalInformationSection
          currentEmail={userData?.email ?? ''}
          currentDate={
            userData?.dateOfBirth &&
            userData?.dateOfBirth.day &&
            userData?.dateOfBirth.month &&
            userData?.dateOfBirth.year
              ? new Date(
                  userData.dateOfBirth.year,
                  userData.dateOfBirth.month - 1,
                  userData.dateOfBirth.day
                )
              : undefined
          }
          // ) : (
          //   new Date(
          //     parsed.year!!,
          //     parsed.month!!,
          //     parsed.day!!,
          //   )
          // )}
          isMobile={isMobile}
        />
      ),
    },
    {
      id: 'notifications',
      title: t('Settings.sections.notifications.title'),
      content: <SettingsNotificationsSection />,
    },
    {
      id: 'transactions',
      title: t('Settings.sections.transactions.title'),
      content: (
        <TransactionsSection
          transactions={myTransactions}
          transactionsTotal={myTransactionsTotal}
          transactionsLimit={5}
          handleSetActive={() => {}}
        />
      ),
    },
    {
      id: 'privacy',
      title: t('Settings.sections.privacy.title'),
      content: (
        <PrivacySection
          isSpendingHidden={spendingHidden}
          // isAccountPrivate={userData?.options?.isActivityPrivate ?? false}
          handleToggleSpendingHidden={() => setSpendingHidden((curr) => !curr)}
          // handleToggleAccountPrivate={handleToggleAccountPrivate}
          handleSetActive={() => {}}
        />
      ),
    },
  ];

  useUpdateEffect(() => {
    // Redirect only after the persist data is pulled
    if (!loggedIn && _persist?.rehydrated) {
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, _persist?.rehydrated, router]);

  useEffect(() => {
    fetchMyTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Head>
        <title>{t('Settings.meta.title')}</title>
        <meta name='description' content={t('Settings.meta.description')} />
        <meta property='og:title' content={t('Settings.meta.title')} />
        <meta
          property='og:description'
          content={t('Settings.meta.description')}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <SMain>
        <SGoBackButton
          onClick={() => {
            Mixpanel.track('Back button Clicked', {
              _stage: 'Settings',
            });
            goBackOrRedirect('/profile/my-posts');
          }}
        >
          {isMobile ? t('Settings.heading') : t('Settings.button.back')}
        </SGoBackButton>
        {!isMobile ? (
          <SHeadline variant={4}>{t('Settings.heading')}</SHeadline>
        ) : null}
        <SettingsColorModeSwitch
          theme={theme}
          currentlySelectedMode={colorMode}
          variant={isMobileOrTablet ? 'horizontal' : 'vertical'}
          isMobile={isMobile}
          buttonsCaptions={{
            light: t('Settings.colorModeSwitch.options.light'),
            dark: t('Settings.colorModeSwitch.options.dark'),
            auto: t('Settings.colorModeSwitch.options.auto'),
          }}
          handleSetColorMode={handleSetColorMode}
          wrapperStyle={{
            ...(isMobile
              ? {
                  position: 'absolute',
                  top: -6,
                  right: 16,
                }
              : {}),
            ...(isTablet
              ? {
                  position: 'absolute',
                  top: 36,
                  right: 0,
                }
              : {}),
            ...(!isMobileOrTablet
              ? {
                  position: 'absolute',
                  top: 115.5,
                  right: -68,
                }
              : {}),
          }}
        />
        <SettingsAccordion sections={accordionSections} />
        <SBottomLinksDiv>
          {/* TEMP */}
          {/* <SBlockOptionButton>
            {commonT(`language.selectedLanguageTitle/${router.locale}`)}
          </SBlockOptionButton> */}
          <SBlockOption href='https://faqs.newnew.co' target='_blank'>
            {t('Settings.bottomDiv.help')}
          </SBlockOption>
          <SBlockOptionButton
            disabled={isLogoutLoading}
            onClick={() => handleLogout()}
          >
            {t('Settings.bottomDiv.logout')}
          </SBlockOptionButton>
        </SBottomLinksDiv>
      </SMain>
    </div>
  );
};

(MyProfileSettingsIndex as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return <MyProfileSettingsLayout>{page}</MyProfileSettingsLayout>;
};

export default MyProfileSettingsIndex;

const SMain = styled.main`
  position: relative;
  padding: 0 16px;
  ${({ theme }) => theme.media.tablet} {
    padding: 0;
  }
  ${({ theme }) => theme.media.laptop} {
    width: 736px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const SGoBackButton = styled(GoBackButton)`
  margin-bottom: 30px;
  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 12px;
  }
`;

const SHeadline = styled(Headline)`
  margin-bottom: 32px;
  font-weight: 600;

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 40px;
  }
`;

const SBottomLinksDiv = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 24px;
`;

const SBlockOptionButton = styled.button`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 14px;
  transition: color ease 0.5s;
  font-weight: 600;
  line-height: 24px;
  margin-bottom: 12px;
  background: transparent;
  border: none;

  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.colorsThemed.text.primary};
  }
  &:hover,
  &:focus {
    outline: none;
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const SBlockOption = styled.a`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 14px;
  transition: color ease 0.5s;
  font-weight: 600;
  line-height: 24px;
  margin-bottom: 12px;

  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.colorsThemed.text.primary};
  }
`;

export async function getServerSideProps(context: {
  locale: string;
}): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale,
    ['common', 'page-Profile', 'page-VerifyEmail'],
    null,
    SUPPORTED_LANGUAGES
  );

  // @ts-ignore
  if (!context?.req?.cookies?.accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

  return {
    props: {
      ...translationContext,
    },
  };
}
