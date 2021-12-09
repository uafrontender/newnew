import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
} from '../apiConfigs';

export const BASE_URL_AUTH = `${BASE_URL}/auth`;

// Email sign up
/*
These functions will be called to sign up a user with an email, following this logic:
sendVerificationEmail(email) -> redirect to verification code page -> sendSignInRequest(email, code)
*/

/**
 * Called from the Sign up page.
 * If the request is successful, the input email is cached, and
 * user is redirected to Code Verification page.
*/
export const sendVerificationEmail = (
  payload: newnewapi.SendVerificationEmailRequest,
) => fetchProtobuf<newnewapi.SendVerificationEmailRequest, newnewapi.EmptyResponse>(
  newnewapi.SendVerificationEmailRequest,
  newnewapi.EmptyResponse,
  `${BASE_URL_AUTH}/send_verification_email`,
  'post',
  payload,
);

/**
 * Called from the Code Verification page.
 * The arguments are the cached email address and the code
 * manually input by the user.
*/
export const signInWithEmail = (
  payload: newnewapi.EmailSignInRequest,
) => fetchProtobuf<newnewapi.EmailSignInRequest, newnewapi.SignInResponse>(
  newnewapi.EmailSignInRequest,
  newnewapi.SignInResponse,
  `${BASE_URL_AUTH}/sign_in_with_email`,
  'post',
  payload,
);

// One-click sign up
/*
These functions are likely to be called client-side or in the on-page
`getServerSideProps` function after the redirect from the corresponding
providers (Apple, Facebook, etc.)
*/

export const signInWithApple = (
  payload: newnewapi.AppleSignInRequest,
) => fetchProtobuf<newnewapi.AppleSignInRequest, newnewapi.SignInResponse>(
  newnewapi.AppleSignInRequest,
  newnewapi.SignInResponse,
  `${BASE_URL_AUTH}/sign_in_with_apple`,
  'post',
  payload,
);

export const signInWithGoogle = (
  payload: newnewapi.GoogleSignInRequest,
) => fetchProtobuf<newnewapi.GoogleSignInRequest, newnewapi.SignInResponse>(
  newnewapi.GoogleSignInRequest,
  newnewapi.SignInResponse,
  `${BASE_URL_AUTH}/sign_in_with_google`,
  'post',
  payload,
);

export const signInWithFacebook = (
  payload: newnewapi.FacebookSignInRequest,
) => fetchProtobuf<newnewapi.FacebookSignInRequest, newnewapi.SignInResponse>(
  newnewapi.FacebookSignInRequest,
  newnewapi.SignInResponse,
  `${BASE_URL_AUTH}/sign_in_with_facebook`,
  'post',
  payload,
);

export const signInWithTwitter = (
  payload: newnewapi.TwitterSignInRequest,
) => fetchProtobuf<newnewapi.TwitterSignInRequest, newnewapi.SignInResponse>(
  newnewapi.TwitterSignInRequest,
  newnewapi.SignInResponse,
  `${BASE_URL_AUTH}/sign_in_with_twitter`,
  'post',
  payload,
);
