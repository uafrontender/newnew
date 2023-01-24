import React from 'react';
import { animateScroll } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';

import Caption from '../atoms/Caption';
import InlineSVG from '../atoms/InlineSVG';
import Indicator from '../atoms/Indicator';

import addIconFilled from '../../public/images/svg/icons/filled/Create.svg';
import addIconOutlined from '../../public/images/svg/icons/outlined/Create.svg';
import menuIconOutlined from '../../public/images/svg/icons/outlined/Menu.svg';
import homeIconFilled from '../../public/images/svg/icons/filled/Home.svg';
import homeIconOutlined from '../../public/images/svg/icons/outlined/Home.svg';
import shareIconFilled from '../../public/images/svg/icons/filled/Share.svg';
import shareIconOutlined from '../../public/images/svg/icons/outlined/Share.svg';
import dashboardIconFilled from '../../public/images/svg/icons/filled/Earnings.svg';
import dashboardIconOutlined from '../../public/images/svg/icons/outlined/Earnings.svg';
import notificationsIconFilled from '../../public/images/svg/icons/filled/Notifications.svg';
import notificationsIconOutlined from '../../public/images/svg/icons/outlined/Notifications.svg';
import iconDirectMessages from '../../public/images/svg/icons/outlined/Comments.svg';
import iconBundlesOutlined from '../../public/images/svg/icons/outlined/Bundles.svg';
import iconBundlesFilled from '../../public/images/svg/icons/filled/Bundles.svg';

import { SCROLL_TO_TOP } from '../../constants/timings';
import { Mixpanel } from '../../utils/mixpanel';
import { I18nNamespaces } from '../../@types/i18next';

const icons: any = {
  outlined: {
    add: addIconOutlined,
    home: homeIconOutlined,
    more: menuIconOutlined,
    share: shareIconOutlined,
    dashboard: dashboardIconOutlined,
    notifications: notificationsIconOutlined,
    dms: iconDirectMessages,
    bundles: iconBundlesOutlined,
  },
  filled: {
    add: addIconFilled,
    home: homeIconFilled,
    more: menuIconOutlined,
    share: shareIconFilled,
    dashboard: dashboardIconFilled,
    notifications: notificationsIconFilled,
    dms: iconDirectMessages,
    bundles: iconBundlesFilled,
  },
};

export type TBottomNavigationItem = {
  key: keyof I18nNamespaces['common']['mobileBottomNavigation'];
  url: string;
  counter?: number;
  actionHandler?: () => void;
};

interface IBottomNavigationItem {
  item: TBottomNavigationItem;
  width: string;
}

const BottomNavigationItem: React.FC<IBottomNavigationItem> = (props) => {
  const { item, width } = props;
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const active = item.url === router.route;

  const handleClick = (value: any) => {
    if (router.pathname === '/' && item.url === '/') {
      animateScroll.scrollToTop({
        smooth: 'easeInOutQuart',
        duration: SCROLL_TO_TOP,
      });
    }
    if (value.key === 'add') {
      Mixpanel.track('Navigation Item Clicked', {
        _stage: 'Creation',
        _button: 'New Post',
      });
    } else {
      Mixpanel.track('Navigation Item Clicked', {
        _component: 'BottomNavigation',
        _target: item.url,
      });
    }
  };

  return item?.actionHandler ? (
    <SContainer width={width} onClick={item?.actionHandler}>
      <SSVGContainer>
        <InlineSVG
          key={item.key}
          svg={icons?.[active ? 'filled' : 'outlined']?.[item.key]}
          fill={
            active
              ? theme.colorsThemed.accent.blue
              : theme.colorsThemed.text.tertiary
          }
          width='24px'
          height='24px'
        />
        {item.counter !== undefined && item.counter > 0 && (
          <SIndicatorContainer>
            <Indicator minified counter={item.counter} />
          </SIndicatorContainer>
        )}
      </SSVGContainer>
      <SCaption variant={3} active={active}>
        {t(`mobileBottomNavigation.${item.key}`)}
      </SCaption>
    </SContainer>
  ) : (
    <SContainer width={width} onClick={() => handleClick(item)}>
      <Link href={item.url}>
        <a>
          <SSVGContainer>
            <InlineSVG
              key={item.key}
              svg={icons?.[active ? 'filled' : 'outlined']?.[item.key]}
              fill={
                active
                  ? theme.colorsThemed.accent.blue
                  : theme.colorsThemed.text.tertiary
              }
              width='24px'
              height='24px'
            />
            {item.counter !== undefined && item.counter > 0 && (
              <SIndicatorContainer>
                <Indicator minified counter={item.counter} />
              </SIndicatorContainer>
            )}
          </SSVGContainer>
          <SCaption variant={3} active={active}>
            {t(`mobileBottomNavigation.${item.key}`)}
          </SCaption>
        </a>
      </Link>
    </SContainer>
  );
};

export default BottomNavigationItem;

interface ISContainer {
  width: string;
}

const SContainer = styled.div<ISContainer>`
  width: ${(props) => props.width};
  cursor: pointer;
  padding: 8px 2px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  max-width: 63px;

  a {
    display: flex;
    width: 100%;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }

  ${({ theme }) => theme.media.mobileM} {
    margin: 0 5px;
  }

  ${({ theme }) => theme.media.mobileL} {
    margin: 0 8px;
  }
`;

interface ISTitle {
  active: boolean;
}

const SCaption = styled(Caption)<ISTitle>`
  color: ${(props) =>
    props.theme.colorsThemed.text[props.active ? 'primary' : 'tertiary']};
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-top: 4px;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const SSVGContainer = styled.div`
  position: relative;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SIndicatorContainer = styled.div`
  top: -1px;
  right: -1px;
  position: absolute;
`;
