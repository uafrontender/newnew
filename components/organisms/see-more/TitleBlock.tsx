import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import ChangeCollectionType from '../../atoms/ChangeCollectionType';
import SortOption from '../../atoms/SortOption';
import { useAppState } from '../../../contexts/appStateContext';

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
  const { resizeMode } = useAppState();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  // const category = router.query.category as string;
  const { sort } = router.query;

  const sorts: Record<string, string> = sort
    ? JSON.parse(sort as string) || {}
    : undefined;

  const collectionTypeOptions: any = useMemo(
    () => [
      // {
      //   key: 'ac',
      // },
      // {
      //   key: 'mc',
      // },
      // {
      //   key: 'cf',
      // },
      // {
      //   key: 'biggest',
      // },
      ...(authenticated
        ? [
            // {
            //   key: 'for-you',
            // },
            {
              key: 'recent-activity',
            },
          ]
        : []),
    ],
    [authenticated]
  );

  const handleCollectionTypeChange = (newCategory: string) => {
    const newQuery: {
      category?: string;
      sort?: string;
    } = {
      ...router.query,
      category: newCategory,
    };

    if (newCategory === 'for-you' && newQuery.sort) {
      delete newQuery.sort;
    }

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

  return (
    <SContainer>
      <SWrapper>
        <ChangeCollectionType
          options={collectionTypeOptions}
          selected={category}
          disabled={disabled}
          onChange={handleCollectionTypeChange}
        />
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
