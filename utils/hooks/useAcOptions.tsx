/* eslint-disable no-plusplus */
import { newnewapi } from 'newnew-api';
import { useMemo } from 'react';
import { cloneDeep, uniqBy } from 'lodash';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQueryClient,
} from 'react-query';

import { fetchCurrentBidsForPost } from '../../api/endpoints/auction';
import useErrorToasts from './useErrorToasts';

export type TAcOptionWithHighestField = newnewapi.Auction.Option & {
  isHighest: boolean;
};

interface IUseAcOptions {
  postUuid: string;
  userUuid: string | undefined;
  loggedInUser: boolean;
}

const sortOptions = (
  unsortedArr: TAcOptionWithHighestField[],
  userUuid: string | undefined
) => {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < unsortedArr.length; i++) {
    // eslint-disable-next-line no-param-reassign
    unsortedArr[i].isHighest = false;
  }

  const highestOption = unsortedArr.sort(
    (a, b) =>
      (b?.totalAmount?.usdCents as number) -
      (a?.totalAmount?.usdCents as number)
  )[0];

  unsortedArr.forEach((option, i) => {
    if (i > 0) {
      // eslint-disable-next-line no-param-reassign
      option.isHighest = false;
    }
  });

  const optionsByUser = userUuid
    ? unsortedArr
        .filter((o) => o.creator?.uuid === userUuid)
        .sort((a, b) => (b.id as number) - (a.id as number))
    : [];

  const optionsSupportedByUser = userUuid
    ? unsortedArr
        .filter((o) => o.isSupportedByMe)
        .sort((a, b) => (b.id as number) - (a.id as number))
    : [];

  const workingArrSorted = unsortedArr.sort(
    (a, b) =>
      // Sort the rest by newest first
      (b.id as number) - (a.id as number)
  );

  const joinedArr = [
    ...(highestOption &&
    (highestOption.creator?.uuid === userUuid || highestOption.isSupportedByMe)
      ? [highestOption]
      : []),
    ...optionsByUser,
    ...optionsSupportedByUser,
    ...(highestOption && highestOption.creator?.uuid !== userUuid
      ? [highestOption]
      : []),
    ...workingArrSorted,
  ];

  const workingSortedUnique =
    joinedArr.length > 0 ? uniqBy(joinedArr, 'id') : [];

  const highestOptionIdx = (
    workingSortedUnique as TAcOptionWithHighestField[]
  ).findIndex((o) => o.id === highestOption.id);

  if (workingSortedUnique[highestOptionIdx]) {
    (
      workingSortedUnique[highestOptionIdx] as TAcOptionWithHighestField
    ).isHighest = true;
  }

  return workingSortedUnique;
};

const useAcOptions = (
  params: IUseAcOptions,
  options?: Omit<
    UseInfiniteQueryOptions<{
      acOptions: newnewapi.Auction.IOption[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >
) => {
  const queryClient = useQueryClient();
  const { showErrorToastPredefined, showErrorToastCustom } = useErrorToasts();

  const query = useInfiniteQuery(
    [params.loggedInUser ? 'private' : 'public', 'getAcOptions', params],
    async ({ pageParam }) => {
      const payload = new newnewapi.GetAcOptionsRequest({
        postUuid: params.postUuid,
        paging: {
          pageToken: pageParam,
        },
      });

      const optionsResponse = await fetchCurrentBidsForPost(payload);

      if (!optionsResponse.data || optionsResponse.error) {
        throw new Error('Request failed');
      }

      const paging = optionsResponse?.data?.paging?.nextPageToken
        ? optionsResponse?.data?.paging
        : {};

      return {
        acOptions: optionsResponse?.data?.options || [],
        paging,
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
        acOptions: newnewapi.Auction.IOption[];
        paging: newnewapi.IPagingResponse | null | undefined;
      }>,
      'queryKey' | 'queryFn'
    >
  );

  const processedOptions = useMemo(() => {
    const flatOptions = query?.data
      ? query?.data?.pages.map((page) => page.acOptions).flat()
      : [];

    if (flatOptions.length === 0)
      return flatOptions as TAcOptionWithHighestField[];

    return sortOptions(
      flatOptions as TAcOptionWithHighestField[],
      params.userUuid
    );
  }, [query.data, params.userUuid]);

  const addOrUpdateAcOptionMutation = useMutation({
    mutationFn: (option: newnewapi.Auction.IOption) =>
      new Promise((res) => {
        res(option);
      }),
    onSuccess: (_, newOrUpdatedOption) => {
      queryClient.setQueryData(
        [params.loggedInUser ? 'private' : 'public', 'getAcOptions', params],
        // @ts-ignore
        (
          data:
            | InfiniteData<{
                acOptions: newnewapi.Auction.IOption[];
                paging: newnewapi.IPagingResponse | null | undefined;
              }>
            | undefined
        ) => {
          if (data) {
            const workingData = cloneDeep(data);

            let optionExists = false;

            for (let k = 0; k < workingData.pages.length; k++) {
              const optionIndex = workingData.pages[k].acOptions.findIndex(
                (o) => o.id === newOrUpdatedOption.id
              );

              if (optionIndex !== -1) {
                workingData.pages[k].acOptions[optionIndex] = {
                  ...workingData.pages[k].acOptions[optionIndex],
                  ...newOrUpdatedOption,
                };

                workingData.pages[k].acOptions[optionIndex].isSupportedByMe = data.pages[k].acOptions[optionIndex].isSupportedByMe;
                optionExists = true;
                break;
              }
            }

            if (!optionExists) {
              workingData.pages[0].acOptions = [
                newOrUpdatedOption,
                ...workingData.pages[0].acOptions,
              ];
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

  const removeAcOptionMutation = useMutation({
    mutationFn: (option: newnewapi.Auction.IOption) =>
      new Promise((res) => {
        res(option);
      }),
    onSuccess: (_, deletedOption) => {
      queryClient.setQueryData(
        [params.loggedInUser ? 'private' : 'public', 'getAcOptions', params],
        // @ts-ignore
        (
          data:
            | InfiniteData<{
                acOptions: newnewapi.Auction.IOption[];
                paging: newnewapi.IPagingResponse | null | undefined;
              }>
            | undefined
        ) => {
          if (data) {
            const workingData = cloneDeep(data);

            for (let k = 0; k < workingData.pages.length; k++) {
              const optionIndex = workingData.pages[k].acOptions.findIndex(
                (o) => o.id === deletedOption.id
              );

              if (optionIndex !== -1) {
                workingData.pages[k].acOptions = workingData.pages[
                  k
                ].acOptions.filter((o) => o.id !== deletedOption.id);
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
        showErrorToastPredefined(undefined);
      }
    },
  });

  return {
    processedOptions,
    addOrUpdateAcOptionMutation,
    removeAcOptionMutation,
    ...query,
  };
};

export default useAcOptions;
