/* eslint-disable no-async-promise-executor */
// Configuration & helper functions file for the RESTful API endpoints
import { newnewapi } from 'newnew-api';
import * as $protobuf from 'protobufjs';
import { Cookies } from 'react-cookie';
import jwtDecode from 'jwt-decode';

import isBrowser from '../utils/isBrowser';

const logsOn = process.env.NEXT_PUBLIC_PROTOBUF_LOGS === 'true';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Initialize global Cookies instance available throughout the whole app
export const cookiesInstance = new Cookies();

// eslint-disable-next-line import/no-mutable-exports
export let fetchInitialized = false;
let fetchInitializationTriggered = false;

// eslint-disable-next-line no-async-promise-executor
const customFetch = async (...args: any): Promise<any> =>
  new Promise(async (resolve) => {
    const [resource, config] = args;

    // request interceptor starts
    if (!fetchInitialized) {
      if (!fetchInitializationTriggered) {
        try {
          fetchInitializationTriggered = true;
          await fetch(process.env.NEXT_PUBLIC_SOCKET_URL!!);
        } catch (err) {
          console.error(err);
        } finally {
          // set global state
          fetchInitialized = true;
        }
      }

      setTimeout(() => {
        resolve(customFetch(...args));
      }, 500);
    } else {
      try {
        resolve(await fetch(resource, config));
      } catch (err) {
        console.error(err);
      }
    }
  });

/**
 * Universal interface for RESTful API responses
 */
export interface APIResponse<T> {
  data?: T;
  error?: Error;
}

type NewnewapiType = typeof newnewapi;

/**
 * All the protobufjs-generated class **instances** conform to this interface.
 */
interface JsonConvertible {
  toJSON(): { [k: string]: any };
}

/**
 * All the protobufjs-generated class **objects** conform to this interface.
 */
interface EncDec<T = keyof NewnewapiType> {
  name: string;
  encode(message: T, writer?: $protobuf.Writer): $protobuf.Writer;
  decode(
    reader: $protobuf.Reader | Uint8Array,
    length?: number
  ): T & JsonConvertible;
  fromObject(object: { [k: string]: any }): T & JsonConvertible;
}

/**
 * Handles checking if the response is ok and if it is a protobuf message,
 * returns an Array Buffer that can be decoded in the outer function.
 * @param response browser Fetch API response
 */
const handleProtobufResponse = (response: Response): Promise<ArrayBuffer> => {
  const clonedResponseObj = response.clone();
  const contentType = response.headers.get('content-type');

  return new Promise((resolve, reject) => {
    if (
      response.ok &&
      contentType &&
      contentType.indexOf('application/x-protobuf') !== -1
    ) {
      resolve(response.arrayBuffer());
    }
    if (response.status === 452) {
      reject(new Error('Processing limit reached'));
    }
    if (response.status >= 401 && response.status < 404) {
      reject(new Error('Access token invalid'));
    }

    // Try to extract actual error message
    clonedResponseObj
      .text()
      .then((text) => {
        reject(new Error(text || 'An error occurred'));
      })
      .catch(() => {
        reject(new Error('An error occurred'));
      });
  });
};

/**
 * This function is a typed wrapper around the browser `fetch` method,
 * aimed at sending and receiving protobuf messages, defined in `newnew-api`.
 * Not for standalone use, its purpose is to construct functions for concrete
 * endpoints in the `/endpoints` folder.
 * @template RequestType request type defined in `newnew-api`
 * @template ResponseType response type defined in `newnew-api`
 * @param reqT the request protobuf message
 * @param resT the response protobuf message
 * @param url resource string, necessary query params are also set here
 * @param method HTTP method
 * @param payload payload to be sent to the API
 * @param headers additional headers, should be initialized with `new Headers()`
 * @param mode cors mode
 * @param credentials a string indicating whether credentials will be sent with the request
 */
export async function fetchProtobuf<
  RequestType = keyof NewnewapiType,
  ResponseType = keyof NewnewapiType
>(
  reqT: EncDec<RequestType>,
  resT: EncDec<ResponseType>,
  url: string,
  method: Request['method'],
  payload?: RequestType,
  headers: any = {},
  mode: Request['mode'] = 'cors',
  credentials: Request['credentials'] = 'same-origin',
  signal: RequestInit['signal'] = undefined
): Promise<APIResponse<ResponseType>> {
  const encoded = payload ? reqT.encode(payload).finish() : undefined;

  // Dedicated lane for VIP users
  const accessToken = cookiesInstance.get('accessToken');
  let decodedToken: {
    dedicated_lane: string | undefined;
  } = {
    dedicated_lane: undefined,
  };

  if (accessToken) {
    decodedToken = jwtDecode(accessToken);
  }

  try {
    const buff: ArrayBuffer = await customFetch(url, {
      method,
      headers: {
        'Content-type': 'application/x-protobuf',
        ...(!isBrowser() || process.env.NEXT_PUBLIC_ENVIRONMENT === 'test'
          ? {
              // TODO: Should it come from env var and be a secret?
              'x-from': 'web',
            }
          : {}),
        ...(decodedToken?.dedicated_lane
          ? {
              'x-dedicated-lane': decodedToken.dedicated_lane,
            }
          : {}),
        ...headers,
      },
      mode,
      // credentials,
      credentials: 'include',
      ...(encoded ? { body: encoded } : {}),
      ...(signal ? { signal } : {}),
    })
      .then((response) => handleProtobufResponse(response))
      .catch((err) => {
        throw err;
      });

    const data = resT.decode(new Uint8Array(buff));

    if (logsOn) {
      console.groupCollapsed(`Success: ${reqT?.name} -> ${resT?.name}`);
      console.debug(
        `
      %c Payload Type: %c ${reqT?.name}
      %c Payload: %c ${JSON.stringify(payload, null, 2)}
      `,
        'font-size: 14px; color: blue;',
        'font-size: 12px; color: black;',
        'font-size: 14px; color: blue;',
        'font-size: 12px; color: black;'
      );
      console.debug(
        `
      %c Response Type: %c ${resT?.name}
      %c Response: %c ${JSON.stringify(data, null, 2)}
      `,
        'font-size: 14px; color: blue;',
        'font-size: 12px; color: black;',
        'font-size: 14px; color: blue;',
        'font-size: 12px; color: black;'
      );
      console.groupEnd();
    }

    return {
      data,
    };
  } catch (err) {
    if (logsOn) {
      console.groupCollapsed(`Error: ${reqT?.name} -> ${resT?.name}`);
      console.debug(
        `
      %c Payload Type: %c ${reqT?.name}
      %c Payload: %c ${JSON.stringify(payload, null, 2)}
      `,
        'font-size: 14px; color: blue;',
        'font-size: 12px; color: black;',
        'font-size: 14px; color: blue;',
        'font-size: 12px; color: black;'
      );
      console.debug(
        `
      %c Response Type: %c ${resT?.name}
      %c Error: %c ${err}
      `,
        'font-size: 14px; color: blue;',
        'font-size: 12px; color: black;',
        'font-size: 14px; color: red;',
        'font-size: 12px; color: black;'
      );
      console.groupEnd();
    }

    return {
      error: err as Error,
    };
  }
}

// Tries to refresh credentials if access token has expired
export const refreshCredentials = (
  payload: newnewapi.RefreshCredentialRequest
) =>
  fetchProtobuf<
    newnewapi.RefreshCredentialRequest,
    newnewapi.RefreshCredentialResponse
  >(
    newnewapi.RefreshCredentialRequest,
    newnewapi.RefreshCredentialResponse,
    `${BASE_URL}/auth/refresh_credential`,
    'post',
    payload
  );

export type TTokenCookie = {
  name: string;
  value: string;
  expires?: string;
  maxAge?: string;
};

/**
 * This function is wrapper around `fetchProtobuf` function,
 * but is aimed at the requests to protected routes. It can
 * a) Try to get credential tokens from react-cookie instance
 * b) Use the credentials tokens passed to it, if the request
 * happens server-side, it will then update cookies using callback
 * @template RequestType request type defined in `newnew-api`
 * @template ResponseType response type defined in `newnew-api`
 * @param reqT the request protobuf message
 * @param resT the response protobuf message
 * @param url resource string, necessary query params are also set here
 * @param method HTTP method
 * @param payload payload to be sent to the API
 * @param serverSideTokens access and refresh tokens, when used server-side
 * @param updateCookieServerSideCallback used to update cookies server-side
 */
export async function fetchProtobufProtectedIntercepted<
  RequestType = keyof NewnewapiType,
  ResponseType = keyof NewnewapiType
>(
  reqT: EncDec<RequestType>,
  resT: EncDec<ResponseType>,
  url: string,
  method: Request['method'],
  payload?: RequestType,
  signal?: RequestInit['signal'],
  serverSideTokens?: {
    accessToken: string;
    refreshToken: string;
  },
  updateCookieServerSideCallback?: (tokensToAdd: TTokenCookie[]) => void
): Promise<APIResponse<ResponseType>> {
  // Declare response
  let res: APIResponse<ResponseType>;
  // Try to get tokens - from react-cookie instance or from passed params
  const accessToken =
    serverSideTokens?.accessToken ?? cookiesInstance.get('accessToken');
  const refreshToken =
    serverSideTokens?.refreshToken ?? cookiesInstance.get('refreshToken');

  try {
    if (!accessToken && !refreshToken) {
      throw new Error('No token');
    }
    if (!accessToken && refreshToken) {
      throw new Error('Access token invalid');
    }

    // Try to make request if access and refresh tokens are present
    res = await fetchProtobuf<RequestType, ResponseType>(
      reqT,
      resT,
      url,
      method,
      payload,
      {
        'x-auth-token': accessToken,
      },
      'cors',
      'same-origin',
      signal ?? undefined
    );

    // Throw an error if the access token was invalid
    if (!res?.data && res.error?.message === 'Access token invalid') {
      throw new Error(res?.error?.message);
    }

    return res;
  } catch (errFirstAttempt) {
    // Invalid access token, refresh and try again
    if ((errFirstAttempt as Error).message === 'Access token invalid') {
      try {
        const refreshPayload = new newnewapi.RefreshCredentialRequest({
          refreshToken,
        });
        // TODO: Call once, block if already called by other request failing
        const resRefresh = await refreshCredentials(refreshPayload);

        // Refresh failed, session "expired"
        // (i.e. user probably logged in from another device, or exceeded
        // max number of logged in devices/browsers)
        if (!resRefresh?.data || resRefresh.error) {
          throw new Error('Refresh token invalid');
        }

        // Refreshed succeeded, re-set access and refresh tokens
        // Client side
        if (!serverSideTokens) {
          if (resRefresh.data.credential?.expiresAt?.seconds) {
            cookiesInstance.set(
              'accessToken',
              resRefresh.data.credential?.accessToken,
              {
                expires: new Date(
                  (resRefresh.data.credential.expiresAt.seconds as number) *
                    1000
                ),
                path: '/',
              }
            );
          }
          cookiesInstance.set(
            'refreshToken',
            resRefresh.data.credential?.refreshToken,
            {
              // Expire in 10 years
              maxAge: 10 * 365 * 24 * 60 * 60,
              path: '/',
            }
          );
        } else if (resRefresh.data.credential?.expiresAt?.seconds) {
          // Server-side
          updateCookieServerSideCallback?.([
            {
              name: 'accessToken',
              value: resRefresh.data.credential?.accessToken!!,
              expires: new Date(
                (resRefresh.data.credential.expiresAt.seconds as number) * 1000
              ).toUTCString(),
            },
            {
              name: 'refreshToken',
              value: resRefresh.data.credential?.refreshToken!!,
              maxAge: (10 * 365 * 24 * 60 * 60).toString(),
            },
          ]);
        }
        // Try request again with new credentials
        res = await fetchProtobuf<RequestType, ResponseType>(
          reqT,
          resT,
          url,
          method,
          payload,
          {
            'x-auth-token': resRefresh.data.credential?.accessToken,
          }
        );
        return res;
      } catch (errSecondAttempt) {
        cookiesInstance.remove('accessToken', {
          path: '/',
        });
        cookiesInstance.remove('refreshToken', {
          path: '/',
        });

        // If error is auth-related - throw
        if ((errSecondAttempt as Error).message === 'Refresh token invalid') {
          throw new Error((errSecondAttempt as Error).message);
        }
        // Return as APIResponse.error
        return {
          error: errSecondAttempt as Error,
        };
      }
    }

    // If error is auth-related - throw
    if ((errFirstAttempt as Error).message === 'No token') {
      cookiesInstance.remove('accessToken', {
        path: '/',
      });
      cookiesInstance.remove('refreshToken', {
        path: '/',
      });
      throw new Error((errFirstAttempt as Error).message);
    }

    // Return as APIResponse.error
    return {
      error: errFirstAttempt as Error,
    };
  }
}
