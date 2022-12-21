import React from 'react';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';
import Indicator from '../atoms/Indicator';
import InlineSVG from '../atoms/InlineSVG';
import Button from '../atoms/Button';

import { Mixpanel } from '../../utils/mixpanel';

import iconNotifications from '../../public/images/svg/icons/outlined/Notifications.svg';
import iconDirectMessages from '../../public/images/svg/icons/outlined/Comments.svg';

const icons: any = {
  notifications: iconNotifications,
  directMessages: iconDirectMessages,
};

export type TNavigationItem = {
  key: string;
  url: string;
  value?: number;
  counter?: number;
  firstRender?: boolean;
};

export interface INavigationItem {
  item: TNavigationItem;
}

export const NavigationItem: React.FC<INavigationItem> = (props) => {
  const { item } = props;
  const theme = useTheme();

  return (
    <Link href={item.url}>
      <a>
        <SNavItem
          iconOnly
          view='tertiary'
          onClick={() => {
            Mixpanel.track('Navigation Item Clicked', {
              _target: item.url,
            });
          }}
        >
          <InlineSVG
            fill={theme.colorsThemed.text.primary}
            svg={icons[item.key]}
            width='24px'
            height='24px'
          />
          {item.counter !== undefined && item.counter > 0 && (
            <SIndicatorContainer>
              <Indicator counter={item.counter} animate={false} />
            </SIndicatorContainer>
          )}
        </SNavItem>
      </a>
    </Link>
  );
};

export default NavigationItem;

const SNavItem = styled(Button)`
  position: relative;
  overflow: visible;
  background: ${({ theme }) => theme.colorsThemed.background.tertiary};
`;

const SIndicatorContainer = styled.div`
  position: absolute;
  right: -5px;
  top: -3px;
`;
