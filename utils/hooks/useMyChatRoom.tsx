import { newnewapi } from 'newnew-api';
import {
  UseQueryOptions,
  useQuery,
  useMutation,
  useQueryClient,
  UseInfiniteQueryResult,
} from 'react-query';
import { getRoom, sendMessage } from '../../api/endpoints/chat';
import { useUserData } from '../../contexts/userDataContext';
import useErrorToasts from './useErrorToasts';

const useMyChatRoom = (
  selectedChatRoomId: number,
  options?: Omit<
    UseQueryOptions<newnewapi.IChatRoom, any>,
    'queryKey' | 'queryFn'
  >
) => {
  const { showErrorToastCustom, showErrorToastPredefined } = useErrorToasts();
  const queryClient = useQueryClient();
  const { userData } = useUserData();

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

  const sendMessageMutation = useMutation({
    mutationFn: async ([chatRoomId, message]: [number, string]) => {
      const payload = new newnewapi.SendMessageRequest({
        roomId: chatRoomId,
        content: {
          text: message,
        },
      });

      console.log(payload, 'payload');

      const res = await sendMessage(payload);

      throw new Error('test');

      if (!res?.data || res.error) {
        // 400 Error: Invalid message at purifyChatMessage
        throw new Error(res?.error?.message ?? 'Request failed');
      }

      return {
        message: res.data,
        chatRoomId,
      };
    },
    onSuccess: ({ chatRoomId }) => {
      queryClient.invalidateQueries([
        'private',
        'getMessages',
        { roomId: chatRoomId },
      ]);
    },
    onMutate: ([chatRoomId, textMessage]: [number, string]) => {
      queryClient.setQueriesData(
        { queryKey: ['private', 'getMessages', { roomId: chatRoomId }] },
        (oldData) => {
          console.log(oldData, 'oldData');

          const newMessage = new newnewapi.ChatMessage({
            content: new newnewapi.ChatMessage.Content({
              text: textMessage,
            }),
            createdAt: {
              seconds: new Date().getTime() / 1000,
            },
            isDeleted: false,
            parentId: 0,
            roomId: chatRoomId,
            sender: new newnewapi.User(userData),
            id: new Date().getTime(),
          });

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page, i) => {
              console.log(page, 'page');
              if (i === 0) {
                return {
                  ...page,
                  messages: [newMessage, ...page.messages],
                };
              }

              return page;
            }),
          };
        }
      );

      console.log(
        queryClient.getQueriesData(['private', 'getMyRooms']),
        'tesst'
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

  return {
    ...query,
    sendMessageMutation,
  };
};

export default useMyChatRoom;
