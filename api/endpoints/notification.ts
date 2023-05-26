import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

export const BASE_URL_NOTIFICATION = `${BASE_URL}/notification`;

export const getMyNotifications = (
  payload: newnewapi.GetMyNotificationsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetMyNotificationsRequest,
    newnewapi.GetMyNotificationsResponse
  >(
    newnewapi.GetMyNotificationsRequest,
    newnewapi.GetMyNotificationsResponse,
    `${BASE_URL_NOTIFICATION}/get_my_notifications`,
    'post',
    payload,
    signal ?? undefined
  );

export const markAsRead = (
  payload: newnewapi.MarkAsReadRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.MarkAsReadRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.MarkAsReadRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_NOTIFICATION}/mark_as_read`,
    'post',
    payload,
    signal ?? undefined
  );

export const markAllAsRead = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_NOTIFICATION}/mark_all_as_read`,
    'post',
    payload,
    signal ?? undefined
  );

export const getUnreadNotificationCount = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetUnreadNotificationCountResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetUnreadNotificationCountResponse,
    `${BASE_URL_NOTIFICATION}/get_unread_notification_count`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMyNotificationsState = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetMyNotificationsStateResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetMyNotificationsStateResponse,
    `${BASE_URL_NOTIFICATION}/get_my_notifications_state`,
    'post',
    payload,
    signal ?? undefined
  );

export const updateMyNotificationsState = (
  payload: newnewapi.UpdateMyNotificationsStateRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.UpdateMyNotificationsStateRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.UpdateMyNotificationsStateRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_NOTIFICATION}/update_my_notifications_state`,
    'post',
    payload,
    signal ?? undefined
  );

export const unsubscribeFromEmailNotifications = (
  payload: newnewapi.UnsubscribeFromEmailNotificationsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.UnsubscribeFromEmailNotificationsRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.UnsubscribeFromEmailNotificationsRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_NOTIFICATION}/unsubscribe_from_email_notifications`,
    'post',
    payload,
    signal ?? undefined
  );
