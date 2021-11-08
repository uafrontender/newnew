import React from 'react';
import AppleSignin from 'react-apple-signin-auth';
import { useTheme } from 'styled-components';

import SignInButton from './SignInButton';
import AppleIcon from '../../../public/images/svg/auth/icon-apple.svg';

// NB! Just a scaffold for now
const AppleSignInButton = ({ label }: {label: string}) => {
  const theme = useTheme();

  return (
    <AppleSignin
      /** Auth options passed to AppleID.auth.init() */
      authOptions={{
        /** Client ID - eg: 'com.example.com' */
        clientId: 'com.example.web',
        /** Requested scopes, seperated by spaces - eg: 'email name' */
        scope: 'email name',
        /** Apple's redirectURI - must be one of the URIs you added to the serviceID -
         * the undocumented trick in apple docs is that you should call auth from a page
         * that is listed as a redirectURI, localhost fails */
        redirectURI: 'https://example.com',
        /** State string that is returned with the apple response */
        state: 'state',
        /** Nonce */
        nonce: 'nonce',
        /** Uses popup auth instead of redirection */
        usePopup: true,
      }} // REQUIRED
      /** General props */
      uiType="dark"
      /** className */
      className="apple-auth-btn"
      /** Removes default style tag */
      noDefaultStyle={false}
      /** Allows to change the button's children, eg: for changing the button text */
      buttonExtraChildren="Continue with Apple"
      /** Extra controlling props */
      /** Called upon signin success in case authOptions.usePopup = true
       * -- which means auth is handled client side */
      onSuccess={(response: any) => console.log(response)} // default = undefined
      /** Called upon signin error */
      onError={(error: any) => console.error(error)} // default = undefined
      /** Skips loading the apple script if true */
      skipScript={false} // default = undefined
      /** Apple image props */
      iconProp={{ style: { marginTop: '10px' } }} // default = undefined
      /** render function - called with all props - can be used to fully
       * customize the UI by rendering your own component  */
      render={(props: React.PropsWithoutRef<'button'>) => (
        <SignInButton
          svg={AppleIcon}
          hoverBgColor="#000"
          hoverContentColor="#FFF"
          pressedBgColor={theme.colorsThemed.social.apple.pressed}
          {...props}
        >
          { label }
        </SignInButton>
      )}
    />
  );
};

export default AppleSignInButton;
