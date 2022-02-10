import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

export const BASE_URL_SUBSCRIPTIONS = `${BASE_URL}/subscription`;

export const subscribeToCreator = (payload: newnewapi.SubscribeToCreatorRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.SubscribeToCreatorRequest, newnewapi.SubscribeToCreatorResponse>(
    newnewapi.SubscribeToCreatorRequest,
    newnewapi.SubscribeToCreatorResponse,
    `${BASE_URL_SUBSCRIPTIONS}/subscribe_to_creator`,
    'post',
    payload
  );

export const unsubscribeFromCreator = (payload: newnewapi.UnsubscribeFromCreatorRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.UnsubscribeFromCreatorRequest, newnewapi.UnsubscribeFromCreatorResponse>(
    newnewapi.UnsubscribeFromCreatorRequest,
    newnewapi.UnsubscribeFromCreatorResponse,
    `${BASE_URL_SUBSCRIPTIONS}/unsubscribe_from_creator`,
    'post',
    payload
  );

export const getSubscriptionStatus = (payload: newnewapi.SubscriptionStatusRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.SubscriptionStatusRequest, newnewapi.SubscriptionStatusResponse>(
    newnewapi.SubscriptionStatusRequest,
    newnewapi.SubscriptionStatusResponse,
    `${BASE_URL_SUBSCRIPTIONS}/get_subscription_status`,
    'post',
    payload
  );

export const getMySubscribers = (payload: newnewapi.GetMySubscribersRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.GetMySubscribersRequest, newnewapi.GetMySubscribersResponse>(
    newnewapi.GetMySubscribersRequest,
    newnewapi.GetMySubscribersResponse,
    `${BASE_URL_SUBSCRIPTIONS}/get_my_subscribers`,
    'post',
    payload
  );

export const getCreatorsImSubscribedTo = (payload: newnewapi.EmptyRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.EmptyRequest, newnewapi.GetCreatorsImSubscribedToResponse>(
    newnewapi.EmptyRequest,
    newnewapi.GetCreatorsImSubscribedToResponse,
    `${BASE_URL_SUBSCRIPTIONS}/get_creators_im_subscribed_to`,
    'post',
    payload
  );
