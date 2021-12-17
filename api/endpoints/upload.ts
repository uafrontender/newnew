import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

export const BASE_URL_UPLOAD = `${BASE_URL}/upload`;

export const getImageUploadUrl = (
  payload: newnewapi.GetImageUploadUrlRequest,
) => fetchProtobufProtectedIntercepted<
newnewapi.GetImageUploadUrlRequest, newnewapi.GetImageUploadUrlResponse>(
  newnewapi.GetImageUploadUrlRequest,
  newnewapi.GetImageUploadUrlResponse,
  `${BASE_URL_UPLOAD}/get_image_upload_url`,
  'post',
  payload,
);

export const getVideoUploadUrl = (
  payload: newnewapi.GetVideoUploadUrlRequest,
) => fetchProtobufProtectedIntercepted<
  newnewapi.GetVideoUploadUrlRequest, newnewapi.GetImageUploadUrlResponse>(
    newnewapi.GetVideoUploadUrlRequest,
    newnewapi.GetVideoUploadUrlResponse,
    `${BASE_URL_UPLOAD}/get_video_upload_url`,
    'post',
    payload,
  );
