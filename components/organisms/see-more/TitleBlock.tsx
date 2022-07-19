import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import Sorting from '../Sorting';
import ChangeCollectionType from '../../atoms/ChangeCollectionType';

import { useAppSelector } from '../../../redux-store/store';

import SortOption from '../../atoms/SortOption';

interface ITitleBlock {
  category: string;
  disabled?: boolean;
  authenticated?: boolean;
}

export const TitleBlock: React.FunctionComponent<ITitleBlock> = ({
  category,
  disabled,
  authenticated,
}) => {
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  // const category = router.query.category as string;
  const { sort } = router.query;

  const sorts: Record<string, string> = sort
    ? JSON.parse(sort as string) || {}
    : undefined;

  const sortOptions: any = useMemo(
    () => [
      {
        key: 'sortingtype',
        options: [
          {
            key: 'all',
          },
          {
            key: 'num_bids',
          },
        ],
      },
    ],
    []
  );
  const collectionTypeOptions: any = useMemo(
    () => [
      {
        key: 'ac',
      },
      {
        key: 'mc',
      },
      {
        key: 'cf',
      },
      // {
      //   key: 'biggest',
      // },
      ...(authenticated
        ? [
            {
              key: 'for-you',
            },
          ]
        : []),
    ],
    [authenticated]
  );

  const handleCollectionTypeChange = (newCategory: string) => {
    const newQuery = {
      ...router.query,
      category: newCategory,
    };
    router.push({
      query: newQuery,
      pathname: router.pathname,
    });
  };

  const handleClearSorting = useCallback(() => {
    const newQuery = { ...router.query };

    delete newQuery.sort;

    router.push({
      query: newQuery,
      pathname: router.pathname,
    });
  }, [router]);

  const handleSortChange = useCallback(
    (newSort: object = {}) => {
      if ((newSort as any).sortingtype === 'all') {
        handleClearSorting();
        return;
      }
      const newQuery = {
        ...router.query,
        sort: JSON.stringify(newSort),
      };
      router.push({
        query: newQuery,
        pathname: router.pathname,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [router, handleClearSorting]
  );

  return (
    <SContainer>
      <SWrapper>
        <ChangeCollectionType
          options={collectionTypeOptions}
          selected={category}
          disabled={disabled}
          onChange={handleCollectionTypeChange}
        />
        {category !== 'biggest' && category !== 'for-you' && (
          <Sorting
            category={category}
            options={sortOptions}
            selected={sorts}
            onChange={handleSortChange}
          />
        )}
      </SWrapper>
      {sorts && !isMobile && (
        <SSortOption
          sorts={sorts}
          category={category}
          disabled={disabled}
          onClick={handleClearSorting}
        />
      )}
    </SContainer>
  );
};

TitleBlock.defaultProps = {
  authenticated: undefined,
  disabled: undefined,
};

export default TitleBlock;

const SContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.media.tablet} {
    margin-left: auto;
    margin-right: auto;
    max-width: 696px;

    margin-bottom: 32px;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 1160px;
  }
`;

const SWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SSortOption = styled(SortOption)`
  margin-top: 24px;
`;
