import { newnewapi } from 'newnew-api';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQueryClient,
} from 'react-query';
import { cloneDeep } from 'lodash';

import { getTinyUsersBlockedByMe } from '../../api/endpoints/user';
import useErrorToasts from './useErrorToasts';

interface IUseTinyUsersBlockedByMe {
  loggedInUser: boolean;
}

const useTinyUsersBlockedByMe = (
  params: IUseTinyUsersBlockedByMe,
  options?: Omit<
    UseInfiniteQueryOptions<{
      creators: newnewapi.IUser[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >
) => {
  const queryClient = useQueryClient();
  const { showErrorToastPredefined, showErrorToastCustom } = useErrorToasts();

  const query = useInfiniteQuery(
    ['private', 'getTinyUsersBlockedByMe', params],
    async ({ pageParam, signal }) => {
      const payload = new newnewapi.GetTinyUsersBlockedByMeRequest({
        paging: {
          pageToken: pageParam,
        },
      });

      const tinyUsersResponses = await getTinyUsersBlockedByMe(payload, signal);

      if (!tinyUsersResponses?.data || tinyUsersResponses.error) {
        throw new Error('Request failed');
      }

      return {
        users: tinyUsersResponses?.data?.users || [],
        paging: tinyUsersResponses?.data?.paging,
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
        users: newnewapi.ITinyUser[];
        paging: newnewapi.IPagingResponse | null | undefined;
      }>,
      'queryKey' | 'queryFn'
    >
  );

  const removeTinyUserMutation = useMutation({
    mutationFn: (userUuid: string) =>
      new Promise((res) => {
        res(userUuid);
      }),
    onSuccess: (_, userUuid) => {
      queryClient.setQueryData(
        ['private', 'getTinyUsersBlockedByMe', params],
        // @ts-ignore
        (
          data:
            | InfiniteData<{
                users: newnewapi.ITinyUser[];
                paging: newnewapi.IPagingResponse | null | undefined;
              }>
            | undefined
        ) => {
          if (data) {
            const workingData = cloneDeep(data);

            for (let k = 0; k < workingData.pages.length; k++) {
              const msgIndex = workingData.pages[k].users.findIndex(
                (u) => u.uuid === userUuid
              );

              if (msgIndex !== -1) {
                workingData.pages[k].users = workingData.pages[k].users.filter(
                  (u) => u.uuid !== userUuid
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

  return { ...query, removeTinyUserMutation };
};

export default useTinyUsersBlockedByMe;
