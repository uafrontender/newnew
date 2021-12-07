/* eslint-disable arrow-body-style */
/* eslint-disable padded-blocks */
import { newnewapi } from 'newnew-api';
import React from 'react';
import styled from 'styled-components';
import { TUserData } from '../../../redux-store/slices/userStateSlice';
import { useAppSelector } from '../../../redux-store/store';
import TransactionCard from '../../molecules/settings/TransactionCard';

export type TTransactionsSectionItem = {
  actor: Omit<newnewapi.User, 'toJSON'> | TUserData;
  recipient: Omit<newnewapi.User, 'toJSON'> | TUserData;
  date: Date;
  amount: number;
  direction: 'to' | 'from',
  action: 'bid' | 'vote' | 'support' | 'topup' | 'withdraw'
}

type TTransactionsSection = {
  transactions: TTransactionsSectionItem[];
  // Allows handling visuals for active/inactive state
  handleSetActive: () => void;
};

const TransactionsSection: React.FunctionComponent<TTransactionsSection> = ({
  transactions,
  handleSetActive,
}) => {
  const { userData } = useAppSelector((state) => state.user);

  return (
    <SWrapper
      onMouseEnter={() => handleSetActive()}
    >
      {transactions.map((t, i) => (
        <TransactionCard
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          cardInfo={t}
          currentUser={userData!!}
        />
      ))}
    </SWrapper>
  );
};

export default TransactionsSection;

const SWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding-bottom: 13px;
`;
