import { newnewapi } from 'newnew-api';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { getMyRooms } from '../../api/endpoints/chat';

interface IUseMyChatRooms {
  roomKind?: newnewapi.ChatRoom.Kind;
  searchQuery?: string;
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
  >
) => {
  const query = useInfiniteQuery(
    ['private', 'getMyRooms', params],
    async ({ pageParam }) => {
      const payload = new newnewapi.GetMyRoomsRequest({
        ...(params.roomKind ? { roomKind: params.roomKind } : {}),
        ...(params.searchQuery ? { searchQuery: params.searchQuery } : {}),
        ...(params.myRole ? { myRole: params.myRole } : {}),
        paging: {
          pageToken: pageParam,
          ...(params.limit ? { limit: params.limit } : { limit: 50 }),
        },
      });

      const chatroomResponse = await getMyRooms(payload);

      console.log(chatroomResponse, payload, 'chatroomResponse');

      if (!chatroomResponse.data || chatroomResponse.error) {
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
