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

import { fetchCurrentOptionsForMCPost } from '../../api/endpoints/multiple_choice';
import useErrorToasts from './useErrorToasts';

export type TMcOptionWithHighestField = newnewapi.MultipleChoice.Option & {
  isHighest: boolean;
};

interface IUseMcOptions {
  postUuid: string;
  userUuid: string | undefined;
  loggedInUser: boolean;
}

const sortOptions = (
  unsortedArr: TMcOptionWithHighestField[],
  userUuid: string | undefined
) => {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < unsortedArr.length; i++) {
    // eslint-disable-next-line no-param-reassign
    unsortedArr[i].isHighest = false;
  }

  const highestOption = unsortedArr.sort(
    (a, b) => (b?.voteCount as number) - (a?.voteCount as number)
  )[0];

  const optionsByUser = userUuid
    ? unsortedArr
        .filter((o) => o.creator?.uuid === userUuid)
        .sort((a, b) => (b?.voteCount as number) - (a?.voteCount as number))
    : [];

  const optionsSupportedByUser = userUuid
    ? unsortedArr
        .filter((o) => o.isSupportedByMe)
        .sort((a, b) => (b?.voteCount as number) - (a?.voteCount as number))
    : [];

  const workingArrSorted = unsortedArr.sort(
    (a, b) => (b?.voteCount as number) - (a?.voteCount as number)
  );

  const joinedArr = [
    ...(highestOption && highestOption.creator?.uuid === userUuid
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
    workingSortedUnique as TMcOptionWithHighestField[]
  ).findIndex((o) => o.id === highestOption.id);

  if (workingSortedUnique[highestOptionIdx]) {
    workingSortedUnique[highestOptionIdx].isHighest = true;
  }

  return workingSortedUnique;
};

const useMcOptions = (
  params: IUseMcOptions,
  options?: Omit<
    UseInfiniteQueryOptions<{
      mcOptions: newnewapi.MultipleChoice.IOption[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >
) => {
  const queryClient = useQueryClient();
  const { showErrorToastPredefined, showErrorToastCustom } = useErrorToasts();

  const query = useInfiniteQuery(
    [params.loggedInUser ? 'private' : 'public', 'getMcOptions', params],
    async ({ pageParam, signal }) => {
      const payload = new newnewapi.GetMcOptionsRequest({
        postUuid: params.postUuid,
        paging: {
          pageToken: pageParam,
        },
      });

      const optionsResponse = await fetchCurrentOptionsForMCPost(
        payload,
        signal
      );

      if (!optionsResponse.data || optionsResponse.error) {
        throw new Error('Request failed');
      }

      const paging = optionsResponse?.data?.paging?.nextPageToken
        ? optionsResponse?.data?.paging
        : {};

      return {
        mcOptions: optionsResponse?.data?.options || [],
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
        mcOptions: newnewapi.MultipleChoice.IOption[];
        paging: newnewapi.IPagingResponse | null | undefined;
      }>,
      'queryKey' | 'queryFn'
    >
  );

  const processedOptions = useMemo(() => {
    const flatOptions = query?.data
      ? query?.data?.pages.map((page) => page.mcOptions).flat()
      : [];

    if (flatOptions.length === 0)
      return flatOptions as TMcOptionWithHighestField[];

    return sortOptions(
      flatOptions as TMcOptionWithHighestField[],
      params.userUuid
    );
  }, [query.data, params.userUuid]);

  const addOrUpdateMcOptionMutation = useMutation({
    mutationFn: (option: newnewapi.MultipleChoice.IOption) =>
      new Promise((res) => {
        res(option);
      }),
    onSuccess: (_, newOrUpdatedOption) => {
      queryClient.setQueryData(
        [params.loggedInUser ? 'private' : 'public', 'getMcOptions', params],
        // @ts-ignore
        (
          data:
            | InfiniteData<{
                mcOptions: newnewapi.MultipleChoice.IOption[];
                paging: newnewapi.IPagingResponse | null | undefined;
              }>
            | undefined
        ) => {
          if (data) {
            const workingData = cloneDeep(data);

            let optionExists = false;

            for (let k = 0; k < workingData.pages.length; k++) {
              const optionIndex = workingData.pages[k].mcOptions.findIndex(
                (o) => o.id === newOrUpdatedOption.id
              );

              if (optionIndex !== -1) {
                workingData.pages[k].mcOptions[optionIndex] = {
                  ...workingData.pages[k].mcOptions[optionIndex],
                  ...newOrUpdatedOption,
                };

                // eslint-disable-next-line no-extra-boolean-cast
                if (!!data.pages[k].mcOptions[optionIndex].isSupportedByMe) {
                  workingData.pages[k].mcOptions[optionIndex].isSupportedByMe =
                    data.pages[k].mcOptions[optionIndex].isSupportedByMe;
                }
                optionExists = true;
                break;
              }
            }

            if (!optionExists) {
              workingData.pages[0].mcOptions = [
                newOrUpdatedOption,
                ...workingData.pages[0].mcOptions,
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

  const removeMcOptionMutation = useMutation({
    mutationFn: (option: newnewapi.MultipleChoice.IOption) =>
      new Promise((res) => {
        res(option);
      }),
    onSuccess: (_, deletedOption) => {
      queryClient.setQueryData(
        [params.loggedInUser ? 'private' : 'public', 'getMcOptions', params],
        // @ts-ignore
        (
          data:
            | InfiniteData<{
                mcOptions: newnewapi.MultipleChoice.IOption[];
                paging: newnewapi.IPagingResponse | null | undefined;
              }>
            | undefined
        ) => {
          if (data) {
            const workingData = cloneDeep(data);

            for (let k = 0; k < workingData.pages.length; k++) {
              const optionIndex = workingData.pages[k].mcOptions.findIndex(
                (o) => o.id === deletedOption.id
              );

              if (optionIndex !== -1) {
                workingData.pages[k].mcOptions = workingData.pages[
                  k
                ].mcOptions.filter((o) => o.id !== deletedOption.id);
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
    addOrUpdateMcOptionMutation,
    removeMcOptionMutation,
    ...query,
  };
};

export default useMcOptions;
