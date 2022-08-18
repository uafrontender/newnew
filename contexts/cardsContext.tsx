import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useContext,
} from 'react';

import { getCards } from '../api/endpoints/card';
import { useAppSelector } from '../redux-store/store';
import { SocketContext } from './socketContext';

export const CardsContext = createContext<{
  cards?: newnewapi.ICard[];
  isCardsLoading: boolean;
  handleSetCards: (cards: newnewapi.ICard[]) => void;
  handleSetCard: (card: newnewapi.ICard) => void;
  fetchCards: () => void;
}>({
  cards: undefined,
  isCardsLoading: false,
  handleSetCards: (cards: newnewapi.ICard[]) => {},
  handleSetCard: (card: newnewapi.ICard) => {},
  fetchCards: () => {},
});

interface ICardsContextProvider {
  children: React.ReactNode;
}

const CardsContextProvider: React.FC<ICardsContextProvider> = ({
  children,
}) => {
  const socketConnection = useContext(SocketContext);

  const user = useAppSelector((state) => state.user);

  const [cards, setCards] = useState<newnewapi.ICard[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetCards = useCallback((newCards: newnewapi.ICard[]) => {
    setCards(newCards);
  }, []);

  const handleSetCard = useCallback((newCard: newnewapi.ICard) => {
    setCards((prevState) => {
      if (prevState) {
        if (
          !prevState.find(
            (prevStateCard) => prevStateCard.cardUuid === newCard.cardUuid
          )
        ) {
          return [...prevState, newCard];
        }

        return prevState;
      }

      return [newCard];
    });
  }, []);

  const fetchCards = useCallback(async () => {
    if (!user.loggedIn) {
      setCards(undefined);
      return;
    }

    try {
      setIsLoading(true);

      const payload = new newnewapi.EmptyRequest({});

      const res = await getCards(payload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      setCards(res.data.cards);

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }, [user.loggedIn]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    const handleCardAdded = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CardStatusChanged.decode(arr);
      if (!decoded) return;

      if (decoded.cardStatus === newnewapi.CardStatus.ADDED && decoded.card) {
        handleSetCard(decoded.card);
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
  }, [socketConnection?.connected, handleSetCard, socketConnection]);

  const contextValue = useMemo(
    () => ({
      cards,
      isCardsLoading: isLoading,
      handleSetCards,
      handleSetCard,
      fetchCards,
    }),
    [cards, isLoading, handleSetCards, handleSetCard, fetchCards]
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
