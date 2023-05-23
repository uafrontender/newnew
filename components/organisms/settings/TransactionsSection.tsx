import { newnewapi } from 'newnew-api';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';

import { getMyTransactions } from '../../../api/endpoints/payments';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import TransactionCard from '../../molecules/settings/TransactionCard';
import ChevronDown from '../../../public/images/svg/icons/outlined/ChevronDown.svg';
import Text from '../../atoms/Text';

type TTransactionsSection = {
  transactions: newnewapi.ITransaction[];
  transactionsTotal: number;
  transactionsLimit: number;
  // Allows handling visuals for active/inactive state
  handleSetActive: () => void;
};

const TransactionsSection: React.FunctionComponent<TTransactionsSection> = ({
  transactions,
  transactionsTotal,
  transactionsLimit,
  handleSetActive,
}) => {
  const { t } = useTranslation('page-Profile');

  const [prevPage, setPrevPage] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number | undefined>();
  const [myTransactions, setMyTransactions] = useState<
    newnewapi.ITransaction[]
  >([]);
  const theme = useTheme();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState(0);

  useEffect(() => {
    if (lastPage && myTransactions.length && wrapperRef.current && !minHeight) {
      setMinHeight(wrapperRef.current.clientHeight);
    }
  }, [myTransactions, minHeight, lastPage]);

  const fetchMyTransactions = useCallback(async () => {
    try {
      const payload = new newnewapi.GetMyTransactionsRequest({
        paging: { limit: 5, offset: (currentPage - 1) * transactionsLimit },
      });
      const res = await getMyTransactions(payload);
      const { data, error } = res;

      if (!data || error) {
        throw new Error(error?.message ?? 'Request failed');
      }

      if (data.transactions) {
        setMyTransactions(data.transactions);
      }
    } catch (err) {
      console.error(err);
    }
  }, [currentPage, transactionsLimit]);

  useEffect(() => {
    if (!lastPage && transactionsTotal > transactionsLimit) {
      setLastPage(Math.ceil(transactionsTotal / transactionsLimit));
    }
  }, [transactionsTotal, transactionsLimit, lastPage]);

  // What is that? A way to set an initial value?
  useEffect(() => {
    if (!myTransactions || myTransactions.length < 1) {
      setMyTransactions(transactions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myTransactions, transactions]);

  const goNextPage = useCallback(() => {
    setPrevPage(currentPage);
    setCurrentPage((curr) => curr + 1);
  }, [currentPage]);

  const goPrevPage = useCallback(() => {
    setPrevPage(currentPage);
    setCurrentPage((curr) => curr - 1);
  }, [currentPage]);

  useEffect(() => {
    if (prevPage !== currentPage) {
      fetchMyTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, prevPage]);

  return (
    <SWrapper
      ref={wrapperRef}
      style={{ minHeight }}
      onMouseEnter={() => handleSetActive()}
    >
      {myTransactions.length === 0 && (
        <SText variant={2}> {t('Settings.sections.transactions.empty')}</SText>
      )}
      {myTransactions.map((transaction) => (
        <TransactionCard
          key={transaction.id?.toString()}
          transaction={transaction}
        />
      ))}
      {lastPage && (
        <SNav>
          <SButton
            onClick={goPrevPage}
            view='transparent'
            invisible={currentPage === 1}
          >
            <SInlineSVG
              type='prev'
              svg={ChevronDown}
              fill={theme.colorsThemed.text.secondary}
              width='20px'
              height='20px'
            />
          </SButton>
          {currentPage} of {lastPage}
          <SButton
            onClick={goNextPage}
            view='transparent'
            invisible={currentPage === lastPage}
          >
            <SInlineSVG
              type='next'
              svg={ChevronDown}
              fill={theme.colorsThemed.text.secondary}
              width='20px'
              height='20px'
            />
          </SButton>
        </SNav>
      )}
    </SWrapper>
  );
};

export default TransactionsSection;

const SWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 25px;
`;

const SText = styled(Text)`
  width: 100%;
  text-align: center;
`;

interface ISButton {
  invisible?: boolean;
}

const SButton = styled(Button)<ISButton>`
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  margin: 0 15px;
  ${(props) => {
    if (props.invisible) {
      return css`
        opacity: 0;
        pointer-events: none;
      `;
    }
    return css``;
  }}
`;

const SNav = styled.div`
  display: flex;
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 16px;
  line-height: 24px;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  margin-top: auto;
`;

interface ISInlineSVG {
  type?: string;
}

const SInlineSVG = styled(InlineSVG)<ISInlineSVG>`
  min-width: 16px;
  min-height: 16px;

  ${(props) => {
    if (props.type === 'prev') {
      return css`
        transform: rotate(90deg);
      `;
    }
    if (props.type === 'next') {
      return css`
        transform: rotate(-90deg);
      `;
    }
    return css``;
  }}
`;
