import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from 'react-query';
import { newnewapi } from 'newnew-api';
import { cloneDeep } from 'lodash';

import { fetchPostByUUID } from '../../api/endpoints/post';
import useErrorToasts from './useErrorToasts';

import { TPostType } from '../switchPostType';

interface IUsePost {
  loggedInUser: boolean;
  postUuid: string;
}

type TUpdatePostTitleMutation = {
  postUuid: string;
  title: string;
};

export type TUpdatePostCoverImageMutation = {
  postUuid: string;
  coverImageUrl: string | undefined;
  target: 'announcement' | 'response';
};

export type TUpdatePostStatusMutation = {
  postUuid: string;
  postType: TPostType;
  status: newnewapi.Auction.Status | newnewapi.MultipleChoice.Status;
};

const usePost = (
  params: IUsePost,
  options?: Omit<UseQueryOptions<newnewapi.IPost, any>, 'queryKey' | 'queryFn'>
) => {
  const queryClient = useQueryClient();
  const { showErrorToastPredefined, showErrorToastCustom } = useErrorToasts();

  const query = useQuery(
    [
      params.loggedInUser ? 'private' : 'public',
      'fetchPostByUUID',
      params.postUuid,
    ],
    async () => {
      const getPostPayload = new newnewapi.GetPostRequest({
        postUuid: params.postUuid,
      });

      const res = await fetchPostByUUID(getPostPayload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Post not found');

      return res.data;
    },
    {
      onError: (error) => {
        console.error(error);
      },
      ...options,
    } as Omit<UseQueryOptions<newnewapi.IPost, any>, 'queryKey' | 'queryFn'>
  );

  const updatePostTitleMutation = useMutation({
    mutationFn: (newTitleParams: TUpdatePostTitleMutation) =>
      new Promise((res) => {
        res(newTitleParams);
      }),
    onSuccess: (_, newTitle) => {
      queryClient.setQueryData(
        [
          params.loggedInUser ? 'private' : 'public',
          'fetchPostByUUID',
          params.postUuid,
        ],
        // @ts-ignore
        (data: newnewapi.IPost | undefined) => {
          if (data) {
            const workingData = cloneDeep(data);

            if (workingData.auction) {
              workingData.auction.title = newTitle.title;
            } else if (workingData.multipleChoice) {
              workingData.multipleChoice.title = newTitle.title;
            }

            return workingData;
          }
          return data;
        }
      );
    },
    onError: (err: any) => {
      if (err?.message) {
        showErrorToastCustom(err?.message);
      } else {
        showErrorToastPredefined(undefined);
      }
    },
  });

  const updatePostStatusMutation = useMutation({
    mutationFn: (newStatusParams: TUpdatePostStatusMutation) =>
      new Promise((res) => {
        res(newStatusParams);
      }),
    onSuccess: (_, newStatusParams) => {
      queryClient.setQueryData(
        [
          params.loggedInUser ? 'private' : 'public',
          'fetchPostByUUID',
          params.postUuid,
        ],
        // @ts-ignore
        (data: newnewapi.IPost | undefined) => {
          if (data) {
            const workingData = cloneDeep(data);

            if (workingData.auction && newStatusParams.postType === 'ac') {
              workingData.auction.status =
                newStatusParams.status as newnewapi.Auction.Status;
            } else if (
              workingData.multipleChoice &&
              newStatusParams.postType === 'mc'
            ) {
              workingData.multipleChoice.status =
                newStatusParams.status as newnewapi.MultipleChoice.Status;
            }

            return workingData;
          }
          return data;
        }
      );
    },
    onError: (err: any) => {
      if (err?.message) {
        showErrorToastCustom(err?.message);
      } else {
        showErrorToastPredefined(undefined);
      }
    },
  });

  const updatePostCoverImageMutation = useMutation({
    mutationFn: (newTitlenewCoverImageParams: TUpdatePostCoverImageMutation) =>
      new Promise((res) => {
        res(newTitlenewCoverImageParams);
      }),
    onSuccess: (_, newCoverImage) => {
      queryClient.setQueryData(
        [
          params.loggedInUser ? 'private' : 'public',
          'fetchPostByUUID',
          params.postUuid,
        ],
        // @ts-ignore
        (data: newnewapi.IPost | undefined) => {
          if (data) {
            const workingData = cloneDeep(data);

            if (workingData.auction) {
              if (
                newCoverImage.target === 'announcement' &&
                workingData.auction?.announcement
              ) {
                workingData.auction.announcement.coverImageUrl =
                  newCoverImage.coverImageUrl;
              } else if (
                newCoverImage.target === 'response' &&
                workingData.auction?.response
              ) {
                workingData.auction.response.coverImageUrl =
                  newCoverImage.coverImageUrl;
              }
            } else if (workingData.multipleChoice) {
              if (
                newCoverImage.target === 'announcement' &&
                workingData.multipleChoice?.announcement
              ) {
                workingData.multipleChoice.announcement.coverImageUrl =
                  newCoverImage.coverImageUrl;
              } else if (
                newCoverImage.target === 'response' &&
                workingData.multipleChoice?.response
              ) {
                workingData.multipleChoice.response.coverImageUrl =
                  newCoverImage.coverImageUrl;
              }
            }

            return workingData;
          }
          return data;
        }
      );
    },
    onError: (err: any) => {
      if (err?.message) {
        showErrorToastCustom(err?.message);
      } else {
        showErrorToastPredefined(undefined);
      }
    },
  });

  return {
    ...query,
    updatePostTitleMutation,
    updatePostStatusMutation,
    updatePostCoverImageMutation,
  };
};

export default usePost;
