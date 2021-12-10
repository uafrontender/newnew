import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobuf,
} from '../apiConfigs';

export const BASE_URL_POST = `${BASE_URL}/post`;

export const createPost = (
  payload: newnewapi.CreatePostRequest,
  token: string,
) => fetchProtobuf<newnewapi.CreatePostRequest, newnewapi.Post>(
  newnewapi.CreatePostRequest,
  newnewapi.Post,
  `${BASE_URL_POST}/create_post`,
  'post',
  payload,
  {
    'x-auth-token': token,
  },
);
