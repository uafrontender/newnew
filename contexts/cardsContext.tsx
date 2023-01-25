import { newnewapi } from 'newnew-api';
import React, { createContext, useMemo, useEffect, useContext } from 'react';
import {
  useMutation,
  useQuery,
  UseMutationResult,
  QueryClient,
} from 'react-query';

import { getCards, setPrimaryCard } from '../api/endpoints/card';
import { useAppSelector } from '../redux-store/store';
import { SocketContext } from './socketContext';

export const CardsContext = createContext<{
  cards: newnewapi.ICard[] | undefined;
  isCardsLoading: boolean;
  addCardMutation: UseMutationResult | undefined;
  setPrimaryCardMutation: UseMutationResult | undefined;
  fetchCards: () => void;
}>({
  cards: undefined,
  isCardsLoading: false,
  addCardMutation: undefined,
  fetchCards: () => {},
  setPrimaryCardMutation: undefined,
});

interface ICardsContextProvider {
  children: React.ReactNode;
}

const CardsContextProvider: React.FC<ICardsContextProvider> = ({
  children,
}) => {
  const queryClient = new QueryClient();

  const socketConnection = useContext(SocketContext);

  const user = useAppSelector((state) => state.user);

  const query = useQuery(
    ['private', 'getCards'],
    async () => {
      const payload = new newnewapi.EmptyRequest({});

      const res = await getCards(payload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      return res.data.cards;
    },
    {
      enabled: user.loggedIn,
    }
  );

  const setPrimaryCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const payload = new newnewapi.SetPrimaryCardRequest({
        cardUuid: cardId,
      });
      const response = await setPrimaryCard(payload);

      if (!response.data || response.error) {
        throw new Error(response.error?.message || 'An error occurred');
      }
    },
    // 💡 response of the mutation is passed to onSuccess
    onSuccess: (_, cardUuid: string) => {
      queryClient.setQueryData(
        ['private', 'getCards'],
        (old: newnewapi.ICard[] | undefined) => {
          console.log(old, 'old');
          if (!old) {
            return [];
          }

          const newPrimaryCard = old.find(
            (cardEl) => cardEl.cardUuid === cardUuid
          );

          return old.map((cardEl) => {
            if (cardEl.cardUuid === newPrimaryCard?.cardUuid) {
              return { ...cardEl, isPrimary: true };
            }

            return {
              ...cardEl,
              isPrimary: false,
            };
          });
        }
      );
    },
  });

  const addCardMutation = useMutation({
    mutationFn: (card: newnewapi.ICard) =>
      new Promise((res) => {
        res(card);
      }),
    // 💡 response of the mutation is passed to onSuccess
    onSuccess: (_, card: newnewapi.ICard) => {
      queryClient.setQueryData(
        ['private', 'getCards'],
        (old: newnewapi.ICard[] | undefined) => [...(old || []), card]
      );
    },
  });

  useEffect(() => {
    const handleCardAdded = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CardStatusChanged.decode(arr);
      if (!decoded) return;

      if (decoded.cardStatus === newnewapi.CardStatus.ADDED && decoded.card) {
        query.refetch();
      }
    };

    if (socketConnection) {
      socketConnection?.on('CardStatusChanged', handleCardAdded);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('CardStatusChanged', handleCardAdded);
      }
    };
  }, [socketConnection?.connected, socketConnection, query]);

  const contextValue = useMemo(
    () => ({
      cards: query.data || [],
      isCardsLoading: query.isLoading,
      setPrimaryCardMutation,
      addCardMutation,
      fetchCards: query.refetch,
    }),
    [
      setPrimaryCardMutation,
      query.isLoading,
      query.data,
      query.refetch,
      addCardMutation,
    ]
  );

  return (
    <CardsContext.Provider value={contextValue}>
      {children}
    </CardsContext.Provider>
  );
};

export default CardsContextProvider;

export function useCards() {
  const context = useContext(CardsContext);

  if (!context) {
    throw new Error('useCards must be used inside a `CardsContextProvider`');
  }

  return context;
}
