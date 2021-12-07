import React, { ReactElement, useCallback, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { setColorMode, TColorMode } from '../../redux-store/slices/uiStateSlice';

import { NextPageWithLayout } from '../_app';
import MyProfileSettingsLayout from '../../components/templates/MyProfileSettingsLayout';

import Headline from '../../components/atoms/Headline';
import GoBackButton from '../../components/molecules/GoBackButton';
import SettingsColorModeSwitch from '../../components/molecules/profile/SettingsColorModeSwitch';
import SettingsAccordion, { AccordionSection } from '../../components/organisms/settings/SettingsAccordion';
import SettingsPersonalInformationSection from '../../components/organisms/settings/SettingsPersonalInformationSection';
import SettingsNotificationsSection from '../../components/organisms/settings/SettingsNotificationSection';
import SettingsWallet from '../../components/organisms/settings/SettingsWallet';
import TransactionsSection from '../../components/organisms/settings/TransactionsSection';

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
  const { t } = useTranslation('profile');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userData } = useAppSelector((state) => state.user);
  const { resizeMode, colorMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet', 'tabletL'].includes(resizeMode);

  const handleSetColorMode = useCallback(
    (mode: TColorMode) => {
      dispatch(setColorMode(mode));
    },
    [dispatch],
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

  const accordionSections: AccordionSection[] = [
    {
      title: t('Settings.sections.PersonalInformation.title'),
      content: <SettingsPersonalInformationSection
        currentEmail={userData?.email ?? ''}
        currentDate={undefined}
        // currentDate={userData?.birthDate ?? ''}
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
      content: <div>hey</div>,
    },
  ];

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
        <SettingsWallet
          // Temp
          balance={0}
        />
        <SettingsAccordion
          sections={accordionSections}
        />
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
