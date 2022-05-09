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

// import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import closeCircleIcon from '../../../public/images/svg/icons/filled/CloseCircle.svg';

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
  const { t } = useTranslation('home');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  let { sort = '' } = router.query;
  // const category = router.query.category as string;

  if (sort) {
    // @ts-ignore
    sort = JSON.parse(sort);
  }

  const sortEnabled = !!Object.keys(sort).length;
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
          {
            key: 'most_funded',
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

  const renderSortOption = useCallback(
    (option: string, key: string) => {
      const handleClick = () => {
        const newSort: any = { ...(sort as object) };

        delete newSort[key];

        handleSortChange(newSort);
      };

      return (
        <SButton
          key={`${option}-${key}`}
          view='primary'
          disabled={disabled}
          onClick={handleClick}
        >
          {t(`sort-title-option-${key}`)} (
          {t(
            `sort-title-option-${key}-${option}${
              option === 'num_bids' && ['ac', 'mc', 'cf'].includes(category)
                ? `-${category}`
                : ''
            }`
          )}
          )
          <InlineSVG svg={closeCircleIcon} width='16px' height='16px' />
        </SButton>
      );
    },
    [handleSortChange, sort, disabled, category, t]
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
            selected={sort}
            onChange={handleSortChange}
          />
        )}
      </SWrapper>
      {sortEnabled && !isMobile && (
        <SSortSelectedWrapper>
          {/* <SButtonClear
            view="tertiary"
            onClick={handleClearSorting}
            disabled={disabled}
          >
            Clear all
            <InlineSVG
              svg={closeIcon}
              width="24px"
              height="24px"
            />
          </SButtonClear> */}
          {_map(sort, renderSortOption)}
        </SSortSelectedWrapper>
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
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 1200px;
  }
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

// const SButtonClear = styled(SButton)`
//   color: ${(props) => props.theme.colorsThemed.text.secondary};

//   svg {
//     fill: ${(props) => props.theme.colorsThemed.text.secondary};
//     min-width: 24px;
//     min-height: 24px;
//     margin-left: 0;
//   }
// `;
