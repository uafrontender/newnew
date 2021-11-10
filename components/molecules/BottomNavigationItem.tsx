import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Caption from '../atoms/Caption';
import InlineSVG from '../atoms/InlineSVG';
import Indicator from '../atoms/Indicator';

import addIconFilled from '../../public/images/svg/icons/filled/Create.svg';
import addIconOutlined from '../../public/images/svg/icons/outlined/Create.svg';
import homeIconFilled from '../../public/images/svg/icons/filled/Home.svg';
import homeIconOutlined from '../../public/images/svg/icons/outlined/Home.svg';
import shareIconFilled from '../../public/images/svg/icons/filled/Share.svg';
import shareIconOutlined from '../../public/images/svg/icons/outlined/Share.svg';
import dashboardIconFilled from '../../public/images/svg/icons/filled/Dashboard.svg';
import dashboardIconOutlined from '../../public/images/svg/icons/outlined/Dashboard.svg';
import notificationsIconFilled from '../../public/images/svg/icons/filled/Notifications.svg';
import notificationsIconOutlined from '../../public/images/svg/icons/outlined/Notifications.svg';

const icons: any = {
  outlined: {
    add: addIconOutlined,
    home: homeIconOutlined,
    share: shareIconOutlined,
    dashboard: dashboardIconOutlined,
    notifications: notificationsIconOutlined,
  },
  filled: {
    add: addIconFilled,
    home: homeIconFilled,
    share: shareIconFilled,
    dashboard: dashboardIconFilled,
    notifications: notificationsIconFilled,
  },
};

export type TBottomNavigationItem = {
  key: string,
  url: string,
  width: string,
  counter?: number,
}

interface IBottomNavigationItem {
  item: TBottomNavigationItem;
}

export const BottomNavigationItem: React.FC<IBottomNavigationItem> = (props) => {
  const { item } = props;
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const active = item.url === router.route;

  return (
    <Link href={item.url} passHref>
      <SContainer width={item.width}>
        <SSVGContainer>
          <InlineSVG
            key={item.key}
            svg={icons?.[active ? 'filled' : 'outlined']?.[item.key]}
            fill={active ? theme.colorsThemed.accent.blue : theme.colorsThemed.text.tertiary}
            width="24px"
            height="24px"
          />
          {!!item.counter && (
            <SIndicatorContainer>
              <Indicator minified counter={item.counter} />
            </SIndicatorContainer>
          )}
        </SSVGContainer>
        <SCaption variant={2} active={active}>
          {t(`mobile-bottom-navigation-${item.key}`)}
        </SCaption>
      </SContainer>
    </Link>
  );
};

export default BottomNavigationItem;

interface ISContainer {
  width: string;
}

const SContainer = styled.a<ISContainer>`
  width: ${(props) => props.width};
  margin: 0 8px;
  padding: 8px 2px;
  display: flex;
  align-items: center;
  flex-direction: column;
  text-decoration: none;
  justify-content: center;
`;

interface ISTitle {
  active: boolean;
}

const SCaption = styled(Caption)<ISTitle>`
  color: ${(props) => props.theme.colorsThemed.text[props.active ? 'primary' : 'tertiary']};
  width: 100%;
  overflow: hidden;
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
