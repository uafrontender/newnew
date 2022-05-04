import React, { useEffect, useState } from 'react';
import TextArea from 'react-textarea-autosize';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';
import { Reorder, useMotionValue, useDragControls } from 'framer-motion';

import InlineSVG from '../../atoms/InlineSVG';
import AnimatedPresence from '../../atoms/AnimatedPresence';

import useDebounce from '../../../utils/hooks/useDebounce';

import trashIcon from '../../../public/images/svg/icons/filled/Trash.svg';
import alertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import changeOrderIcon from '../../../public/images/svg/icons/outlined/ChangeOrder.svg';

import {
  CREATION_OPTION_MAX,
  CREATION_OPTION_MIN,
} from '../../../constants/general';

interface IOptionItem {
  item: {
    id: number;
    text: string;
  };
  index: number;
  withDelete: boolean;
  validation: (
    value: string,
    min: number,
    max: number,
    kind: newnewapi.ValidateTextRequest.Kind
  ) => Promise<string>;
  handleChange: (index: number, item: object | null) => void;
}

const DraggableOptionItem: React.FC<IOptionItem> = (props) => {
  const { item, index, withDelete, validation, handleChange } = props;
  const [value, setValue] = useState(item.text);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const y = useMotionValue(0);
  const theme = useTheme();
  const { t } = useTranslation('creation');
  const dragControls = useDragControls();

  const handleInputChange = (e: any) => {
    setValue(e.target.value);
    handleChange(index, {
      ...item,
      text: e.target.value,
    });
  };
  const handleInputBlur = async (e: any) => {
    if (e.target.value.length < 1 && index > 1) {
      handleChange(index, null);
      return;
    }

    setError(
      await validation(
        e.target.value,
        CREATION_OPTION_MIN,
        CREATION_OPTION_MAX,
        newnewapi.ValidateTextRequest.Kind.POST_OPTION
      )
    );
  };
  const handleInputFocus = () => {
    setError('');
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

  const validateTitleDebounced = useDebounce(value, 500);

  useEffect(() => {
    const func = async () => {
      if (validateTitleDebounced) {
        setError(
          await validation(
            validateTitleDebounced,
            CREATION_OPTION_MIN,
            CREATION_OPTION_MAX,
            newnewapi.ValidateTextRequest.Kind.POST_OPTION
          )
        );
      }
    };

    func();
  }, [validation, validateTitleDebounced]);

  return (
    <SWrapper
      error={!!error}
      style={{ y }}
      value={item}
      dragListener={false}
      dragControls={dragControls}
    >
      <STextAreaWrapper>
        <SLeftPart error={!!error} isDragging={isDragging}>
          <STextArea
            value={item.text}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onChange={handleInputChange}
            placeholder={t('secondStep.field.choices.option.label', {
              value: index + 1,
            })}
          />
          {withDelete && (
            <SDeleteIcon
              clickable
              svg={trashIcon}
              fill={theme.colorsThemed.text.secondary}
              width='23px'
              height='23px'
              onClick={handleDelete}
            />
          )}
        </SLeftPart>
        {error ? (
          <AnimatedPresence animation='t-09'>
            <SErrorDiv>
              <InlineSVG svg={alertIcon} width='16px' height='16px' />
              {error}
            </SErrorDiv>
          </AnimatedPresence>
        ) : null}
      </STextAreaWrapper>
      <SRightPart
        onPointerUp={handlePointerUp}
        onPointerDown={handlePointerDown}
      >
        <InlineSVG
          svg={changeOrderIcon}
          fill={theme.colorsThemed.text.primary}
          width='24px'
          height='24px'
        />
      </SRightPart>
    </SWrapper>
  );
};

export default DraggableOptionItem;

const SRightPart = styled.div`
  cursor: grab;
  display: flex;
  margin-left: 4px;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: -10px;
  ${({ theme }) => theme.media.laptop} {
    display: none;
    right: 0;
  }
`;

const SDeleteIcon = styled(InlineSVG)`
  ${({ theme }) => theme.media.laptop} {
    display: none;
  }
`;

interface ISWrapper {
  error: boolean;
}

const SWrapper = styled(Reorder.Item)<ISWrapper>`
  display: flex;
  margin-top: 16px;
  user-select: none;
  align-items: center;
  touch-action: pan-x;
  justify-content: flex-start;
  position: relative;
  padding-right: 20px;
  ${({ theme }) => theme.media.laptop} {
    margin-right: -23px;
    padding-right: 23px;
  }

  ${(props) =>
    props.error &&
    css`
      margin-bottom: 32px;
    `}

  &:hover {
    ${SDeleteIcon},
    ${SRightPart} {
      display: block;
    }
  }
`;

const STextAreaWrapper = styled.div`
  flex: 1;
  position: relative;
`;

interface ISLeftPart {
  error: boolean;
  isDragging: boolean;
}

const SLeftPart = styled.div<ISLeftPart>`
  border: 1.5px solid
    ${(props) => {
      if (props.isDragging) {
        return props.theme.colorsThemed.background.outlines2;
      }

      if (props.error) {
        return props.theme.colorsThemed.accent.error;
      }

      return props.theme.colorsThemed.background.tertiary;
    }};
  display: flex;
  padding: 10.5px 20px;
  overflow: hidden;
  position: relative;
  background: ${(props) =>
    props.theme.colorsThemed.background[
      props.isDragging ? 'quinary' : 'tertiary'
    ]};
  align-items: center;
  border-radius: 16px;
  flex-direction: row;
  &:hover {
  }
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
    line-height: 24px;
  }
`;

const SErrorDiv = styled.div`
  left: 0;
  bottom: -20px;
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: flex-start;

  margin-top: 6px;

  text-align: center;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

  & > div {
    margin-right: 4px;
  }
`;
