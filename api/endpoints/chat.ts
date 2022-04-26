import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted, fetchProtobuf, cookiesInstance } from '../apiConfigs';

export const BASE_URL_CHAT = `${BASE_URL}/chat`;

export const markRoomAsRead = (payload: newnewapi.MarkRoomAsReadRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.MarkRoomAsReadRequest, newnewapi.EmptyResponse>(
    newnewapi.MarkRoomAsReadRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_CHAT}/mark_room_as_read`,
    'post',
    payload
  );

export const getMessages = (payload: newnewapi.GetMessagesRequest) =>
  fetchProtobuf<newnewapi.GetMessagesRequest, newnewapi.GetMessagesResponse>(
    newnewapi.GetMessagesRequest,
    newnewapi.GetMessagesResponse,
    `${BASE_URL_CHAT}/get_messages`,
    'post',
    payload,
    // Optional authentication
    (cookiesInstance.get('accessToken') ? {
      'x-auth-token': cookiesInstance.get('accessToken'),
    } : {}),
  );

export const getMyRooms = (payload: newnewapi.GetMyRoomsRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.GetMyRoomsRequest, newnewapi.GetMyRoomsResponse>(
    newnewapi.GetMyRoomsRequest,
    newnewapi.GetMyRoomsResponse,
    `${BASE_URL_CHAT}/get_my_rooms`,
    'post',
    payload
  );

export const sendMessage = (payload: newnewapi.SendMessageRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.SendMessageRequest, newnewapi.SendMessageResponse>(
    newnewapi.SendMessageRequest,
    newnewapi.SendMessageResponse,
    `${BASE_URL_CHAT}/send_message`,
    'post',
    payload
  );

export const deleteMessage = (payload: newnewapi.DeleteMessageRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.DeleteMessageRequest, newnewapi.EmptyResponse>(
    newnewapi.DeleteMessageRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_CHAT}/delete_message`,
    'post',
    payload
  );

export const getTotalUnreadMessageCounts = (payload: newnewapi.EmptyRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.EmptyRequest, newnewapi.TotalUnreadMessageCounts>(
    newnewapi.EmptyRequest,
    newnewapi.TotalUnreadMessageCounts,
    `${BASE_URL_CHAT}/get_total_unread_message_counts`,
    'post',
    payload
  );

export const getRoom = (payload: newnewapi.GetRoomRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.GetRoomRequest, newnewapi.ChatRoom>(
    newnewapi.GetRoomRequest,
    newnewapi.ChatRoom,
    `${BASE_URL_CHAT}/get_room`,
    'post',
    payload
  );
