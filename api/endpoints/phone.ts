import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_REWARD = `${BASE_URL}/phone`;

export const subscribeToCreatorSmsNotifications = (
  creatorUuid: string,
  phoneNumber?: newnewapi.IPhoneNumber,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.SubscribeSmsNotificationsRequest({
    object: {
      creatorUuid: creatorUuid,
    },
    phoneNumber,
  });

  return fetchProtobufProtectedIntercepted<
    newnewapi.SubscribeSmsNotificationsRequest,
    newnewapi.SubscribeSmsNotificationsResponse
  >(
    newnewapi.SubscribeSmsNotificationsRequest,
    newnewapi.SubscribeSmsNotificationsResponse,
    `${BASE_URL_REWARD}/subscribe_sms_notifications`,
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
      creatorUuid: creatorUuid,
    },
  });

  return fetchProtobufProtectedIntercepted<
    newnewapi.UnsubscribeSmsNotificationsRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.UnsubscribeSmsNotificationsRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_REWARD}/unsubscribe_sms_notifications`,
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
      creatorUuid: creatorUuid,
    },
  });

  return fetchProtobufProtectedIntercepted<
    newnewapi.GetSmsNotificationsStatusRequest,
    newnewapi.GetSmsNotificationsStatusResponse
  >(
    newnewapi.GetSmsNotificationsStatusRequest,
    newnewapi.GetSmsNotificationsStatusResponse,
    `${BASE_URL_REWARD}/get_sms_notifications_status`,
    'post',
    payload,
    signal ?? undefined
  );
};

// Guest
export const subscribeGuestToCreatorSmsNotifications = (
  creatorUuid: string,
  guestUUid: string,
  phoneNumber?: newnewapi.IPhoneNumber,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.SubscribeSmsNotificationsRequest({
    object: {
      creatorUuid: creatorUuid,
    },
    guestId: guestUUid,
    phoneNumber: phoneNumber,
  });

  return fetchProtobuf<
    newnewapi.SubscribeSmsNotificationsRequest,
    newnewapi.SubscribeSmsNotificationsResponse
  >(
    newnewapi.SubscribeSmsNotificationsRequest,
    newnewapi.SubscribeSmsNotificationsResponse,
    `${BASE_URL_REWARD}/subscribe_sms_notifications`,
    'post',
    payload,
    signal ?? undefined
  );
};

export const unsubscribeGuestFromCreatorSmsNotifications = (
  creatorUuid: string,
  guestUUid: string,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.UnsubscribeSmsNotificationsRequest({
    object: {
      creatorUuid: creatorUuid,
    },
    guestId: guestUUid,
  });

  return fetchProtobuf<
    newnewapi.UnsubscribeSmsNotificationsRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.UnsubscribeSmsNotificationsRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_REWARD}/unsubscribe_sms_notifications`,
    'post',
    payload,
    signal ?? undefined
  );
};

export const getGuestSmsNotificationsSubscriptionToCreatorStatus = (
  creatorUuid: string,
  guestUUid: string,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.GetSmsNotificationsStatusRequest({
    object: {
      creatorUuid: creatorUuid,
    },
    guestId: guestUUid,
  });

  return fetchProtobuf<
    newnewapi.GetSmsNotificationsStatusRequest,
    newnewapi.GetSmsNotificationsStatusResponse
  >(
    newnewapi.GetSmsNotificationsStatusRequest,
    newnewapi.GetSmsNotificationsStatusResponse,
    `${BASE_URL_REWARD}/get_sms_notifications_status`,
    'post',
    payload,
    signal ?? undefined
  );
};
