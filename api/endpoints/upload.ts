import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
} from '../apiConfigs';

export const BASE_URL_UPLOAD = `${BASE_URL}/upload`;

export const getImageUploadUrl = (
  payload: newnewapi.GetImageUploadUrlRequest,
  token: string,
) => fetchProtobuf<newnewapi.GetImageUploadUrlRequest, newnewapi.GetImageUploadUrlResponse>(
  newnewapi.GetImageUploadUrlRequest,
  newnewapi.GetImageUploadUrlResponse,
  `${BASE_URL_UPLOAD}/get_image_upload_url`,
  'post',
  payload,
  {
    'x-auth-token': token,
  },
);
