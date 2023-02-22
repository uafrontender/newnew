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

interface IUsePost {
  loggedInUser: boolean;
  postUuid: string;
}

type TUpdatePostTitleMutation = {
  postUuid: string;
  title: string;
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

  return { ...query, updatePostTitleMutation };
};

export default usePost;
