import { newnewapi } from 'newnew-api';
import * as $protobuf from 'protobufjs';

export type NewnewapiType = typeof newnewapi;

/**
 * All the protobufjs-generated class **instances** conform to this interface.
 */
interface JsonConvertible {
  toJSON(): { [k: string]: any };
}

/**
 * All the protobufjs-generated class **objects** conform to this interface.
 */
export interface EncDec<T = keyof NewnewapiType> {
  name: string;
  encode(message: T, writer?: $protobuf.Writer): $protobuf.Writer;
  decode(
    reader: $protobuf.Reader | Uint8Array,
    length?: number
  ): T & JsonConvertible;
  fromObject(object: { [k: string]: any }): T & JsonConvertible;
}

/**
 * Log request
 */
export const logRequest = <
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
export const logRequestError = <
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
