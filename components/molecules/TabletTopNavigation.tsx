import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Button from '../atoms/Button';
import InlineSVG from '../atoms/InlineSVG';

import { useAppSelector } from '../../redux-store/store';

import menuIcon from '../../public/images/svg/tablet-top-navigation-menu.svg';
import userIcon from '../../public/images/svg/mobile-top-navigation-person.svg';
import tabletLogo from '../../public/images/svg/tablet-logo.svg';
import searchIcon from '../../public/images/svg/mobile-top-navigation-search.svg';

interface ITabletTopNavigation {
}

export const TabletTopNavigation: React.FC<ITabletTopNavigation> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const handleSearchClick = () => {
    router.push('/sign-in');
  };
  const handleUserClick = () => {
    router.push('/sign-in');
  };
  const handleMenuClick = () => {
    router.push('/sign-in');
  };
  const handleNewPostClick = () => {
    router.push('/sign-in');
  };
  const handleCreateClick = () => {
    router.push('/sign-in');
  };
  const handleSignInClick = () => {
    router.push('/sign-in');
  };
  const handleSignUpClick = () => {
    router.push('/sign-up');
  };

  return (
    <SContainer>
      <Link href="/">
        <a>
          <InlineSVG
            svg={tabletLogo}
            fill={theme.colorsThemed.appLogoMobile}
            width="152px"
            height="32px"
          />
        </a>
      </Link>
      <SRightBlock>
        {user.loggedIn && (
          <>
            <Link href="/notifications" passHref>
              <NavItem>
                {t('navigation-notifications')}
              </NavItem>
            </Link>
            <Link href="/direct-messages" passHref>
              <NavItem>
                {t('navigation-dm')}
              </NavItem>
            </Link>
            {user.role === 'creator' ? (
              <Link href="/share" passHref>
                <NavItem>
                  {t('navigation-share')}
                </NavItem>
              </Link>
            ) : (
              <Link href="/my-balance" passHref>
                <NavItem>
                  {t('navigation-my-balance')}
                  <br />
                  $120
                </NavItem>
              </Link>
            )}
          </>
        )}
        <InlineSVG
          clickable
          svg={searchIcon}
          fill={theme.colorsThemed.mobileNavigationActive}
          width="24px"
          height="24px"
          onClick={handleSearchClick}
        />
        {user.loggedIn ? (
          <>
            {user.role === 'creator' ? (
              <>
                <Button
                  filled
                  title={t('button-new-post')}
                  onClick={handleNewPostClick}
                />
                <InlineSVG
                  clickable
                  svg={menuIcon}
                  fill={theme.colorsThemed.mobileNavigationActive}
                  width="32px"
                  height="32px"
                  onClick={handleMenuClick}
                />
              </>
            ) : (
              <>
                <Button
                  filled
                  title={t('button-create')}
                  onClick={handleCreateClick}
                />
                <InlineSVG
                  clickable
                  svg={userIcon}
                  fill={theme.colorsThemed.mobileNavigationActive}
                  width="32px"
                  height="32px"
                  onClick={handleUserClick}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Button
              outline
              title={t('button-login-in')}
              onClick={handleSignInClick}
            />
            <Button
              filled
              title={t('button-sign-up')}
              onClick={handleSignUpClick}
            />
          </>
        )}
      </SRightBlock>
    </SContainer>
  );
};

export default TabletTopNavigation;

const SContainer = styled.nav`
  display: flex;
  padding: 12px 32px;
  align-items: center;
  justify-content: space-between;
`;

const SRightBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  a,
  div,
  button {
    margin-left: 24px;
  }
`;

const NavItem = styled.a`
  font-size: 14px;
  text-align: end;
  line-height: 18px;
  text-decoration: none;
`;
