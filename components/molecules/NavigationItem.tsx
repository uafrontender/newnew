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
          <div className="navText">
            {t(`mobile-top-navigation-${item.key}`, {
              value: item.value,
            })}
          </div>
          {!!item.counter && (
            <SIndicatorContainer bigCounter={item.counter > 9}>
              <Indicator counter={item.counter} />
            </SIndicatorContainer>
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
  display: flex;
  padding: 12px;
  align-items: center;
  flex-direction: row;
  
  &:hover {
    .navText {
      opacity: 1;
    }
  }
  
  .navText {
    color: ${(props) => props.theme.colorsThemed.text.primary};
    opacity: 0.5;
    transition: opacity ease 0.5s;
  }

  ${(props) => props.theme.media.tablet} {
    padding: 12px 6px;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 12px;
  }
`;

interface ISIndicatorContainer {
  bigCounter: boolean;
}

const SIndicatorContainer = styled.div<ISIndicatorContainer>`
  margin-left: ${(props) => (props.bigCounter ? '6px' : '10px')};
`;
