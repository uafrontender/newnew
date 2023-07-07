import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_CHAT = `${BASE_URL}/chat`;

export const markRoomAsRead = (
  payload: newnewapi.MarkRoomAsReadRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.MarkRoomAsReadRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.MarkRoomAsReadRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_CHAT}/mark_room_as_read`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMessages = (
  payload: newnewapi.GetMessagesRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetMessagesRequest, newnewapi.GetMessagesResponse>({
    reqT: newnewapi.GetMessagesRequest,
    resT: newnewapi.GetMessagesResponse,
    url: `${BASE_URL_CHAT}/get_messages`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getMyRooms = (
  payload: newnewapi.GetMyRoomsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetMyRoomsRequest, newnewapi.GetMyRoomsResponse>({
    reqT: newnewapi.GetMyRoomsRequest,
    resT: newnewapi.GetMyRoomsResponse,
    url: `${BASE_URL_CHAT}/get_my_rooms`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const sendMessage = (
  payload: newnewapi.SendMessageRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SendMessageRequest, newnewapi.SendMessageResponse>({
    reqT: newnewapi.SendMessageRequest,
    resT: newnewapi.SendMessageResponse,
    url: `${BASE_URL_CHAT}/send_message`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const deleteMessage = (
  payload: newnewapi.DeleteMessageRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.DeleteMessageRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.DeleteMessageRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_CHAT}/delete_message`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getTotalUnreadMessageCounts = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.TotalUnreadMessageCounts>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.TotalUnreadMessageCounts,
    url: `${BASE_URL_CHAT}/get_total_unread_message_counts`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getRoom = (
  payload: newnewapi.GetRoomRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetRoomRequest, newnewapi.ChatRoom>({
    reqT: newnewapi.GetRoomRequest,
    resT: newnewapi.ChatRoom,
    url: `${BASE_URL_CHAT}/get_room`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getVisavisList = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.VisavisListResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.VisavisListResponse,
    url: `${BASE_URL_CHAT}/get_visavis_list`,
    payload,
    ...(signal ? { signal } : {}),
  });
