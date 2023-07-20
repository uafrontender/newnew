import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_COMMENTS = `${BASE_URL}/comments`;

export const getComments = (
  payload: newnewapi.GetCommentsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetCommentsRequest, newnewapi.GetCommentsResponse>({
    reqT: newnewapi.GetCommentsRequest,
    resT: newnewapi.GetCommentsResponse,
    url: `${BASE_URL_COMMENTS}/get_comments`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const sendComment = (
  payload: newnewapi.SendCommentRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SendCommentRequest, newnewapi.SendCommentResponse>({
    reqT: newnewapi.SendCommentRequest,
    resT: newnewapi.SendCommentResponse,
    url: `${BASE_URL_COMMENTS}/send_comment`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const deleteComment = (
  payload: newnewapi.DeleteCommentRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.DeleteCommentRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.DeleteCommentRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_COMMENTS}/delete_comment`,
    payload,
    ...(signal ? { signal } : {}),
  });
