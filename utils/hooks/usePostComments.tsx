/* eslint-disable no-plusplus */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { newnewapi } from 'newnew-api';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQueryClient,
} from 'react-query';
import { cloneDeep, uniqBy } from 'lodash';

import { getComments } from '../../api/endpoints/comments';
import { TCommentWithReplies } from '../../components/interfaces/tcomment';
import useErrorToasts from './useErrorToasts';

interface IUsePostComments {
  loggedInUser: boolean;
  postUuid: string;
  parentCommentId?: number;
}

const processComments = (
  commentsRaw: Array<newnewapi.IChatMessage | TCommentWithReplies>
): TCommentWithReplies[] => {
  const workingArr = uniqBy(commentsRaw, 'id');

  const workingArrFiltered = workingArr.filter((c) => !c.isDeleted);

  return workingArrFiltered as TCommentWithReplies[];
};

const usePostComments = (
  params: IUsePostComments,
  options?: Omit<
    UseInfiniteQueryOptions<{
      comments: newnewapi.IChatMessage[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >
) => {
  const queryClient = useQueryClient();
  const { showErrorToastPredefined, showErrorToastCustom } = useErrorToasts();

  const query = useInfiniteQuery(
    [params.loggedInUser ? 'private' : 'public', 'getPostComments', params],
    async ({ pageParam, signal }) => {
      const payload = new newnewapi.GetCommentsRequest({
        postUuid: params.postUuid,
        ...(params?.parentCommentId
          ? {
              parentCommentId: params.parentCommentId,
            }
          : {}),
        paging: {
          pageToken: pageParam,
        },
      });

      const postsResponse = await getComments(payload, signal);

      if (!postsResponse.data || postsResponse.error) {
        throw new Error('Request failed');
      }

      return {
        comments: postsResponse?.data?.comments || [],
        paging: postsResponse?.data?.paging,
      };
    },
    {
      getNextPageParam: (lastPage) => lastPage?.paging?.nextPageToken,
      onError: (error) => {
        console.error(error);
      },
      ...(options || {}),
      refetchOnWindowFocus: false,
    } as Omit<
      UseInfiniteQueryOptions<{
        comments: newnewapi.IChatMessage[];
        paging: newnewapi.IPagingResponse | null | undefined;
      }>,
      'queryKey' | 'queryFn'
    >
  );

  const flatComments = useMemo(
    () =>
      query?.data ? query?.data?.pages.map((page) => page.comments).flat() : [],
    [query?.data]
  );

  const [processedComments, setProcessedComments] = useState(() =>
    flatComments ? processComments(flatComments) : []
  );

  const handleOpenCommentByIdx = useCallback((idxToOpen: number) => {
    setProcessedComments((curr) => {
      const working = [...curr];
      working[idxToOpen].isOpen = true;
      return working;
    });
  }, []);

  const handleToggleCommentRepliesById = useCallback(
    (idToOpen: number, newState: boolean) => {
      setProcessedComments((curr) => {
        const working = [...curr];
        const idxToOpen = working.findIndex((c) => c.id === idToOpen);
        working[idxToOpen].isOpen = newState;
        return working;
      });
    },
    []
  );

  const addCommentMutation = useMutation({
    mutationFn: (card: newnewapi.IChatMessage) =>
      new Promise((res) => {
        res(card);
      }),
    onSuccess: (_, newComment) => {
      queryClient.setQueryData(
        [params.loggedInUser ? 'private' : 'public', 'getPostComments', params],
        // @ts-ignore
        (
          data:
            | InfiniteData<{
                comments: newnewapi.IChatMessage[];
                paging: newnewapi.IPagingResponse | null | undefined;
              }>
            | undefined
        ) => {
          if (data) {
            const workingData = cloneDeep(data);
            workingData.pages = workingData.pages.map((page, i: number) => {
              if (i === 0) {
                // eslint-disable-next-line no-param-reassign
                page.comments = [newComment, ...page.comments];
              }
              return page;
            });

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

  const removeCommentMutation = useMutation({
    mutationFn: (card: newnewapi.IChatMessage) =>
      new Promise((res) => {
        res(card);
      }),
    onSuccess: (_, deletedComment) => {
      queryClient.setQueryData(
        [params.loggedInUser ? 'private' : 'public', 'getPostComments', params],
        // @ts-ignore
        (
          data:
            | InfiniteData<{
                comments: newnewapi.IChatMessage[];
                paging: newnewapi.IPagingResponse | null | undefined;
              }>
            | undefined
        ) => {
          if (data) {
            const workingData = cloneDeep(data);

            for (let k = 0; k < workingData.pages.length; k++) {
              const msgIndex = workingData.pages[k].comments.findIndex(
                (c) => c.id === deletedComment?.id
              );

              if (msgIndex !== -1) {
                workingData.pages[k].comments = workingData.pages[
                  k
                ].comments.filter((c) => c.id !== deletedComment.id);
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

  useEffect(() => {
    if (flatComments) {
      setProcessedComments(() => processComments(flatComments));
    }
  }, [flatComments]);

  return {
    processedComments,
    handleOpenCommentByIdx,
    handleToggleCommentRepliesById,
    addCommentMutation,
    removeCommentMutation,
    ...query,
  };
};

export default usePostComments;
