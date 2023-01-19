import { newnewapi } from 'newnew-api';
import { useMemo } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';

import { fetchCurrentOptionsForMCPost } from '../../api/endpoints/multiple_choice';

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
    joinedArr.length > 0 ? [...new Set(joinedArr)] : [];

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
  const query = useInfiniteQuery(
    [params.loggedInUser ? 'private' : 'public', 'getMcOptions', params],
    async ({ pageParam }) => {
      const payload = new newnewapi.GetMcOptionsRequest({
        postUuid: params.postUuid,
        paging: {
          pageToken: pageParam,
        },
      });

      const optionsResponse = await fetchCurrentOptionsForMCPost(payload);

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

  return { processedOptions, ...query };
};

export default useMcOptions;
