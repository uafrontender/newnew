import { newnewapi } from 'newnew-api';
import { UseQueryOptions, useQuery } from 'react-query';
import { getRoom } from '../../api/endpoints/chat';

const useMyChatRoom = (
  selectedChatRoomId: number,
  options?: Omit<
    UseQueryOptions<newnewapi.IChatRoom, any>,
    'queryKey' | 'queryFn'
  >
) => {
  const query = useQuery(
    ['private', 'getMyChatRoom', selectedChatRoomId],
    async ({ signal }) => {
      const payload = new newnewapi.GetRoomRequest({
        roomId: selectedChatRoomId,
      });

      const res = await getRoom(payload, signal);

      if (!res?.data || res.error) {
        throw new Error('Request failed');
      }

      return res.data;
    },
    {
      onError: (error) => {
        console.error(error);
      },
      ...(options || {}),
    } as Omit<UseQueryOptions<newnewapi.IChatRoom, any>, 'queryKey' | 'queryFn'>
  );

  return query;
};

export default useMyChatRoom;
