import React from 'react';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';

import InlineSVG from '../atoms/InlineSVG';

import userIcon from '../../public/images/svg/mobile-top-navigation-person.svg';
import searchIcon from '../../public/images/svg/mobile-top-navigation-search.svg';
import mobileLogo from '../../public/images/svg/mobile-logo.svg';

interface IMobileTopNavigation {
}

export const MobileTopNavigation: React.FC<IMobileTopNavigation> = () => {
  const theme = useTheme();

  const handleSearchClick = () => {
  };

  return (
    <SContainer>
      <Link href="/">
        <a>
          <InlineSVG
            svg={mobileLogo}
            fill={theme.colorsThemed.appLogoMobile}
            width="35px"
            height="24px"
          />
        </a>
      </Link>
      <SRightBlock>
        <InlineSVG
          clickable
          svg={searchIcon}
          fill={theme.colorsThemed.mobileNavigationActive}
          width="24px"
          height="24px"
          onClick={handleSearchClick}
        />
        <Link href="/sign-in">
          <a>
            <InlineSVG
              svg={userIcon}
              fill={theme.colorsThemed.mobileNavigationActive}
              width="24px"
              height="24px"
            />
          </a>
        </Link>
      </SRightBlock>
    </SContainer>
  );
};

export default MobileTopNavigation;

const SContainer = styled.nav`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SRightBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  div {
    margin-left: 24px;
  }
`;
