import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

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

  return fetchProtobuf<
    newnewapi.SubscribeSmsNotificationsRequest,
    newnewapi.SubscribeSmsNotificationsResponse
  >({
    reqT: newnewapi.SubscribeSmsNotificationsRequest,
    resT: newnewapi.SubscribeSmsNotificationsResponse,
    url: `${BASE_URL_PHONE}/subscribe_sms_notifications`,
    payload,
    ...(signal ? { signal } : {}),
  });
};

export const unsubscribeFromSmsNotifications = (
  subscriptionObject: newnewapi.ISmsNotificationObject,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.UnsubscribeSmsNotificationsRequest({
    object: subscriptionObject,
  });

  return fetchProtobuf<
    newnewapi.UnsubscribeSmsNotificationsRequest,
    newnewapi.EmptyResponse
  >({
    reqT: newnewapi.UnsubscribeSmsNotificationsRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_PHONE}/unsubscribe_sms_notifications`,
    payload,
    ...(signal ? { signal } : {}),
  });
};

export const getSmsNotificationsSubscriptionStatus = (
  subscriptionObject: newnewapi.ISmsNotificationObject,
  signal?: RequestInit['signal']
) => {
  const payload = new newnewapi.GetSmsNotificationsStatusRequest({
    object: subscriptionObject,
  });

  return fetchProtobuf<
    newnewapi.GetSmsNotificationsStatusRequest,
    newnewapi.GetSmsNotificationsStatusResponse
  >({
    reqT: newnewapi.GetSmsNotificationsStatusRequest,
    resT: newnewapi.GetSmsNotificationsStatusResponse,
    url: `${BASE_URL_PHONE}/get_sms_notifications_status`,
    payload,
    ...(signal ? { signal } : {}),
  });
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
  >({
    reqT: newnewapi.SubscribeSmsNotificationsRequest,
    resT: newnewapi.SubscribeSmsNotificationsResponse,
    url: `${BASE_URL_PHONE}/subscribe_sms_notifications`,
    payload,
    ...(signal ? { signal } : {}),
  });
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
  >({
    reqT: newnewapi.UnsubscribeSmsNotificationsRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_PHONE}/unsubscribe_sms_notifications`,
    payload,
    ...(signal ? { signal } : {}),
  });
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
  >({
    reqT: newnewapi.GetSmsNotificationsStatusRequest,
    resT: newnewapi.GetSmsNotificationsStatusResponse,
    url: `${BASE_URL_PHONE}/get_sms_notifications_status`,
    payload,
    ...(signal ? { signal } : {}),
  });
};
