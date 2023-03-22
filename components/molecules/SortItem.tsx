import React, { useCallback } from 'react';
import styled from 'styled-components';

import Text from '../atoms/Text';
import SortItemOption from './SortItemOption';

interface ISortItem {
  category: string;
  item: {
    key: string;
    options: object[];
  };
  selected?: Record<string, string>;
  handleChange: (itemKey: string, parentKey: string) => void;
}

export const SortItem: React.FC<ISortItem> = (props) => {
  const { item, selected, category, handleChange } = props;

  const renderItemOption = useCallback(
    (option: any, index: number, parentOption: any) => {
      let optionSelected: boolean = false;

      if (
        (selected && selected[parentOption.key] === option.key) ||
        (!selected && option.key === 'all')
      ) {
        optionSelected = true;
      }

      return (
        <SItemOptionWrapper
          key={`sort-item-${parentOption.key}-${option.key}-category`}
        >
          <SortItemOption
            category={category}
            item={option}
            parent={parentOption}
            selected={optionSelected}
            handleChange={handleChange}
          />
        </SItemOptionWrapper>
      );
    },
    [handleChange, selected, category]
  );

  return (
    <SItemHolder>
      <SItemTitle variant={3} weight={600}>
        {/* {t(`sortingOption.${item.key}`)} */}
      </SItemTitle>
      {item.options.map((option: any, optIndex: number) =>
        renderItemOption(option, optIndex, item)
      )}
    </SItemHolder>
  );
};

export default SortItem;

const SItemHolder = styled.div``;

const SItemTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  padding: 8px;
`;

const SItemOptionWrapper = styled.div``;
