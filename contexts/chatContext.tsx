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
import { SocketContext } from './socketContext';
import { getTotalUnreadMessageCounts } from '../api/endpoints/chat';
import { useBundles } from './bundlesContext';
import { useAppState } from './appStateContext';
import useDebouncedValue from '../utils/hooks/useDebouncedValue';

interface IChatsContext {
  unreadCountForUser: number;
  unreadCountForCreator: number;
  unreadCount: number;
  mobileChatOpened: boolean;
  hiddenMessagesArea: boolean | null;
  activeChatRoom: newnewapi.IChatRoom | null;
  activeTab: newnewapi.ChatRoom.MyRole | undefined;
  searchChatroom: string;
  justSentMessage: boolean;
  chatsDraft: { roomId: number | Long; text: string }[];
  setJustSentMessage: (value: boolean) => void;
  setActiveChatRoom: (chatRoom: newnewapi.IChatRoom | null) => void;
  setActiveTab: (activeTab: newnewapi.ChatRoom.MyRole | undefined) => void;
  setHiddenMessagesArea: (hiddenMessagesArea: boolean | null) => void;
  setSearchChatroom: (str: string) => void;
  setMobileChatOpened: (mobileChatOpened: boolean) => void;
  addInputValueIntoChatsDraft: (roomId: number | Long, text: string) => void;
  removeInputValueFromChatsDraft: (roomId: number | Long) => void;
  restDraft: () => void;
}

const ChatsContext = createContext<IChatsContext>({
  unreadCountForUser: 0,
  unreadCountForCreator: 0,
  unreadCount: 0,
  mobileChatOpened: false,
  hiddenMessagesArea: null,
  activeChatRoom: null,
  activeTab: undefined,
  searchChatroom: '',
  justSentMessage: false,
  chatsDraft: [],
  setJustSentMessage: (value: boolean) => {},
  setActiveChatRoom: (chatRoom: newnewapi.IChatRoom | null) => {},
  setActiveTab: (activeTab: newnewapi.ChatRoom.MyRole | undefined) => {},
  setHiddenMessagesArea: (hiddenMessagesArea: boolean | null) => {},
  setSearchChatroom: (str: string) => {},
  setMobileChatOpened: (mobileChatOpened: boolean) => {},
  addInputValueIntoChatsDraft: (roomId: number | Long, text: string) => {},
  removeInputValueFromChatsDraft: (roomId: number | Long) => {},
  restDraft: () => {},
});

interface IChatsProvider {
  children: React.ReactNode;
}

export const ChatsProvider: React.FC<IChatsProvider> = ({ children }) => {
  const user = useAppSelector((state) => state.user);
  const { bundles } = useBundles();

  const [unreadCountForUser, setUnreadCountForUser] = useState<number>(0);
  const [unreadCountForCreator, setUnreadCountForCreator] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [mobileChatOpened, setMobileChatOpened] = useState<boolean>(false);
  const [hiddenMessagesArea, setHiddenMessagesArea] = useState<boolean | null>(
    null
  );
  const [activeChatRoom, setActiveChatRoom] =
    useState<newnewapi.IChatRoom | null>(null);
  const [searchChatroom, setSearchChatroom] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    newnewapi.ChatRoom.MyRole | undefined
  >();
  const [justSentMessage, setJustSentMessage] = useState<boolean>(false);
  const [chatsDraft, setChatsDraft] = useState<
    { roomId: number | Long; text: string }[]
  >([]);

  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  useEffect(() => {
    if (isMobileOrTablet) {
      setHiddenMessagesArea(true);
    } else {
      setHiddenMessagesArea(null);
    }
  }, [isMobileOrTablet]);

  const socketConnection = useContext(SocketContext);

  const setData = useCallback((data: newnewapi.TotalUnreadMessageCounts) => {
    setUnreadCountForCreator(data.unreadCountForCreator);
    setUnreadCountForUser(data.unreadCountForUser);
    setUnreadCount(data.unreadCountForCreator + data.unreadCountForUser);
  }, []);

  useEffect(() => {
    async function getUnread() {
      if (!user.loggedIn) return;
      try {
        const payload = new newnewapi.EmptyRequest();
        const res = await getTotalUnreadMessageCounts(payload);

        if (!res.data || res.error) {
          throw new Error(res.error?.message ?? 'Request failed');
        }

        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    getUnread();
  }, [user.loggedIn, setData, bundles?.length]);

  useEffect(() => {
    const socketHandlerMessageCreated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatUnreadCountsChanged.decode(arr);

      if (!decoded) return;

      setData(decoded.chatUnreadCounts as newnewapi.TotalUnreadMessageCounts);
    };

    if (user.loggedIn && socketConnection) {
      socketConnection?.on(
        'ChatUnreadCountsChanged',
        socketHandlerMessageCreated
      );
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off(
          'ChatUnreadCountsChanged',
          socketHandlerMessageCreated
        );
      }
    };
  }, [socketConnection, user.loggedIn, setData]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (justSentMessage) {
      timer = setTimeout(() => {
        setJustSentMessage(false);
      }, 500);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [justSentMessage]);

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
    setUnreadCountForUser(0);
    setUnreadCountForCreator(0);
    setUnreadCount(0);
    setMobileChatOpened(false);
    setHiddenMessagesArea(null);
    setActiveChatRoom(null);
    setSearchChatroom('');
    setActiveTab(undefined);
    setJustSentMessage(false);
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
      unreadCountForUser,
      unreadCountForCreator,
      unreadCount,
      mobileChatOpened,
      hiddenMessagesArea,
      activeChatRoom,
      searchChatroom: searchChatroomDebounced,
      activeTab,
      justSentMessage,
      chatsDraft,
      setJustSentMessage,
      setActiveTab,
      setActiveChatRoom,
      setMobileChatOpened,
      setHiddenMessagesArea,
      setSearchChatroom,
      addInputValueIntoChatsDraft,
      removeInputValueFromChatsDraft,
      restDraft,
    }),
    [
      unreadCount,
      unreadCountForUser,
      unreadCountForCreator,
      activeChatRoom,
      mobileChatOpened,
      hiddenMessagesArea,
      searchChatroomDebounced,
      activeTab,
      justSentMessage,
      chatsDraft,
      setJustSentMessage,
      setActiveTab,
      setActiveChatRoom,
      setMobileChatOpened,
      setHiddenMessagesArea,
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
