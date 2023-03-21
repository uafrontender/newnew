import { newnewapi } from 'newnew-api';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';

import { searchCreators } from '../../api/endpoints/search';

interface IUseSearchCreators {
  loggedInUser: boolean;
  query: string;
  filter?: newnewapi.SearchCreatorsRequest.Filter;
  limit?: number;
}

const useSearchCreators = (
  params: IUseSearchCreators,
  options?: Omit<
    UseInfiniteQueryOptions<{
      creators: newnewapi.IUser[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >
) => {
  const query = useInfiniteQuery(
    [params.loggedInUser ? 'private' : 'public', 'getSearchCreators', params],
    async ({ pageParam, signal }) => {
      const payload = new newnewapi.SearchCreatorsRequest({
        query: params.query,
        paging: {
          pageToken: pageParam,
          ...(params.limit ? { limit: params.limit } : {}),
        },
        ...(params.filter ? { filter: params.filter } : {}),
      });

      const creatorsResponse = await searchCreators(payload, signal);

      if (!creatorsResponse.data || creatorsResponse.error) {
        throw new Error('Request failed');
      }

      return {
        creators: creatorsResponse?.data?.creators || [],
        paging: creatorsResponse?.data?.paging,
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
        creators: newnewapi.IUser[];
        paging: newnewapi.IPagingResponse | null | undefined;
      }>,
      'queryKey' | 'queryFn'
    >
  );

  return query;
};

export default useSearchCreators;
