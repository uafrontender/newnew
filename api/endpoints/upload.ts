import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_UPLOAD = `${BASE_URL}/upload`;

export const getImageUploadUrl = (
  payload: newnewapi.GetImageUploadUrlRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetImageUploadUrlRequest,
    newnewapi.GetImageUploadUrlResponse
  >({
    reqT: newnewapi.GetImageUploadUrlRequest,
    resT: newnewapi.GetImageUploadUrlResponse,
    url: `${BASE_URL_UPLOAD}/get_image_upload_url`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getVideoUploadUrl = (
  payload: newnewapi.GetVideoUploadUrlRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetVideoUploadUrlRequest,
    newnewapi.GetVideoUploadUrlResponse
  >({
    reqT: newnewapi.GetVideoUploadUrlRequest,
    resT: newnewapi.GetVideoUploadUrlResponse,
    url: `${BASE_URL_UPLOAD}/get_video_upload_url`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const removeUploadedFile = (
  payload: newnewapi.RemoveUploadedFileRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.RemoveUploadedFileRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.RemoveUploadedFileRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_UPLOAD}/remove_uploaded_file`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const startVideoProcessing = (
  payload: newnewapi.StartVideoProcessingRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.StartVideoProcessingRequest,
    newnewapi.StartVideoProcessingResponse
  >({
    reqT: newnewapi.StartVideoProcessingRequest,
    resT: newnewapi.StartVideoProcessingResponse,
    url: `${BASE_URL_UPLOAD}/start_video_processing`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const stopVideoProcessing = (
  payload: newnewapi.StopVideoProcessingRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.StopVideoProcessingRequest,
    newnewapi.StopVideoProcessingResponse
  >({
    reqT: newnewapi.StopVideoProcessingRequest,
    resT: newnewapi.StopVideoProcessingResponse,
    url: `${BASE_URL_UPLOAD}/stop_video_processing`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getCoverImageUploadUrl = (
  payload: newnewapi.GetCoverImageUploadUrlRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetCoverImageUploadUrlRequest,
    newnewapi.GetCoverImageUploadUrlResponse
  >({
    reqT: newnewapi.GetCoverImageUploadUrlRequest,
    resT: newnewapi.GetCoverImageUploadUrlResponse,
    url: `${BASE_URL_UPLOAD}/get_cover_image_upload_url`,
    payload,
    ...(signal ? { signal } : {}),
  });
