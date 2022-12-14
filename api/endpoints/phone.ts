import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

const BASE_URL_PHONE = `${BASE_URL}/phone`;

export const subscribeToSmsNotifications = (
  subscriptionObject: newnewapi.ISmsNotificationObject,
  phoneNumber?: newnewapi.IPhoneNumber,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.SubscribeSmsNotificationsRequest({
    object: subscriptionObject,
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

export const unsubscribeFromSmsNotifications = (
  subscriptionObject: newnewapi.ISmsNotificationObject,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.UnsubscribeSmsNotificationsRequest({
    object: subscriptionObject,
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

export const getSmsNotificationsSubscriptionStatus = (
  subscriptionObject: newnewapi.ISmsNotificationObject,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.GetSmsNotificationsStatusRequest({
    object: subscriptionObject,
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
export const subscribeGuestToSmsNotifications = (
  subscriptionObject: newnewapi.ISmsNotificationObject,
  guestId: string,
  phoneNumber?: newnewapi.IPhoneNumber,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.SubscribeSmsNotificationsRequest({
    object: subscriptionObject,
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

export const unsubscribeGuestFromSmsNotifications = (
  subscriptionObject: newnewapi.ISmsNotificationObject,
  guestId: string,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.UnsubscribeSmsNotificationsRequest({
    object: subscriptionObject,
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

export const getGuestSmsNotificationsSubscriptionStatus = (
  subscriptionObject: newnewapi.ISmsNotificationObject,
  guestId: string,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.GetSmsNotificationsStatusRequest({
    object: subscriptionObject,
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
