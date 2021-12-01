import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import CheckBox from './CheckBox';

interface ISortItemOption {
  item: {
    key: string,
  };
  parent: {
    key: string,
  };
  selected: boolean;
  handleChange: (itemKey: string, parentKey: string) => void;
}

export const SortItemOption: React.FC<ISortItemOption> = (props) => {
  const {
    item,
    parent,
    selected,
    handleChange,
  } = props;
  const { t } = useTranslation('home');

  const onChange = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    handleChange(item.key, parent.key);
  }, [handleChange, item.key, parent.key]);

  return (
    <SCheckBox
      label={t(`sort-title-option-${parent.key}-${item.key}`)}
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
      background-color: ${(props) => props.theme.colorsThemed.grayscale.backgroundDDSelected};
    }
  }
`;
