/* eslint-disable no-nested-ternary */
import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';

import InlineSVG from '../../atoms/InlineSVG';
import dashboardFilledIcon from '../../../public/images/svg/icons/filled/Dashboard.svg';
import dashboardOutlinedIcon from '../../../public/images/svg/icons/outlined/Dashboard.svg';
import walletFilledIcon from '../../../public/images/svg/icons/filled/Wallet.svg';
import walletOutlinedIcon from '../../../public/images/svg/icons/outlined/Wallet.svg';
import bundlesFilledIcon from '../../../public/images/svg/icons/filled/Bundles.svg';
import bundlesOutlinedIcon from '../../../public/images/svg/icons/outlined/Bundles.svg';
import Button from '../../atoms/Button';
import { useAppSelector } from '../../../redux-store/store';

interface NavigationItem {
  id?: string;
  url: string;
  label: string;
  iconFilled: any;
  iconOutlined: any;
}

export const Navigation = () => {
  const theme = useTheme();
  const { t } = useTranslation('page-Creator');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const collection: NavigationItem[] = useMemo(
    () => [
      {
        url: '/creator/dashboard',
        label: t('navigation.dashboard'),
        iconFilled: dashboardFilledIcon,
        iconOutlined: dashboardOutlinedIcon,
      },
      {
        id: 'bundles-navigation',
        url: '/creator/bundles',
        label: t('navigation.bundles'),
        iconFilled: bundlesFilledIcon,
        iconOutlined: bundlesOutlinedIcon,
      },
      ...(!user.userData?.options?.isWhiteListed
        ? [
            {
              url: '/creator/get-paid',
              label:
                user.creatorData?.options?.isCreatorConnectedToStripe === true
                  ? t('navigation.getPaidEdit')
                  : t('navigation.getPaid'),
              iconFilled: walletFilledIcon,
              iconOutlined: walletOutlinedIcon,
            },
          ]
        : []),
    ],
    [
      t,
      user.creatorData?.options?.isCreatorConnectedToStripe,
      user.userData?.options?.isWhiteListed,
    ]
  );

  const renderItem = useCallback(
    (item: NavigationItem) => {
      const active = router.route.includes(item.url);
      return (
        <Link key={item.url} href={item.url}>
          <SItem id={item.id} active={active}>
            <SInlineSVG
              svg={active ? item.iconFilled : item.iconOutlined}
              fill={
                active
                  ? theme.colorsThemed.accent.blue
                  : theme.colorsThemed.text.tertiary
              }
              width='24px'
              height='24px'
            />
            <SLabel>{item.label}</SLabel>
          </SItem>
        </Link>
      );
    },
    [
      router.route,
      theme.colorsThemed.accent.blue,
      theme.colorsThemed.text.tertiary,
    ]
  );

  return (
    <SContainer>
      {collection.map(renderItem)}
      <Link href='/creation'>
        <a>
          <Button>{t('navigation.newPost')}</Button>
        </a>
      </Link>
    </SContainer>
  );
};

export default Navigation;

const SContainer = styled.aside`
  top: 32px;
  left: 0;
  float: left;
  width: 156px;
  position: sticky;
  margin-right: 24px;

  ${(props) => props.theme.media.laptop} {
    top: 40px;
    width: 200px;
    margin-right: unset;
  }
`;

interface ISItem {
  active: boolean;
}

const SItem = styled.a<ISItem>`
  cursor: ${(props) => (props.active ? 'not-allowed' : 'pointer')};
  display: flex;
  transition: all ease 0.5s;
  align-items: center;
  margin-bottom: 24px;
  flex-direction: row;

  svg {
    fill: ${(props) =>
      props.active
        ? props.theme.colorsThemed.accent.blue
        : props.theme.colorsThemed.text.tertiary};

    cursor: ${(props) => (props.active ? 'not-allowed' : 'pointer')};
  }

  label {
    color: ${(props) =>
      props.active
        ? props.theme.colorsThemed.text.primary
        : props.theme.colorsThemed.text.secondary};
    cursor: ${(props) => (props.active ? 'not-allowed' : 'pointer')};
  }

  ${(props) =>
    !props.active &&
    css`
      &:hover {
        svg {
          fill: ${props.theme.colorsThemed.text.primary};
        }

        label {
          color: ${props.theme.colorsThemed.text.primary};
        }
      }
    `}
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
  margin-right: 12px;
`;

const SLabel = styled.label`
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
`;
