import React from 'react';
import { Reorder } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import InlineSVG from '../../atoms/InlineSVG';
import DraggableOptionItem from '../../molecules/creation/DraggableOptionItem';

import plusIcon from '../../../public/images/svg/icons/outlined/Plus.svg';
import { Mixpanel } from '../../../utils/mixpanel';

interface IDraggableMobileOptions {
  id: string;
  min: number;
  options: {}[];
  onChange: (key: string, value: any) => void;
  validation: (
    text: string,
    min: number,
    max: number,
    kind: newnewapi.ValidateTextRequest.Kind,
    index: number
  ) => Promise<string>;
}

export const DraggableMobileOptions: React.FC<IDraggableMobileOptions> = (
  props
) => {
  const { id, min, options, onChange, validation } = props;
  const theme = useTheme();
  const { t } = useTranslation('page-Creation');

  const onReorder = (value: any) => {
    onChange(id, value);
  };
  const handleOptionChange = (index: number, item: any) => {
    const newArr = [...options];

    if (item) {
      newArr[index] = { ...newArr[index], ...item };
    } else {
      newArr.splice(index, 1);
    }

    onChange(id, newArr);
  };

  const renderItem = (item: any, index: number) => (
    <DraggableOptionItem
      id={`option-${index}`}
      key={`draggable-option-${item.id}`}
      item={item}
      index={index}
      validation={validation}
      withDelete={options.length > min}
      handleChange={handleOptionChange}
    />
  );
  const handleAddNewOption = () => {
    Mixpanel.track('Superpoll Add New Option');
    onChange(id, [
      ...options,
      {
        id: Date.now(),
        text: '',
      },
    ]);
  };

  return (
    <>
      <SList axis='y' values={options} onReorder={onReorder}>
        {options.map(renderItem)}
      </SList>
      {options.length < 4 && (
        <SNewOption id='add-option' onClick={handleAddNewOption}>
          <InlineSVG
            svg={plusIcon}
            fill={theme.colorsThemed.text.secondary}
            width='24px'
            height='24px'
          />
          <STitle>{t('secondStep.field.choices.add')}</STitle>
        </SNewOption>
      )}
    </>
  );
};

export default DraggableMobileOptions;

const SList = styled(Reorder.Group)`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const SNewOption = styled.div`
  cursor: pointer;
  padding: 4px 0;
  display: flex;
  margin-top: 16px;
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
`;

const STitle = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 14px;
  margin-left: 4px;
  font-weight: bold;
  line-height: 24px;
`;
