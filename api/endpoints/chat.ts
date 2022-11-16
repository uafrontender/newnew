import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobufProtectedIntercepted,
  fetchProtobuf,
  cookiesInstance,
} from '../apiConfigs';

const BASE_URL_CHAT = `${BASE_URL}/chat`;

export const markRoomAsRead = (
  payload: newnewapi.MarkRoomAsReadRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.MarkRoomAsReadRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.MarkRoomAsReadRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_CHAT}/mark_room_as_read`,
    'post',
    payload,
    signal ?? undefined
  );

export const getMessages = (
  payload: newnewapi.GetMessagesRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetMessagesRequest, newnewapi.GetMessagesResponse>(
    newnewapi.GetMessagesRequest,
    newnewapi.GetMessagesResponse,
    `${BASE_URL_CHAT}/get_messages`,
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

export const getMyRooms = (
  payload: newnewapi.GetMyRoomsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetMyRoomsRequest,
    newnewapi.GetMyRoomsResponse
  >(
    newnewapi.GetMyRoomsRequest,
    newnewapi.GetMyRoomsResponse,
    `${BASE_URL_CHAT}/get_my_rooms`,
    'post',
    payload,
    signal ?? undefined
  );

export const sendMessage = (
  payload: newnewapi.SendMessageRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SendMessageRequest,
    newnewapi.SendMessageResponse
  >(
    newnewapi.SendMessageRequest,
    newnewapi.SendMessageResponse,
    `${BASE_URL_CHAT}/send_message`,
    'post',
    payload,
    signal ?? undefined
  );

export const deleteMessage = (
  payload: newnewapi.DeleteMessageRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.DeleteMessageRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.DeleteMessageRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_CHAT}/delete_message`,
    'post',
    payload,
    signal ?? undefined
  );

export const getTotalUnreadMessageCounts = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.TotalUnreadMessageCounts
  >(
    newnewapi.EmptyRequest,
    newnewapi.TotalUnreadMessageCounts,
    `${BASE_URL_CHAT}/get_total_unread_message_counts`,
    'post',
    payload,
    signal ?? undefined
  );

export const getRoom = (
  payload: newnewapi.GetRoomRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetRoomRequest,
    newnewapi.ChatRoom
  >(
    newnewapi.GetRoomRequest,
    newnewapi.ChatRoom,
    `${BASE_URL_CHAT}/get_room`,
    'post',
    payload,
    signal ?? undefined
  );

export const getVisavisList = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.EmptyRequest,
    newnewapi.VisavisListResponse
  >(
    newnewapi.EmptyRequest,
    newnewapi.VisavisListResponse,
    `${BASE_URL_CHAT}/get_visavis_list`,
    'post',
    payload,
    signal ?? undefined
  );
