import { newnewapi } from 'newnew-api';
import { BASE_URL, fetchProtobuf } from '../apiConfigs';

const BASE_URL_POST = `${BASE_URL}/post`;

export const createPost = (
  payload: newnewapi.CreatePostRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.CreatePostRequest, newnewapi.CreatePostResponse>({
    reqT: newnewapi.CreatePostRequest,
    resT: newnewapi.CreatePostResponse,
    url: `${BASE_URL_POST}/create_post`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const setPostThumbnail = (
  payload: newnewapi.SetPostThumbnailRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SetPostThumbnailRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.SetPostThumbnailRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_POST}/set_post_thumbnail`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const setPostCoverImage = (
  payload: newnewapi.SetPostCoverImageRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.SetPostCoverImageRequest,
    newnewapi.SetPostCoverImageResponse
  >({
    reqT: newnewapi.SetPostCoverImageRequest,
    resT: newnewapi.SetPostCoverImageResponse,
    url: `${BASE_URL_POST}/set_post_cover_image`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const markPost = (
  payload: newnewapi.MarkPostRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.MarkPostRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.MarkPostRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_POST}/mark_post`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const setPostTitle = (
  payload: newnewapi.SetPostTitleRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.SetPostTitleRequest, newnewapi.Post>({
    reqT: newnewapi.SetPostTitleRequest,
    resT: newnewapi.Post,
    url: `${BASE_URL_POST}/set_post_title`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const deleteMyPost = (
  payload: newnewapi.DeleteMyPostRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.DeleteMyPostRequest, newnewapi.EmptyResponse>({
    reqT: newnewapi.DeleteMyPostRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_POST}/delete_my_post`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const uploadPostResponse = (
  payload: newnewapi.UploadPostResponseRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.UploadPostResponseRequest, newnewapi.Post>({
    reqT: newnewapi.UploadPostResponseRequest,
    resT: newnewapi.Post,
    url: `${BASE_URL_POST}/upload_post_response`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const uploadAdditionalPostResponse = (
  payload: newnewapi.UploadAdditionalPostResponseRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.UploadAdditionalPostResponseRequest, newnewapi.Post>({
    reqT: newnewapi.UploadAdditionalPostResponseRequest,
    resT: newnewapi.Post,
    url: `${BASE_URL_POST}/upload_additional_post_response`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const deleteAdditionalPostResponse = (
  payload: newnewapi.DeleteAdditionalPostResponseRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.DeleteAdditionalPostResponseRequest,
    newnewapi.EmptyResponse
  >({
    reqT: newnewapi.DeleteAdditionalPostResponseRequest,
    resT: newnewapi.EmptyResponse,
    url: `${BASE_URL_POST}/delete_additional_post_response`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const fetchPostByUUID = (
  payload: newnewapi.GetPostRequest,
  signal?: RequestInit['signal'],
  accessTokenFromSSRCookie?: string
) =>
  fetchProtobuf<newnewapi.GetPostRequest, newnewapi.Post>({
    reqT: newnewapi.GetPostRequest,
    resT: newnewapi.Post,
    url: `${BASE_URL_POST}/get_post`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const fetchUsersPosts = (
  payload: newnewapi.GetUserPostsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetUserPostsRequest,
    newnewapi.PagedCountedPostsResponse
  >({
    reqT: newnewapi.GetUserPostsRequest,
    resT: newnewapi.PagedCountedPostsResponse,
    url: `${BASE_URL_POST}/get_user_posts`,
    payload,
    ...(signal ? { signal } : {}),
  });

// Fetch posts of different types (mainly, homepage)
export const fetchCuratedPosts = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.NonPagedPostsResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.NonPagedPostsResponse,
    url: `${BASE_URL_POST}/get_curated_posts`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const fetchFeaturedCreatorPosts = (
  payload: newnewapi.EmptyRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.EmptyRequest, newnewapi.NonPagedPostsResponse>({
    reqT: newnewapi.EmptyRequest,
    resT: newnewapi.NonPagedPostsResponse,
    url: `${BASE_URL_POST}/get_featured_creators_posts`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const fetchForYouPosts = (
  payload: newnewapi.PagedRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.PagedRequest, newnewapi.PagedPostsResponse>({
    reqT: newnewapi.PagedRequest,
    resT: newnewapi.PagedPostsResponse,
    url: `${BASE_URL_POST}/get_for_you_posts`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const fetchBiggestPosts = (
  payload: newnewapi.PagedRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.PagedRequest, newnewapi.PagedPostsResponse>({
    reqT: newnewapi.PagedRequest,
    resT: newnewapi.PagedPostsResponse,
    url: `${BASE_URL_POST}/get_biggest_posts`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const fetchMoreLikePosts = (
  payload: newnewapi.GetSimilarPostsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.GetSimilarPostsRequest, newnewapi.PagedPostsResponse>(
    {
      reqT: newnewapi.GetSimilarPostsRequest,
      resT: newnewapi.PagedPostsResponse,
      url: `${BASE_URL_POST}/get_similar_posts`,
      payload,
      ...(signal ? { signal } : {}),
    }
  );

export const getMyUrgentPosts = (
  payload: newnewapi.PagedRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<newnewapi.PagedRequest, newnewapi.PagedPostsResponse>({
    reqT: newnewapi.PagedRequest,
    resT: newnewapi.PagedPostsResponse,
    url: `${BASE_URL_POST}/get_my_urgent_posts`,
    payload,
    ...(signal ? { signal } : {}),
  });

export const getCuratedPosts = (
  payload: newnewapi.GetCuratedPostsRequest,
  signal?: RequestInit['signal']
) =>
  fetchProtobuf<
    newnewapi.GetCuratedPostsRequest,
    newnewapi.NonPagedPostsResponse
  >({
    reqT: newnewapi.GetCuratedPostsRequest,
    resT: newnewapi.NonPagedPostsResponse,
    url: `${BASE_URL_POST}/get_curated_posts`,
    payload,
    ...(signal ? { signal } : {}),
  });
