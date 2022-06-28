import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_CHAT = `${BASE_URL}/search`;

export const quickSearch = (payload: newnewapi.QuickSearchRequest) =>
  fetchProtobuf<newnewapi.QuickSearchRequest, newnewapi.QuickSearchResponse>(
    newnewapi.QuickSearchRequest,
    newnewapi.QuickSearchResponse,
    `${BASE_URL_CHAT}/quick_search`,
    'post',
    payload
  );

export const searchPosts = (payload: newnewapi.SearchPostsRequest) =>
  fetchProtobuf<newnewapi.SearchPostsRequest, newnewapi.PagedPostsResponse>(
    newnewapi.SearchPostsRequest,
    newnewapi.PagedPostsResponse,
    `${BASE_URL_CHAT}/search_posts`,
    'post',
    payload
  );

export const searchCreators = (payload: newnewapi.SearchCreatorsRequest) =>
  fetchProtobuf<
    newnewapi.SearchCreatorsRequest,
    newnewapi.SearchCreatorsResponse
  >(
    newnewapi.SearchCreatorsRequest,
    newnewapi.SearchCreatorsResponse,
    `${BASE_URL_CHAT}/search_creators`,
    'post',
    payload
  );
