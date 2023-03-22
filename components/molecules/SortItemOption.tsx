import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import CheckBox from './CheckBox';

interface ISortItemOption {
  item: {
    key: string;
  };
  parent: {
    key: string;
  };
  category: string;
  selected: boolean;
  handleChange: (itemKey: string, parentKey: string) => void;
}

export const SortItemOption: React.FC<ISortItemOption> = (props) => {
  const { item, parent, selected, category, handleChange } = props;
  const { t } = useTranslation('page-SeeMore');

  const onChange = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (selected) return;

      handleChange(item.key, parent.key);
    },
    [handleChange, selected, item.key, parent.key]
  );

  return (
    <SCheckBox
      label={t(
        `sortingOption.${parent.key}-${item.key}${
          item.key === 'num_bids' && ['ac', 'mc', 'cf'].includes(category)
            ? `-${category}`
            : ''
        }` as any
      )}
      selected={selected}
      handleChange={onChange}
    />
  );
};

export default SortItemOption;

const SCheckBox = styled(CheckBox)`
  padding: 8px 8px 8px 3px;

  ${(props) => props.theme.media.tablet} {
    padding: 8px 11px;
    border-radius: 12px;

    :hover {
      background-color: ${(props) =>
        props.theme.colorsThemed.background.backgroundDDSelected};
    }
  }
`;
