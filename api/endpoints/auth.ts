import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

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
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.SendVerificationEmailRequest,
    newnewapi.SendVerificationEmailResponse
  >(
    newnewapi.SendVerificationEmailRequest,
    newnewapi.SendVerificationEmailResponse,
    `${BASE_URL_AUTH}/send_verification_email`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

/**
 * Called from the Code Verification page.
 * The arguments are the cached email address and the code
 * manually input by the user.
 */
export const signInWithEmail = (
  payload: newnewapi.EmailSignInRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmailSignInRequest, newnewapi.SignInResponse>(
    newnewapi.EmailSignInRequest,
    newnewapi.SignInResponse,
    `${BASE_URL_AUTH}/sign_in_with_email`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

// One-click sign up
/*
These functions are likely to be called client-side or in the on-page
`getServerSideProps` function after the redirect from the corresponding
providers (Apple, Facebook, etc.)
*/

export const signInWithApple = (
  payload: newnewapi.AppleSignInRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.AppleSignInRequest, newnewapi.SignInResponse>(
    newnewapi.AppleSignInRequest,
    newnewapi.SignInResponse,
    `${BASE_URL_AUTH}/sign_in_with_apple`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const signInWithGoogle = (
  payload: newnewapi.GoogleSignInRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GoogleSignInRequest, newnewapi.SignInResponse>(
    newnewapi.GoogleSignInRequest,
    newnewapi.SignInResponse,
    `${BASE_URL_AUTH}/sign_in_with_google`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const signInWithFacebook = (
  payload: newnewapi.FacebookSignInRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.FacebookSignInRequest, newnewapi.SignInResponse>(
    newnewapi.FacebookSignInRequest,
    newnewapi.SignInResponse,
    `${BASE_URL_AUTH}/sign_in_with_facebook`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );

export const signInWithTwitter = (
  payload: newnewapi.TwitterSignInRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.TwitterSignInRequest, newnewapi.SignInResponse>(
    newnewapi.TwitterSignInRequest,
    newnewapi.SignInResponse,
    `${BASE_URL_AUTH}/sign_in_with_twitter`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined
  );
