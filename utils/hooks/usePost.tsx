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

type TUpdatePostStatusMutation = {
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
    async ({ signal }) => {
      const getPostPayload = new newnewapi.GetPostRequest({
        postUuid: params.postUuid,
      });

      const res = await fetchPostByUUID(getPostPayload, signal);

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

  const updatePostMutation = useMutation({
    mutationFn: (updatedPost: newnewapi.IPost) =>
      new Promise((res) => {
        res(updatedPost);
      }),
    onSuccess: (_, updatedPost) => {
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

            return { ...workingData, ...updatedPost };
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

  return {
    ...query,
    updatePostTitleMutation,
    updatePostStatusMutation,
    updatePostMutation,
  };
};

export default usePost;
