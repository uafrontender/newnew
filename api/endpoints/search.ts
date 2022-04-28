import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobufProtectedIntercepted } from '../apiConfigs';

export const BASE_URL_CHAT = `${BASE_URL}/search`;

export const quickSearchPostsAndCreators = (
  payload: newnewapi.QuickSearchPostsAndCreatorsRequest
) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.QuickSearchPostsAndCreatorsRequest,
    newnewapi.QuickSearchPostsAndCreatorsResponse
  >(
    newnewapi.QuickSearchPostsAndCreatorsRequest,
    newnewapi.QuickSearchPostsAndCreatorsResponse,
    `${BASE_URL_CHAT}/quick_search_posts_and_creators`,
    'post',
    payload
  );

export const searchPosts = (payload: newnewapi.SearchPostsRequest) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SearchPostsRequest,
    newnewapi.PagedPostsResponse
  >(
    newnewapi.SearchPostsRequest,
    newnewapi.PagedPostsResponse,
    `${BASE_URL_CHAT}/search_posts`,
    'post',
    payload
  );

export const searchCreators = (payload: newnewapi.SearchCreatorsRequest) =>
  fetchProtobufProtectedIntercepted<
    newnewapi.SearchCreatorsRequest,
    newnewapi.SearchCreatorsResponse
  >(
    newnewapi.SearchCreatorsRequest,
    newnewapi.SearchCreatorsResponse,
    `${BASE_URL_CHAT}/search_creators`,
    'post',
    payload
  );
