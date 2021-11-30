import React, { useMemo, useCallback } from 'react';
import _map from 'lodash/map';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Button from '../../atoms/Button';
import Sorting from '../Sorting';
import InlineSVG from '../../atoms/InlineSVG';
import ChangeCollectionType from '../../atoms/ChangeCollectionType';

import { useAppSelector } from '../../../redux-store/store';

import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import closeCircleIcon from '../../../public/images/svg/icons/filled/CloseCircle.svg';

export const TitleBlock = () => {
  const { t } = useTranslation('home');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  let { sort = '' } = router.query;
  const category = router.query.category as string;

  if (sort) {
    // @ts-ignore
    sort = JSON.parse(sort);
  }

  const sortEnabled = !!Object.keys(sort).length;
  const sortOptions: any = useMemo(() => [
    {
      key: 'bid',
      options: [
        {
          key: 'lowest',
        },
        {
          key: 'highest',
        },
      ],
    },
    {
      key: 'time',
      options: [
        {
          key: 'ending-soon',
        },
        {
          key: 'newest',
        },
        {
          key: 'oldest',
        },
      ],
    },
    {
      key: 'numbers-of-bids',
      options: [
        {
          key: 'fewest',
        },
        {
          key: 'most-first',
        },
      ],
    },
  ], []);
  const collectionTypeOptions: any = useMemo(() => [
    {
      key: 'ac',
    },
    {
      key: 'mc',
    },
    {
      key: 'cf',
    },
    {
      key: 'biggest',
    },
    {
      key: 'for-you',
    },
  ], []);

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
  const handleSortChange = useCallback((newSort: object = {}) => {
    const newQuery = {
      ...router.query,
      sort: JSON.stringify(newSort),
    };
    router.push({
      query: newQuery,
      pathname: router.pathname,
    });
  }, [router]);
  const handleClearSorting = useCallback(() => {
    const newQuery = { ...router.query };

    delete newQuery.sort;

    router.push({
      query: newQuery,
      pathname: router.pathname,
    });
  }, [router]);
  const renderSortOption = useCallback((option: string, key: string) => {
    const handleClick = () => {
      const newSort: any = { ...(sort as object) };

      delete newSort[key];

      handleSortChange(newSort);
    };

    return (
      <SButton
        key={`${option}-${key}`}
        view="primary"
        onClick={handleClick}
      >
        {t(`sort-title-option-${key}`)}
        {' '}
        (
        {t(`sort-title-option-${key}-${option}`)}
        )
        <InlineSVG
          svg={closeCircleIcon}
          width="16px"
          height="16px"
        />
      </SButton>
    );
  }, [handleSortChange, sort, t]);

  return (
    <SContainer>
      <SWrapper>
        <ChangeCollectionType
          options={collectionTypeOptions}
          selected={category}
          onChange={handleCollectionTypeChange}
        />
        <Sorting
          options={sortOptions}
          selected={sort}
          onChange={handleSortChange}
        />
      </SWrapper>
      {sortEnabled && !isMobile && (
        <SSortSelectedWrapper>
          <SButtonClear
            view="tertiary"
            onClick={handleClearSorting}
          >
            Clear all
            <InlineSVG
              svg={closeIcon}
              width="24px"
              height="24px"
            />
          </SButtonClear>
          {_map(sort, renderSortOption)}
        </SSortSelectedWrapper>
      )}
    </SContainer>
  );
};

export default TitleBlock;

const SContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SSortSelectedWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 24px;
  align-items: center;
  flex-direction: row;
`;

const SButton = styled(Button)`
  padding: 8px 8px 8px 16px;
  margin-right: 8px;
  border-radius: 24px;

  span {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    min-width: 16px;
    min-height: 16px;
    margin-left: 4px;
  }
`;

const SButtonClear = styled(SButton)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};

  svg {
    fill: ${(props) => props.theme.colorsThemed.text.secondary};
    min-width: 24px;
    min-height: 24px;
    margin-left: 0;
  }
`;
