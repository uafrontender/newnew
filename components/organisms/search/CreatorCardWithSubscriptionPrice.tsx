import React from 'react';
import { newnewapi } from 'newnew-api';
import CreatorCard from '../../molecules/search/CreatorCard';

interface ICreatorListItem {
  item: newnewapi.IUser;
  withEllipseMenu?: boolean;
}

export const CreatorCardWithSubscriptionPrice: React.FC<ICreatorListItem> = ({
  item,
  withEllipseMenu,
}) => <CreatorCard creator={item} withEllipseMenu={withEllipseMenu} />;

export default CreatorCardWithSubscriptionPrice;
