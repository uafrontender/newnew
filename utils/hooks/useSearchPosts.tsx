import { newnewapi } from 'newnew-api';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';

import { searchPosts } from '../../api/endpoints/search';

interface IUseSearchPosts {
  loggedInUser: boolean;
  query: string;
  searchType: newnewapi.SearchPostsRequest.SearchType;
  filters: newnewapi.Post.Filter[];
  sorting: newnewapi.PostSorting;
  limit?: number;
}

const useSearchPosts = (
  params: IUseSearchPosts,
  options?: Omit<
    UseInfiniteQueryOptions<{
      posts: newnewapi.IPost[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >
) => {
  const query = useInfiniteQuery(
    [params.loggedInUser ? 'private' : 'public', 'getSearchPosts', params],
    async ({ pageParam, signal }) => {
      const payload = new newnewapi.SearchPostsRequest({
        query: params.query,
        searchType: params.searchType,
        sorting: params.sorting,
        filters: params.filters,
        paging: {
          pageToken: pageParam,
          ...(params.limit ? { limit: params.limit } : {}),
        },
      });

      const postsResponse = await searchPosts(payload, signal);

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

export default useSearchPosts;
