// Configuration & helper functions file for the RESTful API endpoints
import { newnewapi } from 'newnew-api';
import * as $protobuf from 'protobufjs';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
export const handleProtobufResponse = (response: Response) => {
  const contentType = response.headers.get('content-type');

  if (response.ok && contentType && contentType.indexOf('application/x-protobuf') !== -1) {
    return response.arrayBuffer();
  }

  throw new Error('Request failed');
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
      .then((response) => handleProtobufResponse(response));

    return {
      data: resT.decode(new Uint8Array(buff)),
    };
  } catch (err) {
    return {
      error: err as Error,
    };
  }
}
