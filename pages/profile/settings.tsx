import React, {
  ReactElement, useCallback, useContext, useEffect, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Redux
import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { setColorMode, TColorMode } from '../../redux-store/slices/uiStateSlice';
import { logoutUser, logoutUserClearCookiesAndRedirect, setUserData } from '../../redux-store/slices/userStateSlice';

// API
import { logout, updateMe } from '../../api/endpoints/user';

import { NextPageWithLayout } from '../_app';
import MyProfileSettingsLayout from '../../components/templates/MyProfileSettingsLayout';

import Headline from '../../components/atoms/Headline';
import GoBackButton from '../../components/molecules/GoBackButton';
import SettingsColorModeSwitch from '../../components/molecules/profile/SettingsColorModeSwitch';
import SettingsWallet from '../../components/organisms/settings/SettingsWallet';
import SettingsAccordion, { AccordionSection } from '../../components/organisms/settings/SettingsAccordion';
import SettingsPersonalInformationSection from '../../components/organisms/settings/SettingsPersonalInformationSection';
import SettingsNotificationsSection from '../../components/organisms/settings/SettingsNotificationSection';
import TransactionsSection from '../../components/organisms/settings/TransactionsSection';
import PrivacySection from '../../components/organisms/settings/PrivacySection';
import { SocketContext } from '../../contexts/socketContext';

// Mock
const unicornbabe = {
  uuid: '1',
  username: 'unicornbabe',
  nickname: 'UnicornBabe',
  avatarUrl: 'https://randomuser.me/api/portraits/women/34.jpg',
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  coverUrl: '/images/mock/profile-bg.png',
  options: {
    isCreator: true,
    isVerified: true,
  },
};

const MyProfileSettginsIndex: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  // Translations
  const { t } = useTranslation('profile');
  const { t: commonT } = useTranslation('common');
  // useCookies
  const [, , removeCookie] = useCookies();
  // Socket
  const socketConnection = useContext(SocketContext);
  // Redux
  const dispatch = useAppDispatch();
  const { userData, loggedIn } = useAppSelector((state) => state.user);
  const { resizeMode, colorMode } = useAppSelector((state) => state.ui);
  // Measurements
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);

  // Logout loading
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const handleSetColorMode = useCallback(
    (mode: TColorMode) => {
      dispatch(setColorMode(mode));
    },
    [dispatch],
  );

  const handleLogout = useCallback(
    async () => {
      try {
        setIsLogoutLoading(true);

        const payload = new newnewapi.EmptyRequest({});

        const res = await logout(
          payload,
        );

        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Log out failed');

        // Unset credential cookies
        removeCookie(
          'accessToken',
          {
            path: '/',
          },
        );
        removeCookie(
          'refreshToken',
          {
            path: '/',
          },
        );
        setIsLogoutLoading(false);

        dispatch(logoutUser(''));
      } catch (err) {
        console.error(err);
        setIsLogoutLoading(false);
        if ((err as Error).message === 'No token') {
          dispatch(logoutUserClearCookiesAndRedirect());
        }
        // Refresh token was present, session probably expired
        // Redirect to sign up page
        if ((err as Error).message === 'Refresh token invalid') {
          dispatch(logoutUserClearCookiesAndRedirect('sign-up?reason=session_expired'));
        }
      }
    },
    [dispatch, setIsLogoutLoading, removeCookie],
  );

  // temp
  const [notifications, setNotifications] = useState(
    [
      {
        title: 'Email Notifications',
        parameter: 'email',
        configs: [
          {
            title: 'New bids',
            parameter: 'new_bids',
            value: true,
          },
          {
            title: 'New decisions',
            parameter: 'new_decisions',
            value: true,
          },
          {
            title: 'Flags',
            parameter: 'flags',
            value: true,
          },
        ],
      },
      {
        title: 'Push Notifications',
        parameter: 'push',
        configs: [
          {
            title: 'New bids',
            parameter: 'new_bids',
            value: true,
          },
          {
            title: 'New decisions',
            parameter: 'new_decisions',
            value: true,
          },
          {
            title: 'Flags',
            parameter: 'flags',
            value: true,
          },
        ],
      },
    ],
  );
  const [spendingHidden, setSpendingHidden] = useState(false);

  const handleToggleAccountPrivate = async () => {
    try {
      const updateMePayload = new newnewapi.UpdateMeRequest({
        isActivityPrivate: !userData?.options?.isActivityPrivate,
      })

      const res = await updateMe(updateMePayload);

      const { data, error } = res;

      if (!data || error) throw new Error(error?.message ?? 'Request failed');

      dispatch(setUserData({
        options: {
          isActivityPrivate: data.me?.options?.isActivityPrivate,
          isCreator: data.me?.options?.isCreator,
          isVerified: data.me?.options?.isVerified,
          creatorStatus: data.me?.options?.creatorStatus,
        },
      }))
    } catch (err) {
      console.error(err);
    }
  }

  const accordionSections: AccordionSection[] = [
    {
      title: t('Settings.sections.PersonalInformation.title'),
      content: <SettingsPersonalInformationSection
        currentEmail={userData?.email ?? ''}
        currentDate={userData?.dateOfBirth ? (
          new Date(
            userData.dateOfBirth.year!!,
            userData.dateOfBirth.month!! - 1,
            userData.dateOfBirth.day!!,
          )
        ) : undefined}
        // ) : (
        //   new Date(
        //     parsed.year!!,
        //     parsed.month!!,
        //     parsed.day!!,
        //   )
        // )}
        isMobile={isMobile}
        handleSetActive={() => {}}
      />,
    },
    {
      title: t('Settings.sections.Notifications.title'),
      content: <SettingsNotificationsSection
        configs={notifications}
        handleUpdateItem={(category, itemname) => {
          const newNotifications = [...notifications];
          const idx1 = newNotifications.findIndex((c) => c.parameter === category);
          const idx2 = newNotifications[idx1].configs.findIndex((i) => i.parameter === itemname);
          newNotifications[idx1].configs[idx2].value = !newNotifications[idx1].configs[idx2].value;
          setNotifications(() => newNotifications);
        }}
        handleSetActive={() => {}}
      />,
    },
    {
      title: t('Settings.sections.Transactions.title'),
      content: <TransactionsSection
        transactions={[
          {
            actor: userData!!,
            recipient: unicornbabe,
            date: new Date('05.23.2021'),
            amount: 2.99,
            direction: 'from',
            action: 'bid',
          },
          {
            actor: userData!!,
            recipient: userData!!,
            date: new Date('04.23.2021'),
            amount: 400,
            direction: 'to',
            action: 'topup',
          },
        ]}
        handleSetActive={() => {}}
      />,
    },
    {
      title: t('Settings.sections.Privacy.title'),
      content: <PrivacySection
        isSpendingHidden={spendingHidden}
        isAccountPrivate={userData?.options?.isActivityPrivate ?? false}
        blockedUsers={[
          unicornbabe,
        ]}
        handleToggleSpendingHidden={() => setSpendingHidden((curr) => !curr)}
        handleToggleAccountPrivate={handleToggleAccountPrivate}
        handleUnblockUser={() => {}}
        handleCloseAccount={() => {}}
        handleSetActive={() => {}}
      />,
    },
  ];

  // Try to pre-fetch the content
  useEffect(() => {
    router.prefetch(`/`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loggedIn) router.push('/');
  }, [loggedIn, router]);

  // Listen to Me update event
  useEffect(() => {
    const handlerSocketMeUpdated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.MeUpdated.decode(arr);

      if (!decoded) return;

      dispatch(setUserData({
        email: decoded.me?.email,
      }));
    };

    if (socketConnection) {
      socketConnection.on('MeUpdated', handlerSocketMeUpdated);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('MeUpdated', handlerSocketMeUpdated);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  return (
    <div>
      <SMain>
        <SGoBackButton
          onClick={() => router.back()}
        >
          {isMobile ? t('Settings.heading') : t('Settings.goBackBtn')}
        </SGoBackButton>
        {!isMobile ? (
          <SHeadline
            variant={4}
          >
            { t('Settings.heading') }
          </SHeadline>
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
            ...(isMobile ? {
              position: 'absolute',
              top: -6,
              right: 16,
            } : {}),
            ...(isTablet ? {
              position: 'absolute',
              top: 36,
              right: 0,
            } : {}),
            ...(!isMobileOrTablet ? {
              position: 'absolute',
              top: 115.5,
              right: -68,
            } : {}),
          }}
        />
        <SettingsWallet />
        <SettingsAccordion
          sections={accordionSections}
        />
        <SBottomLinksDiv>
          <SBlockOptionButton>
            {commonT(`selected-language-title-${router.locale}`)}
          </SBlockOptionButton>
          <Link href="/help">
            <SBlockOption>
              {t('Settings.bottomDiv.help')}
            </SBlockOption>
          </Link>
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

(MyProfileSettginsIndex as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <MyProfileSettingsLayout>
      { page }
    </MyProfileSettingsLayout>
  );
};

export default MyProfileSettginsIndex;

const SMain = styled.main`
  position: relative;

  padding: 0px 16px;

  ${({ theme }) => theme.media.tablet} {
    padding: 0px 0px;
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
  &:hover, &:focus {
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

export async function getStaticProps(context: { locale: string }): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale,
    ['common', 'profile'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}
