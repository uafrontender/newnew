import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import InlineSVG from '../atoms/InlineSVG';

import addIcon from '../../public/images/svg/mobile-bottom-navigation-add.svg';
import homeIcon from '../../public/images/svg/mobile-bottom-navigation-home.svg';
import shareIcon from '../../public/images/svg/mobile-bottom-navigation-share.svg';
import dashboardIcon from '../../public/images/svg/mobile-bottom-navigation-dashboard.svg';
import notificationsIcon from '../../public/images/svg/mobile-bottom-navigation-notifications.svg';

const icons: any = {
  add: addIcon,
  home: homeIcon,
  share: shareIcon,
  dashboard: dashboardIcon,
  notifications: notificationsIcon,
};

interface IBottomNavigationItem {
  item: {
    key: string,
    url: string
  };
}

export const BottomNavigationItem: React.FC<IBottomNavigationItem> = (props) => {
  const { item } = props;
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const active = item.url === router.route;

  return (
    <Link href={item.url} passHref>
      <SContainer>
        <InlineSVG
          key={item.key}
          svg={icons[item.key]}
          fill={theme.colorsThemed[active ? 'mobileNavigationActive' : 'mobileNavigation']}
          width="24px"
          height="24px"
        />
        <STitle active={active}>{t(`mobile-bottom-navigation-${item.key}`)}</STitle>
      </SContainer>
    </Link>
  );
};

export default BottomNavigationItem;

const SContainer = styled.a`
  padding: 8px 12px 4px;
  display: flex;
  align-items: center;
  flex-direction: column;
  text-decoration: none;
  justify-content: center;
`;

interface ISTitle {
  active: boolean;
}

const STitle = styled.div<ISTitle>`
  color: ${(props) => props.theme.colorsThemed[props.active ? 'mobileNavigationActive' : 'mobileNavigation']};
  font-size: ${(props) => props.theme.fontSizes.mobileBottomNavigation};
  margin-top: 1px;
`;
