import { newnewapi } from 'newnew-api';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { getMyNotifications } from '../../api/endpoints/notification';

interface IUseMyNotifications {
  limit?: number;
}

const useMyNotifications = (
  params?: IUseMyNotifications,
  options?: Omit<
    UseInfiniteQueryOptions<{
      chatrooms: newnewapi.IChatRoom[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >
) => {
  const query = useInfiniteQuery(
    ['private', 'getMyNotifications', params],
    async ({ pageParam, signal }) => {
      const payload = new newnewapi.GetMyNotificationsRequest({
        paging: {
          pageToken: pageParam,
          ...(params?.limit ? { limit: params.limit } : { limit: 20 }),
        },
      });

      const response = await getMyNotifications(payload, signal);

      if (!response?.data || response.error) {
        throw new Error('Request failed');
      }

      return {
        notifications: response?.data?.notifications || [],
        paging: response?.data?.paging,
      };
    },
    {
      getNextPageParam: (lastPage) => lastPage?.paging?.nextPageToken,
      onError: (error) => {
        console.error(error);
      },
      refetchOnWindowFocus: false,
      ...(options || {}),
    } as Omit<
      UseInfiniteQueryOptions<{
        notifications: newnewapi.INotification[];
        paging: newnewapi.IPagingResponse | null | undefined;
      }>,
      'queryKey' | 'queryFn'
    >
  );

  return query;
};

export default useMyNotifications;
