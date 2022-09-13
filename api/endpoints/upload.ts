import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

const BASE_URL_UPLOAD = `${BASE_URL}/upload`;

export const getImageUploadUrl = (
  payload: newnewapi.GetImageUploadUrlRequest, signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetImageUploadUrlRequest,
    newnewapi.GetImageUploadUrlResponse
  >(
    newnewapi.GetImageUploadUrlRequest,
    newnewapi.GetImageUploadUrlResponse,
    `${BASE_URL_UPLOAD}/get_image_upload_url`,
    'post',
    payload,
    signal ?? undefined,
  );

export const getVideoUploadUrl = (
  payload: newnewapi.GetVideoUploadUrlRequest, signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetVideoUploadUrlRequest,
    newnewapi.GetVideoUploadUrlResponse
  >(
    newnewapi.GetVideoUploadUrlRequest,
    newnewapi.GetVideoUploadUrlResponse,
    `${BASE_URL_UPLOAD}/get_video_upload_url`,
    'post',
    payload,
    signal ?? undefined,
  );

export const removeUploadedFile = (
  payload: newnewapi.RemoveUploadedFileRequest, signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.RemoveUploadedFileRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.RemoveUploadedFileRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_UPLOAD}/remove_uploaded_file`,
    'post',
    payload,
    signal ?? undefined,
  );

export const startVideoProcessing = (
  payload: newnewapi.StartVideoProcessingRequest, signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.StartVideoProcessingRequest,
    newnewapi.StartVideoProcessingResponse
  >(
    newnewapi.StartVideoProcessingRequest,
    newnewapi.StartVideoProcessingResponse,
    `${BASE_URL_UPLOAD}/start_video_processing`,
    'post',
    payload,
    signal ?? undefined,
  );

export const stopVideoProcessing = (
  payload: newnewapi.StopVideoProcessingRequest, signal?: RequestInit['signal']
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.StopVideoProcessingRequest,
    newnewapi.StopVideoProcessingResponse
  >(
    newnewapi.StopVideoProcessingRequest,
    newnewapi.StopVideoProcessingResponse,
    `${BASE_URL_UPLOAD}/stop_video_processing`,
    'post',
    payload,
    signal ?? undefined,
  );

export const getCoverImageUploadUrl = (
  payload: newnewapi.GetCoverImageUploadUrlRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetCoverImageUploadUrlRequest,
    newnewapi.GetCoverImageUploadUrlResponse
  >(
    newnewapi.GetCoverImageUploadUrlRequest,
    newnewapi.GetCoverImageUploadUrlResponse,
    `${BASE_URL_UPLOAD}/get_cover_image_upload_url`,
    'post',
    payload
  );
