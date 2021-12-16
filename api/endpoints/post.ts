import { newnewapi } from 'newnew-api';
import {
  BASE_URL,
  fetchProtobufProtectedIntercepted,
} from '../apiConfigs';

export const BASE_URL_POST = `${BASE_URL}/post`;

export const createPost = (
  payload: newnewapi.CreatePostRequest,
) => fetchProtobufProtectedIntercepted<newnewapi.CreatePostRequest, newnewapi.Post>(
  newnewapi.CreatePostRequest,
  newnewapi.Post,
  `${BASE_URL_POST}/create_post`,
  'post',
  payload,
);
