import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';

import InlineSVG from '../../atoms/InlineSVG';
import dashboardFilledIcon from '../../../public/images/svg/icons/filled/Dashboard.svg';
import dashboardOutlinedIcon from '../../../public/images/svg/icons/outlined/Dashboard.svg';
import subscriptionsFilledIcon from '../../../public/images/svg/icons/filled/Subscriptions.svg';
import subscriptionsOutlinedIcon from '../../../public/images/svg/icons/outlined/Subscriptions.svg';
import walletFilledIcon from '../../../public/images/svg/icons/filled/Wallet.svg';
import walletOutlinedIcon from '../../../public/images/svg/icons/outlined/Wallet.svg';
import Button from '../../atoms/Button';
import { useAppSelector } from '../../../redux-store/store';

export const Navigation = () => {
  const theme = useTheme();
  const { t } = useTranslation('creator');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const collection = useMemo(
    () => [
      {
        url: '/creator/dashboard',
        label: t('navigation.dashboard'),
        iconFilled: dashboardFilledIcon,
        iconOutlined: dashboardOutlinedIcon,
      },
      {
        url: '/creator/subscribers',
        label: t('navigation.subscriptions'),
        iconFilled: subscriptionsFilledIcon,
        iconOutlined: subscriptionsOutlinedIcon,
      },
      {
        url: '/creator/get-paid',
        label:
          user.creatorData?.options?.isCreatorConnectedToStripe === true
            ? t('navigation.getPaidEdit')
            : t('navigation.getPaid'),
        iconFilled: walletFilledIcon,
        iconOutlined: walletOutlinedIcon,
      },
    ],
    [t, user.creatorData]
  );

  const renderItem = useCallback(
    (item) => {
      const active = router.route.includes(item.url);
      return (
        <Link href={item.url} key={item.url}>
          <a>
            <SItem active={active}>
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
          </a>
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
          <Button>{t('navigation.new-post')}</Button>
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
