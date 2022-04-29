import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

export const BASE_URL_UPLOAD = `${BASE_URL}/upload`;

export const getImageUploadUrl = (
  payload: newnewapi.GetImageUploadUrlRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetImageUploadUrlRequest,
    newnewapi.GetImageUploadUrlResponse
  >(
    newnewapi.GetImageUploadUrlRequest,
    newnewapi.GetImageUploadUrlResponse,
    `${BASE_URL_UPLOAD}/get_image_upload_url`,
    'post',
    payload
  );

export const getVideoUploadUrl = (
  payload: newnewapi.GetVideoUploadUrlRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.GetVideoUploadUrlRequest,
    newnewapi.GetImageUploadUrlResponse
  >(
    newnewapi.GetVideoUploadUrlRequest,
    newnewapi.GetVideoUploadUrlResponse,
    `${BASE_URL_UPLOAD}/get_video_upload_url`,
    'post',
    payload
  );

export const removeUploadedFile = (
  payload: newnewapi.RemoveUploadedFileRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.RemoveUploadedFileRequest,
    newnewapi.EmptyResponse
  >(
    newnewapi.RemoveUploadedFileRequest,
    newnewapi.EmptyResponse,
    `${BASE_URL_UPLOAD}/remove_uploaded_file`,
    'post',
    payload
  );

export const startVideoProcessing = (
  payload: newnewapi.StartVideoProcessingRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.StartVideoProcessingRequest,
    newnewapi.StartVideoProcessingResponse
  >(
    newnewapi.StartVideoProcessingRequest,
    newnewapi.StartVideoProcessingResponse,
    `${BASE_URL_UPLOAD}/start_video_processing`,
    'post',
    payload
  );

export const stopVideoProcessing = (
  payload: newnewapi.StopVideoProcessingRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.StopVideoProcessingRequest,
    newnewapi.StopVideoProcessingResponse
  >(
    newnewapi.StopVideoProcessingRequest,
    newnewapi.StopVideoProcessingResponse,
    `${BASE_URL_UPLOAD}/stop_video_processing`,
    'post',
    payload
  );
