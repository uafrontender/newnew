import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

export const BASE_URL_CHAT = `${BASE_URL}/chat`;

export const createRoom = (payload: newnewapi.CreateRoomRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.CreateRoomRequest, newnewapi.CreateRoomResponse>(
    newnewapi.CreateRoomRequest,
    newnewapi.CreateRoomResponse,
    `${BASE_URL_CHAT}/create_room`,
    'post',
    payload
  );

export const deleteMyRoom = (payload: newnewapi.DeleteMyRoomRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.DeleteMyRoomRequest, newnewapi.EmptyResponse>(
    newnewapi.DeleteMyRoomRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_CHAT}/delete_room`,
    'post',
    payload
  );

export const markRoomAsRead = (payload: newnewapi.MarkRoomAsReadRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.MarkRoomAsReadRequest, newnewapi.EmptyResponse>(
    newnewapi.MarkRoomAsReadRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_CHAT}/mark_room_as_read`,
    'post',
    payload
  );

export const getMessages = (payload: newnewapi.GetMessagesRequest) =>
  fetchProtobufProtectedIntercepted<newnewapi.GetMessagesRequest, newnewapi.GetMessagesResponse>(
    newnewapi.GetMessagesRequest,
    newnewapi.GetMessagesResponse,
    `${BASE_URL_CHAT}/get_messages`,
    'post',
    payload
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
