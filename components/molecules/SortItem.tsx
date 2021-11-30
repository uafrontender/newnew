import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../atoms/Text';
import SortItemOption from './SortItemOption';

interface ISortItem {
  item: {
    key: string,
    options: object[]
  };
  selected: object;
  handleChange: (itemKey: string, parentKey: string) => void;
}

export const SortItem: React.FC<ISortItem> = (props) => {
  const {
    item,
    selected,
    handleChange,
  } = props;
  const { t } = useTranslation('home');

  const renderItemOption = useCallback((option: any, index: number, parentOption: any) => {
    let optionSelected: boolean = false;

    // @ts-ignore
    if (selected[parentOption.key] === option.key) {
      optionSelected = true;
    }

    return (
      <SItemOptionWrapper
        key={`sort-item-${parentOption.key}-${option.key}`}
      >
        <SortItemOption
          item={option}
          parent={parentOption}
          selected={optionSelected}
          handleChange={handleChange}
        />
      </SItemOptionWrapper>
    );
  }, [handleChange, selected]);

  return (
    <SItemHolder>
      <SItemTitle variant={3} weight={600}>
        {t(`sort-title-option-${item.key}`)}
      </SItemTitle>
      {item.options.map(
        (option: any, optIndex: number) => renderItemOption(option, optIndex, item),
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

const SItemOptionWrapper = styled.div`
  cursor: pointer;
  padding: 8px 8px 8px 0;
  border-radius: 12px;

  :hover {
    background-color: ${(props) => props.theme.colorsThemed.grayscale.backgroundDDSelected};
  }
`;
