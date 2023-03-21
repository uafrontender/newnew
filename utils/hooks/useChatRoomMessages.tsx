import { newnewapi } from 'newnew-api';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { getMessages } from '../../api/endpoints/chat';
import Long from 'long';

interface IUseChatRoomMessages {
  roomId: number | Long | null | undefined;
  limit?: number;
}

const useChatRoomMessages = (
  params: IUseChatRoomMessages,
  options?: Omit<
    UseInfiniteQueryOptions<{
      messages: newnewapi.IChatMessage[];
      paging: newnewapi.IPagingResponse | null | undefined;
    }>,
    'queryKey' | 'queryFn'
  >
) => {
  const query = useInfiniteQuery(
    ['private', 'getMessages', params],
    async ({ pageParam, signal }) => {
      const payload = new newnewapi.GetMessagesRequest({
        roomId: params.roomId,
        paging: {
          pageToken: pageParam,
          ...(params.limit ? { limit: params.limit } : { limit: 10 }),
        },
      });

      const chatroomMessagesResponse = await getMessages(payload, signal);

      if (!chatroomMessagesResponse.data || chatroomMessagesResponse.error) {
        throw new Error('Request failed');
      }

      return {
        messages: chatroomMessagesResponse?.data?.messages || [],
        paging: chatroomMessagesResponse?.data?.paging,
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
        messages: newnewapi.IChatRoom[];
        paging: newnewapi.IPagingResponse | null | undefined;
      }>,
      'queryKey' | 'queryFn'
    >
  );

  return query;
};

export default useChatRoomMessages;
