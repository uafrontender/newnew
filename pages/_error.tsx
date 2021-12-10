/* eslint-disable no-nested-ternary */
import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { useAppDispatch } from '../redux-store/store';
import { logoutUserClearCookiesAndRedirect } from '../redux-store/slices/userStateSlice';

interface IErrorPage {
  statusCode: number;
  errorMsg: string;
}

const Error: NextPage<IErrorPage> = ({
  statusCode,
  errorMsg,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // User was probably not authenticated in the first place
    // Redirect to homepage
    if (errorMsg === 'No token') {
      dispatch(logoutUserClearCookiesAndRedirect());
    }
    // Refresh token was present, session probably expired
    // Redirect to sign up page
    if (errorMsg === 'Refresh token invalid') {
      dispatch(logoutUserClearCookiesAndRedirect('sign-up?reason=session_expired'));
    }
  }, [errorMsg, dispatch]);

  return (
    // Temp
    <>
      <p>
        { statusCode }
      </p>
      <p>
        An error occurred.
      </p>
    </>
  );
};

export default Error;
