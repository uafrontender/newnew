import { useCallback, useEffect, useMemo, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';

import { getMessages } from '../../api/endpoints/chat';
import { TCommentWithReplies } from '../../components/interfaces/tcomment';

interface IUsePostComments {
  loggedInUser: boolean;
  commentsRoomId: number;
}

const processComments = (
  commentsRaw: Array<newnewapi.IChatMessage | TCommentWithReplies>
): TCommentWithReplies[] => {
  let lastParentIdx;
  const goalArr: TCommentWithReplies[] = [];

  const workingArr = [...commentsRaw];

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

  // const processedComments = useMemo(
  //   () => processComments(flatComments),
  //   [flatComments]
  // );
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

  useEffect(() => {
    if (flatComments) {
      setProcessedComments(() => processComments(flatComments));
    }
  }, [flatComments]);

  return { processedComments, handleOpenCommentProgrammatically, ...query };
};

export default usePostComments;
