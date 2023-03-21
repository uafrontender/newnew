import { newnewapi } from 'newnew-api';
import { useMemo } from 'react';
import {
  useMutation,
  useQuery,
  UseMutationResult,
  useQueryClient,
} from 'react-query';

import { deleteCard, getCards, setPrimaryCard } from '../../api/endpoints/card';
import { useAppSelector } from '../../redux-store/store';
import useErrorToasts from './useErrorToasts';

interface CardsData {
  cards: newnewapi.ICard[] | undefined;
  isCardsLoading: boolean;
  addCardMutation: UseMutationResult<unknown, unknown, newnewapi.ICard>;
  setPrimaryCardMutation: UseMutationResult<void, unknown, string, unknown>;
  removeCardMutation: UseMutationResult<
    newnewapi.EmptyResponse,
    unknown,
    string,
    unknown
  >;
  fetchCards: () => void;
  primaryCard: newnewapi.ICard | undefined;
}

const useCards = (): CardsData => {
  const { showErrorToastCustom, showErrorToastPredefined } = useErrorToasts();

  const user = useAppSelector((state) => state.user);

  const queryClient = useQueryClient();

  const query = useQuery(
    ['private', 'getCards'],
    async ({ signal }) => {
      const payload = new newnewapi.EmptyRequest({});

      const res = await getCards(payload, signal);

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

  const primaryCard = useMemo(
    () => query.data?.find((card) => card.isPrimary),
    [query.data]
  );

  return {
    cards: query.data || [],
    isCardsLoading: query.isLoading,
    primaryCard,
    setPrimaryCardMutation,
    addCardMutation,
    removeCardMutation,
    fetchCards: query.refetch,
  };
};

export default useCards;
