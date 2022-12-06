import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

const BASE_URL_WEB_PUSH = `${BASE_URL}/web_push`;

export const webPush = (
  payload: newnewapi.WebPushRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.WebPushRequest,
    newnewapi.WebPushResponse
  >(
    newnewapi.WebPushRequest,
    newnewapi.WebPushResponse,
    `${BASE_URL_WEB_PUSH}/`,
    'post',
    payload,
    signal ?? undefined
  );

export const webPushRegister = (
  payload: newnewapi.RegisterForWebPushRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.RegisterForWebPushRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.RegisterForWebPushRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_WEB_PUSH}/register`,
    'put',
    payload,
    signal ?? undefined
  );

export const webPushUnRegister = (
  payload: newnewapi.UnRegisterForWebPushRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.UnRegisterForWebPushRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.UnRegisterForWebPushRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_WEB_PUSH}/unregister`,
    'delete',
    payload,
    signal ?? undefined
  );

export const webPushConfig = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.ConfigForWebPushResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.ConfigForWebPushResponse,
    `${BASE_URL_WEB_PUSH}/config`,
    'post',
    payload,
    signal ?? undefined
  );
