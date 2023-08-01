import { newnewapi } from 'newnew-api';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQueryClient,
} from 'react-query';
import { getMyNotifications } from '../../api/endpoints/notification';

interface IUseMyNotifications {
  limit?: number;
}

const useMyNotifications = (
  params?: IUseMyNotifications,
  options?: Omit<
    UseInfiniteQueryOptions<{
      notifications: newnewapi.INotification[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >
) => {
  const queryClient = useQueryClient();

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

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      new Promise((res) => {
        res(notificationId);
      }),
    onSuccess: (_, notificationId: number) => {
      queryClient.setQueryData<
        | InfiniteData<{
            notifications: newnewapi.INotification[];
            paging: newnewapi.IPagingResponse | null | undefined;
          }>
        | undefined
      >(
        ['private', 'getMyNotifications', params],
        (
          oldData:
            | InfiniteData<{
                notifications: newnewapi.INotification[];
                paging: newnewapi.IPagingResponse | null | undefined;
              }>
            | undefined
        ) => {
          if (oldData) {
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                paging: page.paging,
                notifications: page.notifications.map((notification) => {
                  if (notification.id === notificationId) {
                    return {
                      ...notification,
                      isRead: true,
                    };
                  }
                  return notification;
                }),
              })),
            };
          }

          return oldData;
        }
      );
    },
  });

  return {
    ...query,
    markAsReadMutation,
  };
};

export default useMyNotifications;
