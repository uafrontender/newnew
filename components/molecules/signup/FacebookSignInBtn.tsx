import React from 'react';
import { useTheme } from 'styled-components';

import SignInButton from './SignInButton';
import FacebookIcon from '../../../public/images/svg/auth/icon-facebook.svg';
import FacebookIconLight from '../../../public/images/svg/auth/icon-facebook-light.svg';

const FacebookSignInButton = ({ label }: {label: string}) => {
  const theme = useTheme();

  return (
    <SignInButton
      svg={theme.name === 'dark' ? FacebookIcon : FacebookIconLight}
      hoverSvg={FacebookIconLight}
      hoverBgColor={theme.colorsThemed.social.facebook.hover}
      pressedBgColor={theme.colorsThemed.social.facebook.pressed}
      onClick={() => {}}
    >
      <a href="">
        { label }
      </a>
    </SignInButton>
  );
};

export default FacebookSignInButton;
