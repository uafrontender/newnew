import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import CountUp from 'react-countup';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Text from '../atoms/Text';
import Indicator from '../atoms/Indicator';

export type TNavigationItem = {
  key: string,
  url: string,
  value?: number,
  counter?: number,
}

export interface INavigationItem {
  item: TNavigationItem;
}

export const NavigationItem: React.FC<INavigationItem> = (props) => {
  const { item } = props;
  const { t } = useTranslation();
  const router = useRouter();

  const active = item.url === router.route;
  const bigCounter = (item.counter ?? 0) >= 100;

  return (
    <Link href={item.url}>
      <a>
        <SNavItem variant={3} active={active}>
          {t(`mobile-top-navigation-${item.key}`, {
            value: item.value,
          })}
          {!!item.counter && (
            <>
              {active ? (
                <SIndicatorCountainer>
                  <Indicator counter={item.counter} />
                </SIndicatorCountainer>
              ) : (
                <span>
                  {' ('}
                  <CountUp
                    useEasing
                    end={bigCounter ? 99 : item.counter ?? 0}
                    duration={5}
                  />
                  {bigCounter ? '+' : ''}
                  )
                </span>
              )}
            </>
          )}
        </SNavItem>
      </a>
    </Link>
  );
};

export default NavigationItem;

interface ISNavItem {
  active: boolean;
}

const SNavItem = styled(Text)<ISNavItem>`
  color: ${(props) => props.theme.colorsThemed[props.active ? 'topNavigationActive' : 'topNavigation']};
  position: relative;
`;

const SIndicatorCountainer = styled.div`
  top: -23px;
  right: -12px;
  position: absolute;
`;
