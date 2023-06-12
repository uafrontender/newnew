import React, {
  useEffect,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import useDebouncedValue from '../utils/hooks/useDebouncedValue';
import { useAppState } from './appStateContext';

interface IChatsContext {
  searchChatroom: string;
  chatsDraft: { roomId: number | Long; text: string }[];
  setSearchChatroom: (str: string) => void;
  addInputValueIntoChatsDraft: (roomId: number | Long, text: string) => void;
  removeInputValueFromChatsDraft: (roomId: number | Long) => void;
  resetDraft: () => void;
}

const ChatsContext = createContext<IChatsContext>({
  searchChatroom: '',
  chatsDraft: [],
  setSearchChatroom: (str: string) => {},
  addInputValueIntoChatsDraft: (roomId: number | Long, text: string) => {},
  removeInputValueFromChatsDraft: (roomId: number | Long) => {},
  resetDraft: () => {},
});

interface IChatsProvider {
  children: React.ReactNode;
}

export const ChatsProvider: React.FC<IChatsProvider> = ({ children }) => {
  const { userLoggedIn } = useAppState();

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

  const resetDraft = useCallback(() => {
    setChatsDraft([]);
  }, []);

  const resetState = useCallback(() => {
    setSearchChatroom('');
    setChatsDraft([]);
  }, []);

  const userWasLoggedIn = useRef(false);

  useEffect(() => {
    if (userWasLoggedIn.current && !userLoggedIn) {
      resetState();
    }

    if (userLoggedIn) {
      userWasLoggedIn.current = true;
    }
  }, [userLoggedIn, resetState]);

  const searchChatroomDebounced = useDebouncedValue(searchChatroom, 500);

  const contextValue = useMemo(
    () => ({
      searchChatroom: searchChatroomDebounced,
      chatsDraft,
      setSearchChatroom,
      addInputValueIntoChatsDraft,
      removeInputValueFromChatsDraft,
      resetDraft,
    }),
    [
      searchChatroomDebounced,
      chatsDraft,
      setSearchChatroom,
      addInputValueIntoChatsDraft,
      removeInputValueFromChatsDraft,
      resetDraft,
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
  if (!context) {
    throw new Error('useGetChat must be used inside a `ChatProvider`');
  }

  return context;
}
