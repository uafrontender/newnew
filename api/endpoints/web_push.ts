import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_WEB_PUSH = `${BASE_URL}/web_push`;

export const webPush = (
  payload: newnewapi.WebPushRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.WebPushRequest, newnewapi.WebPushResponse>({
    reqT: newnewapi.WebPushRequest,
    resT: newnewapi.WebPushResponse,
    url: `${BASE_URL_WEB_PUSH}/`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const webPushRegister = (
  payload: newnewapi.RegisterForWebPushRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.RegisterForWebPushRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.RegisterForWebPushRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_WEB_PUSH}/register`,
    method: 'put',
    payload,
    ...(signal ? { signal } : {}),
  });

export const webPushUnRegister = (
  payload: newnewapi.UnRegisterForWebPushRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.UnRegisterForWebPushRequest, newnewapi.EmptyResponse>(
    {
      reqT: newnewapi.UnRegisterForWebPushRequest,
      resT: newnewapi.EmptyResponse,
      url: `${BASE_URL_WEB_PUSH}/unregister`,
      method: 'delete',
      payload,
      ...(signal ? { signal } : {}),
    }
  );

export const webPushConfig = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.ConfigForWebPushResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.ConfigForWebPushResponse,
    url: `${BASE_URL_WEB_PUSH}/config`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const webPushCheck = (
  payload: newnewapi.WebPushCheckRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.WebPushCheckRequest, newnewapi.WebPushCheckResponse>({
    reqT: newnewapi.WebPushCheckRequest,
    resT: newnewapi.WebPushCheckResponse,
    url: `${BASE_URL_WEB_PUSH}/check`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const webPushPause = (
  payload: newnewapi.WebPushPauseRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.WebPushPauseRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.WebPushPauseRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_WEB_PUSH}/pause`,
    method: 'put',
    payload,
    ...(signal ? { signal } : {}),
  });

export const webPushResume = (
  payload: newnewapi.WebPushResumeRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.WebPushResumeRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.WebPushResumeRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_WEB_PUSH}/resume`,
    method: 'put',
    payload,
    ...(signal ? { signal } : {}),
  });
