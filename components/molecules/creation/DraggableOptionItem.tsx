import React, { useState } from 'react';
import TextArea from 'react-textarea-autosize';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { useMotionValue, Reorder, useDragControls } from 'framer-motion';

import InlineSVG from '../../atoms/InlineSVG';

import trashIcon from '../../../public/images/svg/icons/filled/Trash.svg';
import changeOrderIcon from '../../../public/images/svg/icons/outlined/ChangeOrder.svg';

interface IOptionItem {
  item: {
    id: number;
    text: string;
  };
  index: number;
  withDelete: boolean;
  handleChange: (index: number, item: object | null) => void;
}

export const DraggableOptionItem: React.FC<IOptionItem> = (props) => {
  const {
    item,
    index,
    withDelete,
    handleChange,
  } = props;
  const [isDragging, setIsDragging] = useState(false);
  const y = useMotionValue(0);
  const theme = useTheme();
  const { t } = useTranslation('creation');
  const dragControls = useDragControls();

  const handleInputChange = (e: any) => {
    handleChange(index, {
      ...item,
      text: e.target.value,
    });
  };
  const handleDelete = () => {
    handleChange(index, null);
  };
  const handlePointerDown = (event: any) => {
    dragControls.start(event);
    setIsDragging(true);
  };
  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <SWrapper
      style={{ y }}
      value={item}
      dragListener={false}
      dragControls={dragControls}
    >
      <SLeftPart
        isDragging={isDragging}
      >
        <STextArea
          value={item.text}
          onChange={handleInputChange}
          placeholder={t('secondStep.field.choices.option.label', { value: index + 1 })}
        />
        {withDelete && (
          <InlineSVG
            clickable
            svg={trashIcon}
            fill={theme.colorsThemed.text.secondary}
            width="24px"
            height="24px"
            onClick={handleDelete}
          />
        )}
      </SLeftPart>
      <SRightPart
        onPointerUp={handlePointerUp}
        onPointerDown={handlePointerDown}
      >
        <InlineSVG
          svg={changeOrderIcon}
          fill={theme.colorsThemed.text.primary}
          width="24px"
          height="24px"
        />
      </SRightPart>
    </SWrapper>
  );
};

export default DraggableOptionItem;

const SWrapper = styled(Reorder.Item)`
  display: flex;
  margin-top: 16px;
  user-select: none;
  align-items: center;
  touch-action: pan-x;
  justify-content: flex-start;
`;

interface ISLeftPart {
  isDragging: boolean;
}

const SLeftPart = styled.div<ISLeftPart>`
  flex: 1;
  border: 1.5px solid ${(props) => props.theme.colorsThemed.background[props.isDragging ? 'outlines2' : 'tertiary']};
  display: flex;
  padding: 10.5px 20px;
  overflow: hidden;
  position: relative;
  background: ${(props) => props.theme.colorsThemed.background[props.isDragging ? 'quinary' : 'tertiary']};
  align-items: center;
  border-radius: 16px;
  flex-direction: row;
`;

const STextArea = styled(TextArea)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  resize: none;
  outline: none;
  background: transparent;
  margin-right: 12px;

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }

  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 20px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const SRightPart = styled.div`
  cursor: grab;
  display: flex;
  margin-left: 4px;
  align-items: center;
  justify-content: center;
`;
