import { newnewapi } from 'newnew-api';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { getMyRooms } from '../../api/endpoints/chat';

interface IUseMyChatRooms {
  roomKind?: newnewapi.ChatRoom.Kind;
  searchQuery?: string;
  announcementsName: string;
  myRole?: newnewapi.ChatRoom.MyRole;
  limit?: number;
}

const useMyChatRooms = (
  params: IUseMyChatRooms,
  options?: Omit<
    UseInfiniteQueryOptions<{
      chatrooms: newnewapi.IChatRoom[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >,
  additionalKey?: string
) => {
  // TODO: Add logic to request to show all announcements
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addAnnouncements =
    !!params.searchQuery &&
    params.announcementsName.includes(params.searchQuery);

  const query = useInfiniteQuery(
    [
      'private',
      'getMyRooms',
      ...(additionalKey ? [additionalKey] : []),
      params,
    ],
    async ({ pageParam, signal }) => {
      const payload = new newnewapi.GetMyRoomsRequest({
        ...(params.roomKind ? { roomKind: params.roomKind } : {}),
        ...(params.searchQuery ? { searchQuery: params.searchQuery } : {}),
        ...(params.myRole ? { myRole: params.myRole } : {}),
        paging: {
          pageToken: pageParam,
          ...(params.limit ? { limit: params.limit } : { limit: 50 }),
        },
      });

      const chatroomResponse = await getMyRooms(payload, signal);

      if (!chatroomResponse?.data || chatroomResponse.error) {
        throw new Error('Request failed');
      }

      return {
        chatrooms: chatroomResponse?.data?.rooms || [],
        paging: chatroomResponse?.data?.paging,
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
        chatrooms: newnewapi.IChatRoom[];
        paging: newnewapi.IPagingResponse | null | undefined;
      }>,
      'queryKey' | 'queryFn'
    >
  );

  return query;
};

export default useMyChatRooms;
