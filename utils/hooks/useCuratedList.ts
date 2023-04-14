import { useEffect, useContext } from 'react';
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query';
import { newnewapi } from 'newnew-api';

import { getCuratedPosts } from '../../api/endpoints/post';
import switchPostType from '../switchPostType';
import { ChannelsContext } from '../../contexts/channelsContext';
import { SocketContext } from '../../contexts/socketContext';

interface IUseCuratedList {
  loggedInUser: boolean;
  curatedListType: newnewapi.CuratedListType;
  postId?: string;
}

const useCuratedList = (
  params: IUseCuratedList,
  options?: Omit<UseQueryOptions<newnewapi.Post[], any>, 'queryKey' | 'queryFn'>
) => {
  const query = useQuery(
    [
      params.loggedInUser ? 'private' : 'public',
      'fetchCuratedList',
      params.curatedListType,
      params.postId,
    ],
    async ({ signal }) => {
      const getPostPayload = new newnewapi.GetCuratedPostsRequest({
        curatedListType: params.curatedListType,
      });

      const res = await getCuratedPosts(getPostPayload, signal);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Post not found');

      return res.data.posts;
    },
    {
      onError: (error) => {
        console.error(error);
      },
      ...options,
    } as Omit<UseQueryOptions<newnewapi.IPost[], any>, 'queryKey' | 'queryFn'>
  );

  let posts: newnewapi.IPost[] | undefined = query.data;

  if (
    posts &&
    params.curatedListType === newnewapi.CuratedListType.MORE_LIKE_THIS &&
    params.postId
  ) {
    const postsWithoutCurrent = posts?.filter(
      (post) => switchPostType(post)[0].postUuid !== params.postId
    );

    if (posts.length === postsWithoutCurrent?.length) {
      posts = posts.slice(0, -1);
    } else {
      posts = postsWithoutCurrent;
    }
  }

  return {
    ...query,
    data: posts || [],
  };
};

export const useCuratedListSubscription = ({
  curatedListType,
  loggedInUser,
  postId,
}: {
  curatedListType: newnewapi.CuratedListType;
  loggedInUser: boolean;
  postId?: string;
}) => {
  const queryClient = useQueryClient();

  const { socketConnection, isSocketConnected } = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  useEffect(() => {
    if (isSocketConnected) {
      addChannel(curatedListType.toString(), {
        curatedListUpdates: {
          type: curatedListType,
        },
      });
    }

    return () => {
      removeChannel(curatedListType.toString());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSocketConnected]);

  useEffect(() => {
    const handlerSocketCuratedListUpdated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CuratedListUpdated.decode(arr);

      if (decoded && decoded.posts) {
        queryClient.setQueriesData(
          {
            queryKey: [
              loggedInUser ? 'private' : 'public',
              'fetchCuratedList',
              curatedListType,
              postId,
            ],
          },
          () => decoded.posts
        );
      }
    };

    if (socketConnection) {
      socketConnection?.on(
        'CuratedListUpdated',
        handlerSocketCuratedListUpdated
      );
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off(
          'CuratedListUpdated',
          handlerSocketCuratedListUpdated
        );
      }
    };
  }, [loggedInUser, postId, curatedListType, queryClient, socketConnection]);
};

export default useCuratedList;
