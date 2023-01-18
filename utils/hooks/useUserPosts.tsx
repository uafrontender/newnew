import { newnewapi } from 'newnew-api';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';

import { fetchUsersPosts } from '../../api/endpoints/post';

interface IUseUserPosts {
  userUuid: string;
  loggedInUser: boolean;
  relation: newnewapi.GetUserPostsRequest.Relation;
  postsFilter: newnewapi.Post.Filter;
  limit?: number;
}

const useUserPosts = (
  params: IUseUserPosts,
  options?: Omit<
    UseInfiniteQueryOptions<{
      posts: newnewapi.IPost[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >
) => {
  const query = useInfiniteQuery(
    [params.loggedInUser ? 'private' : 'public', 'getUserPosts', params],
    async ({ pageParam }) => {
      const payload = new newnewapi.GetUserPostsRequest({
        userUuid: params.userUuid,
        relation: params.relation,
        paging: {
          pageToken: pageParam,
          ...(params.limit ? { limit: params.limit } : {}),
        },
        needTotalCount: true,
        ...(params.postsFilter ? { filter: params.postsFilter } : {}),
      });

      const postsResponse = await fetchUsersPosts(payload);

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

export default useUserPosts;
