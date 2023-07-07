import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_CHAT = `${BASE_URL}/search`;

export const quickSearch = (
  payload: newnewapi.QuickSearchRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.QuickSearchRequest, newnewapi.QuickSearchResponse>({
    reqT: newnewapi.QuickSearchRequest,
    resT: newnewapi.QuickSearchResponse,
    url: `${BASE_URL_CHAT}/quick_search`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const searchPosts = (
  payload: newnewapi.SearchPostsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SearchPostsRequest, newnewapi.PagedPostsResponse>({
    reqT: newnewapi.SearchPostsRequest,
    resT: newnewapi.PagedPostsResponse,
    url: `${BASE_URL_CHAT}/search_posts`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const searchCreators = (
  payload: newnewapi.SearchCreatorsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.SearchCreatorsRequest,
    newnewapi.SearchCreatorsResponse
  >({
    reqT: newnewapi.SearchCreatorsRequest,
    resT: newnewapi.SearchCreatorsResponse,
    url: `${BASE_URL_CHAT}/search_creators`,
    payload,
    ...(signal ? { signal } : {}),
  });
