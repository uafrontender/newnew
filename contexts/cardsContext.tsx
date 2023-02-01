import { newnewapi } from 'newnew-api';
import React, { createContext, useMemo, useEffect, useContext } from 'react';
import {
  useMutation,
  useQuery,
  UseMutationResult,
  useQueryClient,
} from 'react-query';

import { deleteCard, getCards, setPrimaryCard } from '../api/endpoints/card';
import { useAppSelector } from '../redux-store/store';
import useErrorToasts from '../utils/hooks/useErrorToasts';
import { SocketContext } from './socketContext';

export const CardsContext = createContext<{
  cards: newnewapi.ICard[] | undefined;
  isCardsLoading: boolean;
  addCardMutation:
    | UseMutationResult<unknown, unknown, newnewapi.ICard>
    | undefined;
  setPrimaryCardMutation:
    | UseMutationResult<void, unknown, string, unknown>
    | undefined;
  removeCardMutation:
    | UseMutationResult<newnewapi.EmptyResponse, unknown, string, unknown>
    | undefined;
  fetchCards: () => void;
  primaryCard: newnewapi.ICard | undefined;
}>({
  cards: undefined,
  isCardsLoading: false,
  addCardMutation: undefined,
  fetchCards: () => {},
  setPrimaryCardMutation: undefined,
  removeCardMutation: undefined,
  primaryCard: undefined,
});

interface ICardsContextProvider {
  children: React.ReactNode;
}

const CardsContextProvider: React.FC<ICardsContextProvider> = ({
  children,
}) => {
  const { showErrorToastCustom, showErrorToastPredefined } = useErrorToasts();

  const socketConnection = useContext(SocketContext);

  const user = useAppSelector((state) => state.user);

  const queryClient = useQueryClient();

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
    onSuccess: (_, cardUuid: string) => {
      queryClient.setQueryData(
        ['private', 'getCards'],
        (old: newnewapi.ICard[] | undefined, ...other) => {
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
    onError: (err: any) => {
      if (err?.message) {
        showErrorToastCustom(err?.message);
      } else {
        showErrorToastPredefined();
      }
    },
  });

  const addCardMutation = useMutation({
    mutationFn: (card: newnewapi.ICard) =>
      new Promise((res) => {
        res(card);
      }),
    onSuccess: (_, card: newnewapi.ICard) => {
      queryClient.setQueryData(
        ['private', 'getCards'],
        (old: newnewapi.ICard[] | undefined) =>
          old?.find((el) => el.cardUuid === card.cardUuid)
            ? old
            : [...(old || []), card]
      );
    },
  });

  const removeCardMutation = useMutation({
    mutationFn: async (cardUuid: string) => {
      const payload = new newnewapi.DeleteCardRequest({
        cardUuid,
      });
      const response = await deleteCard(payload);

      if (!response.data || response.error) {
        throw new Error(response.error?.message || 'An error occurred');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['private', 'getCards']);
    },
    onError: (err: any) => {
      if (err?.message) {
        showErrorToastCustom(err?.message);
      } else {
        showErrorToastPredefined();
      }
    },
  });

  useEffect(() => {
    const handleCardAdded = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CardStatusChanged.decode(arr);
      if (!decoded) return;

      if (decoded.cardStatus === newnewapi.CardStatus.ADDED && decoded.card) {
        addCardMutation.mutate(decoded.card);
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
  }, [socketConnection?.connected, socketConnection, addCardMutation]);

  const primaryCard = useMemo(
    () => query.data?.find((card) => card.isPrimary),
    [query.data]
  );

  const contextValue = useMemo(
    () => ({
      cards: query.data || [],
      isCardsLoading: query.isLoading,
      primaryCard,
      setPrimaryCardMutation,
      addCardMutation,
      removeCardMutation,
      fetchCards: query.refetch,
    }),
    [
      setPrimaryCardMutation,
      primaryCard,
      query.isLoading,
      query.data,
      query.refetch,
      addCardMutation,
      removeCardMutation,
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
