import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_PHONE = `${BASE_URL}/phone`;

export const subscribeToCreatorSmsNotifications = (
  creatorUuid: string,
  phoneNumber?: newnewapi.IPhoneNumber,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.SubscribeSmsNotificationsRequest({
    object: {
      creatorUuid,
    },
    phoneNumber,
  });

  return fetchProtobufProtectedIntercepted<
    newnewapi.SubscribeSmsNotificationsRequest,
    newnewapi.SubscribeSmsNotificationsResponse
  >(
    newnewapi.SubscribeSmsNotificationsRequest,
    newnewapi.SubscribeSmsNotificationsResponse,
    `${BASE_URL_PHONE}/subscribe_sms_notifications`,
    'post',
    payload,
    signal ?? undefined
  );
};

export const unsubscribeFromCreatorSmsNotifications = (
  creatorUuid: string,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.UnsubscribeSmsNotificationsRequest({
    object: {
      creatorUuid,
    },
  });

  return fetchProtobufProtectedIntercepted<
    newnewapi.UnsubscribeSmsNotificationsRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.UnsubscribeSmsNotificationsRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_PHONE}/unsubscribe_sms_notifications`,
    'post',
    payload,
    signal ?? undefined
  );
};

export const getSmsNotificationsSubscriptionToCreatorStatus = (
  creatorUuid: string,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.GetSmsNotificationsStatusRequest({
    object: {
      creatorUuid,
    },
  });

  return fetchProtobufProtectedIntercepted<
    newnewapi.GetSmsNotificationsStatusRequest,
    newnewapi.GetSmsNotificationsStatusResponse
  >(
    newnewapi.GetSmsNotificationsStatusRequest,
    newnewapi.GetSmsNotificationsStatusResponse,
    `${BASE_URL_PHONE}/get_sms_notifications_status`,
    'post',
    payload,
    signal ?? undefined
  );
};

// Guest
export const subscribeGuestToCreatorSmsNotifications = (
  creatorUuid: string,
  guestId: string,
  phoneNumber?: newnewapi.IPhoneNumber,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.SubscribeSmsNotificationsRequest({
    object: {
      creatorUuid,
    },
    guestId,
    phoneNumber,
  });

  return fetchProtobuf<
    newnewapi.SubscribeSmsNotificationsRequest,
    newnewapi.SubscribeSmsNotificationsResponse
  >(
    newnewapi.SubscribeSmsNotificationsRequest,
    newnewapi.SubscribeSmsNotificationsResponse,
    `${BASE_URL_PHONE}/subscribe_sms_notifications`,
    'post',
    payload,
    signal ?? undefined
  );
};

export const unsubscribeGuestFromCreatorSmsNotifications = (
  creatorUuid: string,
  guestId: string,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.UnsubscribeSmsNotificationsRequest({
    object: {
      creatorUuid,
    },
    guestId,
  });

  return fetchProtobuf<
    newnewapi.UnsubscribeSmsNotificationsRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.UnsubscribeSmsNotificationsRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_PHONE}/unsubscribe_sms_notifications`,
    'post',
    payload,
    signal ?? undefined
  );
};

export const getGuestSmsNotificationsSubscriptionToCreatorStatus = (
  creatorUuid: string,
  guestId: string,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.GetSmsNotificationsStatusRequest({
    object: {
      creatorUuid,
    },
    guestId,
  });

  return fetchProtobuf<
    newnewapi.GetSmsNotificationsStatusRequest,
    newnewapi.GetSmsNotificationsStatusResponse
  >(
    newnewapi.GetSmsNotificationsStatusRequest,
    newnewapi.GetSmsNotificationsStatusResponse,
    `${BASE_URL_PHONE}/get_sms_notifications_status`,
    'post',
    payload,
    signal ?? undefined
  );
};
