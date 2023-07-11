/* eslint-disable no-async-promise-executor */
// Configuration & helper functions file for the RESTful API endpoints
import { newnewapi } from 'newnew-api';
import * as $protobuf from 'protobufjs';
import { Cookies } from 'react-cookie';
import jwtDecode from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';

import isBrowser from '../utils/isBrowser';
import sleep from '../utils/sleep';

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
 * Log request
 */
const logRequest = <
  RequestType = keyof NewnewapiType,
  ResponseType = keyof NewnewapiType
>(
  reqT: EncDec<RequestType>,
  resT: EncDec<ResponseType>,
  payload: RequestType | undefined,
  data: ResponseType & JsonConvertible
) => {
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
};

/**
 * Log request error
 */
const logRequestError = <
  RequestType = keyof NewnewapiType,
  ResponseType = keyof NewnewapiType
>(
  reqT: EncDec<RequestType>,
  resT: EncDec<ResponseType>,
  payload: RequestType | undefined,
  err: unknown
) => {
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
};

interface IFetchProtobufInner<
  RequestType = keyof NewnewapiType,
  ResponseType = keyof NewnewapiType
> {
  reqT: EncDec<RequestType>;
  resT: EncDec<ResponseType>;
  url: string;
  method?: Request['method'];
  payload?: RequestType;
  headers?: any;
  mode?: Request['mode'];
  credentials?: Request['credentials'];
  signal?: RequestInit['signal'];
}

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
async function _fetchProtobuf<
  RequestType = keyof NewnewapiType,
  ResponseType = keyof NewnewapiType
>({
  reqT,
  resT,
  url,
  method = 'post',
  payload,
  headers = {},
  mode = 'cors',
  credentials = 'same-origin',
  signal = undefined,
}: IFetchProtobufInner<RequestType, ResponseType>): Promise<
  APIResponse<ResponseType>
> {
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
        'x-request-uuid': uuidv4(),
        ...(!isBrowser() || process.env.NEXT_PUBLIC_ENVIRONMENT === 'test'
          ? {
              // TODO: should it come from env var and be a secret?
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
      logRequest(reqT, resT, payload, data);
    }

    return {
      data,
    };
  } catch (err) {
    if (logsOn) {
      logRequestError(reqT, resT, payload, err);
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
  _fetchProtobuf<
    newnewapi.RefreshCredentialRequest,
    newnewapi.RefreshCredentialResponse
  >({
    reqT: newnewapi.RefreshCredentialRequest,
    resT: newnewapi.RefreshCredentialResponse,
    url: `${BASE_URL}/auth/refresh_credential`,
    method: 'post',
    payload,
  });

// Store refreshing credential Promise in a variable global to this file
let refreshTokensPromise: Promise<
  APIResponse<newnewapi.RefreshCredentialResponse>
> | null = null;

const refreshTokens = async (payload: newnewapi.RefreshCredentialRequest) => {
  // If there is no running request, evoke it and return Promise
  if (refreshTokensPromise === null) {
    refreshTokensPromise = refreshCredentials(payload).then(
      (refreshCredentialsResponse) => {
        // Set running Promise to `null`, return response
        refreshTokensPromise = null;
        return refreshCredentialsResponse;
      }
    );
  }
  // If there is a running request, return the pending Promise
  return refreshTokensPromise;
};

export type TTokenCookie = {
  name: string;
  value: string;
  expires?: string;
  maxAge?: string;
};

interface IFetchProtobuf<
  RequestType = keyof NewnewapiType,
  ResponseType = keyof NewnewapiType
> {
  reqT: EncDec<RequestType>;
  resT: EncDec<ResponseType>;
  url: string;
  method?: Request['method'];
  payload?: RequestType;
  signal?: RequestInit['signal'];
  maxAttempts?: number;
  serverSideTokens?: {
    accessToken: string;
    refreshToken: string;
  };
  updateCookieServerSideCallback?: (tokensToAdd: TTokenCookie[]) => void;
}

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
export async function fetchProtobuf<
  RequestType = keyof NewnewapiType,
  ResponseType = keyof NewnewapiType
>({
  reqT,
  resT,
  url,
  method,
  payload,
  signal,
  maxAttempts,
  serverSideTokens,
  updateCookieServerSideCallback,
}: IFetchProtobuf<RequestType, ResponseType>): Promise<
  APIResponse<ResponseType>
> {
  // Declare response
  let res: APIResponse<ResponseType>;
  //
  let currentAttempts = 1;
  // Try to get tokens - from react-cookie instance or from passed params
  const accessToken =
    serverSideTokens?.accessToken || cookiesInstance.get('accessToken');
  const refreshToken =
    serverSideTokens?.refreshToken || cookiesInstance.get('refreshToken');

  try {
    res = await _fetchProtobuf<RequestType, ResponseType>({
      reqT,
      resT,
      url,
      method,
      payload,
      ...(accessToken
        ? {
            headers: {
              'x-auth-token': accessToken,
            },
          }
        : {}),
      ...(signal
        ? {
            signal,
          }
        : {}),
    });

    // Throw an error if the access token was invalid
    if (!res?.data && res.error?.message === 'Access token invalid') {
      throw new Error(res?.error?.message);
    }

    if (res.error) {
      if (maxAttempts) {
        while (currentAttempts < maxAttempts) {
          // eslint-disable-next-line no-await-in-loop
          await sleep(500);
          currentAttempts += 1;
          // eslint-disable-next-line no-await-in-loop
          res = await _fetchProtobuf<RequestType, ResponseType>({
            reqT,
            resT,
            url,
            method,
            payload,
            ...(accessToken
              ? {
                  headers: {
                    'x-auth-token': accessToken,
                  },
                }
              : {}),
          });
        }
      }
    }

    return res;
  } catch (errFirstAttempt) {
    // Invalid access token, refresh and try again
    if ((errFirstAttempt as Error).message === 'Access token invalid') {
      try {
        const refreshPayload = new newnewapi.RefreshCredentialRequest({
          refreshToken,
        });
        // Once launched, `refreshTokens` will return the same result
        // for the functions that called it simultaneously, i.e.
        // they are going to wait for the same Promise to be resolved
        const resRefresh = await refreshTokens(refreshPayload);

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
        res = await _fetchProtobuf<RequestType, ResponseType>({
          reqT,
          resT,
          url,
          method,
          payload,
          headers: {
            'x-auth-token': resRefresh.data.credential?.accessToken,
          },
        });
        return res;
      } catch (errSecondAttempt) {
        cookiesInstance.remove('accessToken');
        cookiesInstance.remove('refreshToken');

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
      cookiesInstance.remove('accessToken');
      cookiesInstance.remove('refreshToken');
      throw new Error((errFirstAttempt as Error).message);
    }

    // Return as APIResponse.error
    return {
      error: errFirstAttempt as Error,
    };
  }
}
