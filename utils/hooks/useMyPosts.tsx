/* eslint-disable no-plusplus */
import { cloneDeep } from 'lodash';
import { newnewapi } from 'newnew-api';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQueryClient,
} from 'react-query';

import { getMyPosts } from '../../api/endpoints/user';
import switchPostType from '../switchPostType';
import useErrorToasts from './useErrorToasts';

interface IUseMyPosts {
  relation: newnewapi.GetRelatedToMePostsRequest.Relation;
  postsFilter?: newnewapi.Post.Filter;
  statusFilter?: newnewapi.GetRelatedToMePostsRequest.StatusFilter;
  limit?: number;
}

const useMyPosts = (
  params: IUseMyPosts,
  options?: Omit<
    UseInfiniteQueryOptions<{
      posts: newnewapi.IPost[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >
) => {
  const queryClient = useQueryClient();
  const { showErrorToastPredefined, showErrorToastCustom } = useErrorToasts();

  const query = useInfiniteQuery(
    ['private', 'getMyPosts', params],
    async ({ pageParam, signal }) => {
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: params.relation,
        paging: {
          pageToken: pageParam,
          ...(params.limit ? { limit: params.limit } : {}),
        },
        needTotalCount: true,
        ...(params.postsFilter ? { filter: params.postsFilter } : {}),
        ...(params.statusFilter ? { statusFilter: params.statusFilter } : {}),
      });

      const postsResponse = await getMyPosts(payload, signal);

      if (!postsResponse.data || postsResponse.error) {
        throw new Error('Request failed');
      }

      return {
        posts: postsResponse?.data?.posts || [],
        paging: postsResponse?.data?.paging,
      };
    },
    {
      getNextPageParam: (lastPage) => lastPage?.paging?.nextPageToken,
      onError: (error) => {
        console.error(error);
      },
      ...(options || {}),
      // Does not refetch on going back to the page (from creation)
    } as Omit<
      UseInfiniteQueryOptions<{
        posts: newnewapi.IPost[];
        paging: newnewapi.IPagingResponse | null | undefined;
      }>,
      'queryKey' | 'queryFn'
    >
  );

  const removePostMutation = useMutation({
    mutationFn: (postUuid: string) =>
      new Promise((res) => {
        res(postUuid);
      }),
    onSuccess: (_, postUuid) => {
      queryClient.setQueryData(
        ['private', 'getMyPosts', params],
        // @ts-ignore
        (
          data:
            | InfiniteData<{
                posts: newnewapi.IPost[];
                paging: newnewapi.IPagingResponse | null | undefined;
              }>
            | undefined
        ) => {
          if (data) {
            const workingData = cloneDeep(data);

            for (let k = 0; k < workingData.pages.length; k++) {
              const msgIndex = workingData.pages[k].posts.findIndex(
                (c) => switchPostType(c)[0].postUuid === postUuid
              );

              if (msgIndex !== -1) {
                workingData.pages[k].posts = workingData.pages[k].posts.filter(
                  (c) => switchPostType(c)[0].postUuid !== postUuid
                );
                break;
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
        showErrorToastPredefined();
      }
    },
  });

  return { ...query, removePostMutation };
};

export default useMyPosts;
