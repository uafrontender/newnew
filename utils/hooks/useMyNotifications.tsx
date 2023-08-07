import { newnewapi } from 'newnew-api';
import { useCallback } from 'react';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQueryClient,
} from 'react-query';
import {
  getMyNotifications,
  markAllAsRead as fetchMarkAllAsRead,
  markAsRead,
} from '../../api/endpoints/notification';
import useErrorToasts from './useErrorToasts';

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

export const useMyNotificationsActions = () => {
  const queryClient = useQueryClient();
  const { showErrorToastPredefined, showErrorToastCustom } = useErrorToasts();

  const markAsReadMutation = useMutation({
    mutationFn: async (notification: newnewapi.INotification) => {
      if (notification.isRead) {
        return null;
      }

      const payload = new newnewapi.MarkAsReadRequest({
        notificationIds: [notification.id as number],
      });
      const res = await markAsRead(payload);

      if (res.error) {
        throw new Error(res.error?.message ?? 'Request failed');
      }

      return notification.id as number;
    },
    onSuccess: (notificationId: number | null) => {
      if (!notificationId) {
        return;
      }

      queryClient.setQueriesData<
        | InfiniteData<{
            notifications: newnewapi.INotification[];
            paging: newnewapi.IPagingResponse | null | undefined;
          }>
        | undefined
      >({ queryKey: ['private', 'getMyNotifications'] }, (oldData) => {
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
      });
    },
  });

  const markAllAsRead = useCallback(() => {
    queryClient.setQueriesData<
      | InfiniteData<{
          notifications: newnewapi.INotification[];
          paging: newnewapi.IPagingResponse | null | undefined;
        }>
      | undefined
    >({ queryKey: ['private', 'getMyNotifications'] }, (oldData) => {
      if (oldData) {
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            paging: page.paging,
            notifications: page.notifications.map((notification) => ({
              ...notification,
              isRead: true,
            })),
          })),
        };
      }

      return oldData;
    });
  }, [queryClient]);

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const payload = new newnewapi.EmptyRequest();
      const res = await fetchMarkAllAsRead(payload);

      if (res.error) {
        throw new Error(res.error?.message ?? 'Request failed');
      }
    },
    onSuccess: () => {
      markAllAsRead();
    },
    onError: (err: any) => {
      if (err?.message) {
        showErrorToastCustom(err?.message);
      } else {
        showErrorToastPredefined();
      }

      console.error(err);
    },
  });

  const addNewNotificationMutation = useMutation({
    mutationFn: (notification: newnewapi.INotification) =>
      new Promise((res) => {
        res(notification);
      }),
    onSuccess: (_, notification: newnewapi.INotification) => {
      if (!notification) {
        return;
      }

      queryClient.setQueriesData<
        | InfiniteData<{
            notifications: newnewapi.INotification[];
            paging: newnewapi.IPagingResponse | null | undefined;
          }>
        | undefined
      >({ queryKey: ['private', 'getMyNotifications'] }, (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map((page, i) => {
              if (i === 0) {
                return {
                  paging: page.paging,
                  notifications: [notification, ...page.notifications],
                };
              }

              return page;
            }),
          };
        }

        return oldData;
      });
    },
  });

  return {
    markAsReadMutation,
    markAllAsReadMutation,
    markAllAsRead,
    addNewNotificationMutation,
  };
};

export default useMyNotifications;
