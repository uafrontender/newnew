import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobufProtectedIntercepted,
  fetchProtobuf,
  cookiesInstance,
} from '../apiConfigs';

const BASE_URL_COMMENTS = `${BASE_URL}/comments`;

export const getComments = (
  payload: newnewapi.GetCommentsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetCommentsRequest, newnewapi.GetCommentsResponse>(
    newnewapi.GetCommentsRequest,
    newnewapi.GetCommentsResponse,
    `${BASE_URL_COMMENTS}/get_comments`,
    'post',
    payload,
    // Optional authentication
    cookiesInstance.get('accessToken')
      ? {
          'x-auth-token': cookiesInstance.get('accessToken'),
        }
      : {},
    'cors',
    'same-origin',
    signal ?? undefined
  );


export const sendComment = (
  payload: newnewapi.SendCommentRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SendCommentRequest,
    newnewapi.SendCommentResponse
  >(
    newnewapi.SendCommentRequest,
    newnewapi.SendCommentResponse,
    `${BASE_URL_COMMENTS}/send_comment`,
    'post',
    payload,
    signal ?? undefined
  );


export const deleteComment = (
  payload: newnewapi.DeleteCommentRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.DeleteCommentRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.DeleteCommentRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_COMMENTS}/delete_comment`,
    'post',
    payload,
    signal ?? undefined
  );

