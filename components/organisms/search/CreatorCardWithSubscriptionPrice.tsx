import React, { useEffect, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { getSubscriptionStatus } from '../../../api/endpoints/subscription';
import CreatorCard from '../../molecules/search/CreatorCard';

interface ICreatorListItem {
  item: newnewapi.IUser;
  subscribedTo: boolean;
  showSubscriptionPrice: boolean;
}

// This component fetches subscription price for a creator and returns a card.
// This should not be done like that (as we generate many requests instead of one).
// TODO: add subscription price to IUser interface and return it from back-end.
// Until then we could live with this implementation as there is no need to change backend
// before we are sure that this subscription price is here to stay (risk of changes in design is high).
// The component has a descriptive yet ugly name, it will serve as a reminder to fix it one day.
// NOTE: if you see this comment after 18/07/2022 please take action.
export const CreatorCardWithSubscriptionPrice: React.FC<ICreatorListItem> = ({
  item,
  subscribedTo,
  showSubscriptionPrice,
}) => {
  const [subscriptionPrice, setSubscriptionPrice] = useState<
    number | undefined
  >(showSubscriptionPrice ? 0 : undefined);

  const sign = subscribedTo ? 'subscribed' : undefined;

  useEffect(() => {
    async function fetchSubscriptionPrice(userId: string) {
      try {
        const getStatusPayload = new newnewapi.SubscriptionStatusRequest({
          creatorUuid: userId,
        });

        const res = await getSubscriptionStatus(getStatusPayload);

        if (res.data?.status?.product) {
          setSubscriptionPrice(
            res.data?.status?.product.monthlyRate?.usdCents!!
          );
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (showSubscriptionPrice && item.options?.isCreator && item.uuid) {
      fetchSubscriptionPrice(item.uuid);
    }
  }, [item, showSubscriptionPrice]);

  return (
    <CreatorCard
      creator={item}
      sign={sign}
      subscriptionPrice={subscriptionPrice}
    />
  );
};

export default CreatorCardWithSubscriptionPrice;
