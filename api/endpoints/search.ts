import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_CHAT = `${BASE_URL}/search`;

export const quickSearch = (payload: newnewapi.QuickSearchRequest, signal?: RequestInit['signal']) =>
  fetchProtobuf<newnewapi.QuickSearchRequest, newnewapi.QuickSearchResponse>(
    newnewapi.QuickSearchRequest,
    newnewapi.QuickSearchResponse,
    `${BASE_URL_CHAT}/quick_search`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined,
  );

export const searchPosts = (payload: newnewapi.SearchPostsRequest, signal?: RequestInit['signal']) =>
  fetchProtobuf<newnewapi.SearchPostsRequest, newnewapi.PagedPostsResponse>(
    newnewapi.SearchPostsRequest,
    newnewapi.PagedPostsResponse,
    `${BASE_URL_CHAT}/search_posts`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined,
  );

export const searchCreators = (payload: newnewapi.SearchCreatorsRequest, signal?: RequestInit['signal']) =>
  fetchProtobuf<
    newnewapi.SearchCreatorsRequest,
    newnewapi.SearchCreatorsResponse
  >(
    newnewapi.SearchCreatorsRequest,
    newnewapi.SearchCreatorsResponse,
    `${BASE_URL_CHAT}/search_creators`,
    'post',
    payload,
    {},
    'cors',
    'same-origin',
    signal ?? undefined,
  );
