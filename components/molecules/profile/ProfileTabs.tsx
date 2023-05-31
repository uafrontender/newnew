import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Tabs, { Tab } from '../Tabs';
import { useAppState } from '../../../contexts/appStateContext';

interface IProfileTabs {
  tabs: Tab[];
  pageType: 'myProfile' | 'othersProfile';
}

const findActiveTab = (
  tabs: Tab[],
  currentPathname: string,
  pageType: 'myProfile' | 'othersProfile'
) => {
  if (pageType === 'myProfile') {
    return tabs.findIndex(
      (tab) =>
        currentPathname.split('/').join('') === tab.url.split('/').join('')
    );
  }

  let pathnameCleaned = `/${currentPathname.substring(
    currentPathname.indexOf('/', 6)
  )}`;

  if (pathnameCleaned.includes('[username]')) {
    pathnameCleaned = '/';
  }

  return tabs.findIndex((tab) => {
    const tabNameCleaned = `/${
      tab.url.indexOf('/', 3) !== -1
        ? tab.url.substring(tab.url.indexOf('/', 3))
        : ''
    }`;

    return (
      pathnameCleaned.split('/').join('') === tabNameCleaned.split('/').join('')
    );
  });
};

const ProfileTabs: React.FunctionComponent<IProfileTabs> = (props) => {
  const { tabs, pageType } = props;
  const { t } = useTranslation('page-Profile');
  const router = useRouter();

  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  return (
    <Tabs
      t={t}
      tabs={tabs}
      hideIndicatorOnResizing={!isMobile}
      activeTabIndex={findActiveTab(tabs, router.pathname, pageType)}
    />
  );
};

export default ProfileTabs;
