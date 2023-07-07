import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

export const BASE_URL_NOTIFICATION = `${BASE_URL}/notification`;

export const getMyNotifications = (
  payload: newnewapi.GetMyNotificationsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetMyNotificationsRequest,
    newnewapi.GetMyNotificationsResponse
  >({
    reqT: newnewapi.GetMyNotificationsRequest,
    resT: newnewapi.GetMyNotificationsResponse,
    url: `${BASE_URL_NOTIFICATION}/get_my_notifications`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const markAsRead = (
  payload: newnewapi.MarkAsReadRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.MarkAsReadRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.MarkAsReadRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_NOTIFICATION}/mark_as_read`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const markAllAsRead = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_NOTIFICATION}/mark_all_as_read`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getUnreadNotificationCount = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.EmptyRequest,
    newnewapi.GetUnreadNotificationCountResponse
  >({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetUnreadNotificationCountResponse,
    url: `${BASE_URL_NOTIFICATION}/get_unread_notification_count`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMyNotificationsState = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.EmptyRequest,
    newnewapi.GetMyNotificationsStateResponse
  >({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.GetMyNotificationsStateResponse,
    url: `${BASE_URL_NOTIFICATION}/get_my_notifications_state`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const updateMyNotificationsState = (
  payload: newnewapi.UpdateMyNotificationsStateRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.UpdateMyNotificationsStateRequest,
    newnewapi.EmptyResponse
  >({
    reqT: newnewapi.UpdateMyNotificationsStateRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_NOTIFICATION}/update_my_notifications_state`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const unsubscribeFromEmailNotifications = (
  payload: newnewapi.UnsubscribeFromEmailNotificationsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.UnsubscribeFromEmailNotificationsRequest,
    newnewapi.EmptyResponse
  >({
    reqT: newnewapi.UnsubscribeFromEmailNotificationsRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_NOTIFICATION}/unsubscribe_from_email_notifications`,
    payload,
    ...(signal ? { signal } : {}),
  });
