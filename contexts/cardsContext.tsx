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

export const CardsContext = createContext<{
  cards?: newnewapi.ICard[];
  isCardsLoading: boolean;
  handleSetCards: (cards: newnewapi.ICard[]) => void;
}>({
  cards: undefined,
  isCardsLoading: false,
  handleSetCards: (cards: newnewapi.ICard[]) => {},
});

interface ICardsContextProvider {
  children: React.ReactNode;
}

const CardsContextProvider: React.FC<ICardsContextProvider> = ({
  children,
}) => {
  const user = useAppSelector((state) => state.user);

  const [cards, setCards] = useState<newnewapi.ICard[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetCards = useCallback((newCards: newnewapi.ICard[]) => {
    setCards((prevState) => {
      if (prevState) {
        return [
          ...prevState,
          ...newCards.filter(
            (card) =>
              !prevState.find(
                (prevStateCard) => prevStateCard.cardUuid === card.cardUuid
              )
          ),
        ];
      }

      return newCards;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      cards,
      isCardsLoading: isLoading,
      handleSetCards,
    }),
    [cards, isLoading, handleSetCards]
  );

  useEffect(() => {
    async function fetchIds() {
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
    }

    fetchIds();
  }, [user.loggedIn]);

  return (
    <CardsContext.Provider value={contextValue}>
      {children}
    </CardsContext.Provider>
  );
};

export default CardsContextProvider;

export function useCards() {
  const context = useContext(CardsContext);

  if (!context)
    throw new Error('useCards must be used inside a `CardsContextProvider`');
  return context;
}
