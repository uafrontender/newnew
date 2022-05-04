import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

export const BASE_URL_NOTIFICATION = `${BASE_URL}/notification`;

export const getMyNotifications = (
  payload: newnewapi.GetMyNotificationsRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetMyNotificationsRequest,
    newnewapi.GetMyNotificationsResponse
  >(
    newnewapi.GetMyNotificationsRequest,
    newnewapi.GetMyNotificationsResponse,
    `${BASE_URL_NOTIFICATION}/get_my_notifications`,
    'post',
    payload
  );

export const markAsRead = (payload: newnewapi.MarkAsReadRequest) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.MarkAsReadRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.MarkAsReadRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_NOTIFICATION}/mark_as_read`,
    'post',
    payload
  );

export const getUnreadNotificationCount = (payload: newnewapi.EmptyRequest) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.GetUnreadNotificationCountResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.GetUnreadNotificationCountResponse,
    `${BASE_URL_NOTIFICATION}/get_unread_notification_count`,
    'post',
    payload
  );
