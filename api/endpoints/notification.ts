import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

export const BASE_URL_CHAT = `${BASE_URL}/notification`;

export const GetMyNotifications = (payload: newnewapi.GetMyNotificationsRequest) =>
  fetchProtobuf<newnewapi.GetMyNotificationsRequest, newnewapi.GetMyNotificationsResponse>(
    newnewapi.GetMyNotificationsRequest,
    newnewapi.GetMyNotificationsResponse,
    `${BASE_URL_CHAT}/get_my_notifications`,
    'post',
    payload
  );

export const MarkAsRead = (payload: newnewapi.MarkAsReadRequest) =>
  fetchProtobuf<newnewapi.MarkAsReadRequest, newnewapi.EmptyResponse>(
    newnewapi.MarkAsReadRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_CHAT}/mark_as_read`,
    'post',
    payload
  );
