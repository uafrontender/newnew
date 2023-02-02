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

import { getMessages } from '../../api/endpoints/chat';
import { TCommentWithReplies } from '../../components/interfaces/tcomment';
import useErrorToasts from './useErrorToasts';

interface IUsePostComments {
  loggedInUser: boolean;
  commentsRoomId: number;
}

const processComments = (
  commentsRaw: Array<newnewapi.IChatMessage | TCommentWithReplies>
): TCommentWithReplies[] => {
  let lastParentIdx;
  const goalArr: TCommentWithReplies[] = [];

  const workingArr = uniqBy(commentsRaw, 'id');

  workingArr.forEach((rawItem, i) => {
    const workingItem = { ...rawItem };

    if (!rawItem.parentId || rawItem.parentId === 0) {
      lastParentIdx = undefined;

      workingItem.parentId = undefined;
      goalArr.push(workingItem as TCommentWithReplies);
    } else {
      lastParentIdx = goalArr.findIndex((o) => o.id === workingItem.parentId);

      if (lastParentIdx !== -1) {
        if (!goalArr[lastParentIdx].replies) {
          goalArr[lastParentIdx].replies = [];
        }

        // @ts-ignore
        const workingSubarr = [...goalArr[lastParentIdx].replies];

        goalArr[lastParentIdx].replies = [...workingSubarr, workingItem];
      }
    }
  });

  return goalArr;
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
    async ({ pageParam }) => {
      const payload = new newnewapi.GetMessagesRequest({
        roomId: params.commentsRoomId,
        paging: {
          pageToken: pageParam,
        },
      });

      const postsResponse = await getMessages(payload);

      if (!postsResponse.data || postsResponse.error) {
        throw new Error('Request failed');
      }

      return {
        comments: postsResponse?.data?.messages || [],
        paging: postsResponse?.data?.paging,
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

  const handleOpenCommentProgrammatically = useCallback((idxToOpen: number) => {
    setProcessedComments((curr) => {
      const working = [...curr];
      working[idxToOpen].isOpen = true;
      return working;
    });
  }, []);

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
            if (!newComment?.parentId) {
              workingData.pages = workingData.pages.map((page, i: number) => {
                if (i === 0) {
                  // eslint-disable-next-line no-param-reassign
                  page.comments = [newComment, ...page.comments];
                }
                return page;
              });

              return workingData;
            }

            for (let k = 0; k < workingData.pages.length; k++) {
              const parentMsgIndex = workingData.pages[k].comments.findIndex(
                (c) => c.id === newComment?.parentId
              );

              if (parentMsgIndex !== -1) {
                workingData.pages[k].comments = [
                  ...workingData.pages[k].comments.slice(0, parentMsgIndex + 1),
                  newComment,
                  ...workingData.pages[k].comments.slice(parentMsgIndex + 1),
                ];
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
    handleOpenCommentProgrammatically,
    addCommentMutation,
    removeCommentMutation,
    ...query,
  };
};

export default usePostComments;
