// Configuration & helper functions file for the RESTful API endpoints
import { newnewapi } from 'newnew-api';
import * as $protobuf from 'protobufjs';
import { Cookies } from 'react-cookie';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const cookiesInstance = new Cookies();

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
  toJSON(): { [k: string]: any }
}

/**
 * All the protobufjs-generated class **objects** conform to this interface.
 */
export interface EncDec<T = keyof NewnewapiType> {
  encode(message: T, writer?: $protobuf.Writer): $protobuf.Writer;
  decode(reader: ($protobuf.Reader|Uint8Array), length?: number): T & JsonConvertible;
  fromObject(object: { [k: string]: any }): T & JsonConvertible;
}

/**
 * Handles checking if the response is ok and if it is a protobuf message,
 * returns an Array Buffer that can be decoded in the outer function.
 * @param response browser Fetch API response
 */
export const handleProtobufResponse = (response: Response): Promise<ArrayBuffer> => {
  const contentType = response.headers.get('content-type');

  return new Promise((resolve, reject) => {
    if (response.ok && contentType && contentType.indexOf('application/x-protobuf') !== -1) {
      return resolve(response.arrayBuffer());
    }
    if (response.status >= 400 && response.status < 404) {
      return reject(new Error('Token invalid'));
    }
    return reject(new Error('An error occured'));
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
ResponseType = keyof NewnewapiType>(
  reqT: EncDec<RequestType>,
  resT: EncDec<ResponseType>,
  url: string,
  method: Request['method'] = 'get',
  payload?: RequestType,
  headers: any = {},
  mode: Request['mode'] = 'cors',
  credentials: Request['credentials'] = 'same-origin',
): Promise<APIResponse<ResponseType>> {
  const encoded = payload ? reqT.encode(payload).finish() : undefined;

  try {
    const buff: ArrayBuffer = await fetch(url, {
      method,
      headers: {
        'Content-type': 'application/x-protobuf',
        ...headers,
      },
      mode,
      credentials,
      ...(encoded ? { body: encoded } : {}),
    })
      .then((response) => handleProtobufResponse(response))
      .catch((err) => {
        throw err;
      });

    return {
      data: resT.decode(new Uint8Array(buff)),
    };
  } catch (err) {
    return {
      error: err as Error,
    };
  }
}

// Tries to refresh credentials if access token has expired
export const refreshCredentials = (
  payload: newnewapi.RefreshCredentialRequest,
) => fetchProtobuf<newnewapi.RefreshCredentialRequest, newnewapi.RefreshCredentialResponse>(
  newnewapi.RefreshCredentialRequest,
  newnewapi.RefreshCredentialResponse,
  `${BASE_URL}/auth/refresh_credential`,
  'post',
  payload,
);

export type TTokenCookie = {
  name: string,
  value: string,
  expires?: string,
  maxAge?: string,
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
 * @param headers additional headers, should be initialized with `new Headers()`
 * @param tokens access and refresh tokens, when used server-side
 * @param updateCookieServerSideCallback used to update cookies server-side
 */
export async function fetchProtobufProtectedIntercepted<
RequestType = keyof NewnewapiType,
ResponseType = keyof NewnewapiType>(
  reqT: EncDec<RequestType>,
  resT: EncDec<ResponseType>,
  url: string,
  method: Request['method'] = 'get',
  payload?: RequestType,
  tokens?: {
    accessToken: string;
    refreshToken: string;
  },
  updateCookieServerSideCallback?: (tokensToAdd: TTokenCookie[]) => void,
): Promise<APIResponse<ResponseType>> {
  // Try to get tokens - from react-cookie instance or from passed params
  const accessToken = tokens?.accessToken ?? cookiesInstance.get('accessToken');
  const refreshToken = tokens?.refreshToken ?? cookiesInstance.get('refreshToken');

  if (!accessToken) throw new Error('No token');

  try {
    let res: APIResponse<ResponseType> = await fetchProtobuf<
    RequestType, ResponseType>(
      reqT,
      resT,
      url,
      method,
      payload,
      {
        'x-auth-token': accessToken,
      },
    );

    // Invalid token, refresh and try again
    if (!res.data && res.error?.message === 'Token invalid') {
      const refreshPayload = new newnewapi.RefreshCredentialRequest({
        refreshToken,
        // refreshToken: 'wrong token',
      });
      const resRefresh = await refreshCredentials(refreshPayload);

      console.log(resRefresh);

      if (!resRefresh.data || resRefresh.error) throw new Error('Refresh failed');

      // Client side
      if (!tokens) {
        cookiesInstance.set(
          'accessToken',
          resRefresh.data.credential?.accessToken,
          {
            expires: new Date((resRefresh.data.credential?.expiresAt?.seconds as number)!! * 1000),
          },
        );
        cookiesInstance.set(
          'refreshToken',
          resRefresh.data.credential?.refreshToken,
          {
            // Expire in 10 years
            maxAge: (10 * 365 * 24 * 60 * 60),
          },
        );
      } else {
        // Server-side
        updateCookieServerSideCallback?.([
          {
            name: 'accessToken',
            value: resRefresh.data.credential?.accessToken!!,
            expires: new Date((
              resRefresh.data.credential?.expiresAt?.seconds as number)!! * 1000)
              .toUTCString(),
          },
          {
            name: 'refreshToken',
            value: resRefresh.data.credential?.refreshToken!!,
            maxAge: (10 * 365 * 24 * 60 * 60).toString(),
          },
        ]);
      }

      // Try again with new credentials
      res = await fetchProtobuf<
        RequestType, ResponseType>(
          reqT,
          resT,
          url,
          method,
          payload,
          {
            'x-auth-token': resRefresh.data.credential?.accessToken,
          },
        );
    }

    return res;
  } catch (err) {
    return {
      error: err as Error,
    };
  }
}
