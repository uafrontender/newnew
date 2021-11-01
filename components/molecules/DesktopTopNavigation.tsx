import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Button from '../atoms/Button';
import InlineSVG from '../atoms/InlineSVG';

import { useAppSelector } from '../../redux-store/store';

import tabletLogo from '../../public/images/svg/tablet-logo.svg';
import searchIcon from '../../public/images/svg/mobile-top-navigation-search.svg';
import userAvatarIcon from '../../public/images/default-user-avatar.png';

interface IDesktopTopNavigation {
}

export const DesktopTopNavigation: React.FC<IDesktopTopNavigation> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const handleNewPostClick = () => {
    router.push('/sign-in');
  };
  const handleDashboardClick = () => {
    router.push('/');
  };
  const handleSearchClick = () => {
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
                  : $120
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
                  outline
                  title={t('button-dashboard')}
                  onClick={handleDashboardClick}
                />
                <Button
                  filled
                  title={t('button-new-post')}
                  onClick={handleNewPostClick}
                />
                <Link href="/my-profile" passHref>
                  <AvatarContainer>
                    <Image
                      src={userAvatarIcon}
                      alt="User avatar"
                      width="32px"
                      height="32px"
                      objectFit="contain"
                    />
                    <AvatarTitle>
                      {t('navigation-profile')}
                    </AvatarTitle>
                  </AvatarContainer>
                </Link>
              </>
            ) : (
              <>
                <Button
                  filled
                  title={t('button-create-on-newnew')}
                  onClick={handleCreateClick}
                />
                <Link href="/my-profile" passHref>
                  <AvatarContainer>
                    <Image
                      src={userAvatarIcon}
                      alt="User avatar"
                      width="32px"
                      height="32px"
                      objectFit="contain"
                    />
                    <AvatarTitle>
                      {t('navigation-profile')}
                    </AvatarTitle>
                  </AvatarContainer>
                </Link>
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

export default DesktopTopNavigation;

const SContainer = styled.nav`
  display: flex;
  padding: 19px 96px;
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

const AvatarContainer = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const AvatarTitle = styled.p`
  font-size: 14px;
  line-height: 18px;
`;
