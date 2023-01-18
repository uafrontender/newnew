import { newnewapi } from 'newnew-api';
import { useMemo } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';

import { fetchCurrentBidsForPost } from '../../api/endpoints/auction';

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

  const optionsByVipUsers = unsortedArr
    .filter((o) => o.isCreatedBySubscriber)
    .sort((a, b) => (b.id as number) - (a.id as number));

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
    ...optionsByVipUsers,
    ...(highestOption && highestOption.creator?.uuid !== userUuid
      ? [highestOption]
      : []),
    ...workingArrSorted,
  ];

  const workingSortedUnique =
    joinedArr.length > 0 ? [...new Set(joinedArr)] : [];

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

  return { processedOptions, ...query };
};

export default useAcOptions;
