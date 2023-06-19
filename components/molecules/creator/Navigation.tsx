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
import myPostsOutlinedIcon from '../../../public/images/svg/icons/outlined/MyPosts.svg';
import myPostsFilledIcon from '../../../public/images/svg/icons/filled/MyPosts.svg';
import Button from '../../atoms/Button';
import { useUserData } from '../../../contexts/userDataContext';
import { Mixpanel } from '../../../utils/mixpanel';

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
  const { userData, creatorData } = useUserData();

  const collection: NavigationItem[] = useMemo(
    () => [
      {
        url: '/creator/dashboard',
        label: t('navigation.dashboard'),
        iconFilled: dashboardFilledIcon,
        iconOutlined: dashboardOutlinedIcon,
      },
      {
        url: '/profile/my-posts',
        label: t('navigation.myPosts'),
        iconFilled: myPostsFilledIcon,
        iconOutlined: myPostsOutlinedIcon,
      },
      {
        id: 'bundles-navigation',
        url: '/creator/bundles',
        label: t('navigation.bundles'),
        iconFilled: bundlesFilledIcon,
        iconOutlined: bundlesOutlinedIcon,
      },
      ...(!userData?.options?.isWhiteListed
        ? [
            {
              url: '/creator/get-paid',
              label:
                creatorData?.isCreatorConnectedToStripe === true
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
      creatorData?.isCreatorConnectedToStripe,
      userData?.options?.isWhiteListed,
    ]
  );

  const renderItem = useCallback(
    (item: NavigationItem) => {
      const active = router.route.includes(item.url);
      const routerQuery = router.query;

      const queryParams =
        (item.url === '/creator/dashboard' ||
          item.url === '/creator/bundles') &&
        routerQuery.tab
          ? {
              tab: routerQuery.tab,
              ...(routerQuery.tab === 'direct-messages'
                ? { roomID: routerQuery.roomID }
                : {}),
            }
          : null;

      return (
        <Link
          key={`${item.url}`}
          href={{
            pathname: item.url,
            query: queryParams,
          }}
        >
          <SItem
            id={item.id}
            active={active}
            onClickCapture={() => {
              Mixpanel.track('Navigation Item Clicked', {
                _stage: 'Dashboard',
                _component: 'Navigation',
                _target: item.url,
              });
            }}
          >
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
      router.query,
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
          <Button
            onClickCapture={() => {
              Mixpanel.track('Navigation Item Clicked', {
                _button: 'Make a decision',
                _stage: 'Dashboard',
                _component: 'Navigation',
                _target: '/creation',
              });
            }}
          >
            {t('navigation.newPost')}
          </Button>
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
