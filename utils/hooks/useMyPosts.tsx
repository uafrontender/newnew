import { newnewapi } from 'newnew-api';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';

import { getMyPosts } from '../../api/endpoints/user';

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
  const query = useInfiniteQuery(
    ['private', 'getMyPosts', params],
    async ({ pageParam }) => {
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

      const postsResponse = await getMyPosts(payload);

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
    } as Omit<
      UseInfiniteQueryOptions<{
        posts: newnewapi.IPost[];
        paging: newnewapi.IPagingResponse | null | undefined;
      }>,
      'queryKey' | 'queryFn'
    >
  );

  return query;
};

export default useMyPosts;
