import React, {
  useEffect,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { newnewapi } from 'newnew-api';
import { useAppSelector } from '../redux-store/store';
import useDebouncedValue from '../utils/hooks/useDebouncedValue';

interface IChatsContext {
  activeChatRoom: newnewapi.IChatRoom | null;
  searchChatroom: string;
  chatsDraft: { roomId: number | Long; text: string }[];
  setActiveChatRoom: (chatRoom: newnewapi.IChatRoom | null) => void;
  setSearchChatroom: (str: string) => void;
  addInputValueIntoChatsDraft: (roomId: number | Long, text: string) => void;
  removeInputValueFromChatsDraft: (roomId: number | Long) => void;
  restDraft: () => void;
}

const ChatsContext = createContext<IChatsContext>({
  activeChatRoom: null,
  searchChatroom: '',
  chatsDraft: [],
  setActiveChatRoom: (chatRoom: newnewapi.IChatRoom | null) => {},
  setSearchChatroom: (str: string) => {},
  addInputValueIntoChatsDraft: (roomId: number | Long, text: string) => {},
  removeInputValueFromChatsDraft: (roomId: number | Long) => {},
  restDraft: () => {},
});

interface IChatsProvider {
  children: React.ReactNode;
}

export const ChatsProvider: React.FC<IChatsProvider> = ({ children }) => {
  const user = useAppSelector((state) => state.user);

  // TODO: make it as initial data for use query ????
  const [activeChatRoom, setActiveChatRoom] =
    useState<newnewapi.IChatRoom | null>(null);
  const [searchChatroom, setSearchChatroom] = useState<string>('');

  const [chatsDraft, setChatsDraft] = useState<
    { roomId: number | Long; text: string }[]
  >([]);

  const removeInputValueFromChatsDraft = useCallback(
    (roomId: number | Long) => {
      setChatsDraft((prevState) => [
        ...prevState.filter((chatDraft) => chatDraft.roomId !== roomId),
      ]);
    },
    []
  );

  const addInputValueIntoChatsDraft = useCallback(
    (roomId: number | Long, text: string) => {
      setChatsDraft((prevState) => {
        const draft = prevState.filter(
          (chatDraft) => chatDraft.roomId === roomId
        )[0];

        if (draft) {
          return [
            ...prevState.filter((chatDraft) => chatDraft.roomId !== roomId),
            { roomId, text },
          ];
        }

        return [...prevState, { roomId, text }];
      });
    },
    []
  );

  const restDraft = useCallback(() => {
    setChatsDraft([]);
  }, []);

  const resetState = useCallback(() => {
    setActiveChatRoom(null);
    setSearchChatroom('');
    setChatsDraft([]);
  }, []);

  const userWasLoggedIn = useRef(false);

  useEffect(() => {
    if (userWasLoggedIn.current && !user.loggedIn) {
      resetState();
    }

    if (user.loggedIn) {
      userWasLoggedIn.current = true;
    }
  }, [user.loggedIn, resetState]);

  const searchChatroomDebounced = useDebouncedValue(searchChatroom, 500);

  const contextValue = useMemo(
    () => ({
      activeChatRoom,
      searchChatroom: searchChatroomDebounced,
      chatsDraft,
      setActiveChatRoom,
      setSearchChatroom,
      addInputValueIntoChatsDraft,
      removeInputValueFromChatsDraft,
      restDraft,
    }),
    [
      activeChatRoom,
      searchChatroomDebounced,
      chatsDraft,
      setActiveChatRoom,
      setSearchChatroom,
      addInputValueIntoChatsDraft,
      removeInputValueFromChatsDraft,
      restDraft,
    ]
  );

  return (
    <ChatsContext.Provider value={contextValue}>
      {children}
    </ChatsContext.Provider>
  );
};

export function useGetChats() {
  const context = useContext(ChatsContext);
  if (!context)
    throw new Error('useGetChat must be used inside a `ChatProvider`');
  return context;
}
