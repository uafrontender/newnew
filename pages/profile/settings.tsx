import React, { ReactElement, useCallback } from 'react';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { useAppDispatch, useAppSelector } from '../../redux-store/store';

import { NextPageWithLayout } from '../_app';
import MyProfileSettingsLayout from '../../components/templates/MyProfileSettingsLayout';
import SettingsColorModeSwitch from '../../components/molecules/profile/SettingsColorModeSwitch';
import { setColorMode, TColorMode } from '../../redux-store/slices/uiStateSlice';

const MyProfileSettginsIndex: NextPage = () => {
  const dispatch = useAppDispatch();
  const { resizeMode, colorMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const handleSetColorMode = useCallback(
    (mode: TColorMode) => {
      dispatch(setColorMode(mode));
    },
    [dispatch],
  );

  return (
    <div>
      <main>
        <h1>
          I will be general settings page
        </h1>
        <SettingsColorModeSwitch
          currentlySelectedMode={colorMode}
          variant={isMobileOrTablet ? 'horizontal' : 'vertical'}
          handleSetColorMode={handleSetColorMode}
        />
        <div
          style={{ height: '500px' }}
        />
      </main>
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
