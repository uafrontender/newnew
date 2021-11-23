import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
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

  return (
    <Link href={item.url}>
      <a>
        <SNavItem variant={3} active={active} weight={600}>
          {t(`mobile-top-navigation-${item.key}`, {
            value: item.value,
          })}
          {!!item.counter && (
            <SIndicatorCountainer>
              <Indicator counter={item.counter} />
            </SIndicatorCountainer>
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
  color: ${(props) => props.theme.colorsThemed.text[props.active ? 'primary' : 'tertiary']};
  position: relative;
  transition: color ease 0.5s;

  &:hover {
    color: ${(props) => props.theme.colorsThemed.text.primary};
  }
`;

const SIndicatorCountainer = styled.div`
  top: -14px;
  right: -8px;
  position: absolute;
`;
