import React from 'react';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

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

import { SCROLL_TO_TOP } from '../../constants/timings';

const icons: any = {
  outlined: {
    add: addIconOutlined,
    home: homeIconOutlined,
    more: menuIconOutlined,
    share: shareIconOutlined,
    dashboard: dashboardIconOutlined,
    notifications: notificationsIconOutlined,
  },
  filled: {
    add: addIconFilled,
    home: homeIconFilled,
    more: menuIconOutlined,
    share: shareIconFilled,
    dashboard: dashboardIconFilled,
    notifications: notificationsIconFilled,
  },
};

export type TBottomNavigationItem = {
  key: string;
  url: string;
  width: string;
  counter?: number;
  actionHandler?: () => void;
};

interface IBottomNavigationItem {
  item: TBottomNavigationItem;
}

export const BottomNavigationItem: React.FC<IBottomNavigationItem> = (
  props
) => {
  const { item } = props;
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const active = item.url === router.route;

  const handleClick = () => {
    if (router.pathname === '/' && item.url === '/') {
      scroller.scrollTo('top-reload', {
        smooth: 'easeInOutQuart',
        duration: SCROLL_TO_TOP,
        containerId: 'generalScrollContainer',
      });
    } else {
      router.push(item.url, item.url);
    }
  };

  return (
    <SContainer width={item.width} onClick={item?.actionHandler ?? handleClick}>
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
        {!!item.counter && (
          <SIndicatorContainer>
            <Indicator minified counter={item.counter} />
          </SIndicatorContainer>
        )}
      </SSVGContainer>
      <SCaption variant={3} active={active}>
        {t(`mobile-bottom-navigation-${item.key}`)}
      </SCaption>
    </SContainer>
  );
};

export default BottomNavigationItem;

interface ISContainer {
  width: string;
}

const SContainer = styled.div<ISContainer>`
  width: ${(props) => props.width};
  margin: 0 8px;
  cursor: pointer;
  padding: 8px 2px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  max-width: 56px;
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
`;

const SIndicatorContainer = styled.div`
  top: -1px;
  right: -1px;
  position: absolute;
`;
