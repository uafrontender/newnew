import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import Caption from '../../atoms/Caption';
import DropdownSelect from '../../atoms/DropdownSelect';

import { useAppState } from '../../../contexts/appStateContext';

interface ITabletFieldBlock {
  id: string;
  type?: 'input' | 'select' | 'date' | '';
  value: any;
  options?: {}[];
  maxItems?: number;
  onChange: (key: string, value: string | number | boolean | object) => void;
  inputProps?: {
    min?: number;
    type?: 'text' | 'number' | 'tel';
    pattern?: string;
    max?: number;
    customPlaceholder?: string;
  };
  formattedValue?: any;
  formattedDescription?: any;
}

const TabletFieldBlock: React.FC<ITabletFieldBlock> = (props) => {
  const {
    id,
    type,
    value,
    options,
    maxItems,
    inputProps,
    formattedValue,
    formattedDescription,
    onChange,
  } = props;
  const { t } = useTranslation('page-Creation');
  const inputRef: any = useRef();
  const { resizeMode } = useAppState();
  const isTablet = ['tablet'].includes(resizeMode);

  const handleBlur = useCallback(() => {
    if (inputProps?.type === 'number' && (inputProps?.min as number) > value) {
      onChange(id, inputProps?.min as number);
    }
    if (inputProps?.type === 'number' && (inputProps?.max as number) < value) {
      onChange(id, inputProps?.max as number);
    }
  }, [inputProps, id, onChange, value]);
  const getSelectOptions = () =>
    options?.map((item: any) => ({
      name: item.title,
      value: item.id,
    })) || [];

  const inputLabel = t(`secondStep.field.${id}.label` as any);

  return (
    <SContainer>
      <STitle variant={2} weight={600}>
        {t(`secondStep.field.${id}.title` as any)}
      </STitle>
      <SContentPart>
        {type === 'input' ? (
          <SInputWrapper>
            <SInputContent>
              {inputLabel && (
                <SInputLabel htmlFor={id}>{inputLabel}</SInputLabel>
              )}
              <SInput
                id={id}
                ref={inputRef}
                value={value}
                onBlur={handleBlur}
                onChange={(e) => {
                  onChange(id, e?.target?.value);
                }}
                withLabel={!!inputLabel}
                placeholder={
                  inputProps?.customPlaceholder ??
                  t(`secondStep.field.${id}.placeholder` as any)
                }
                {...inputProps}
              />
            </SInputContent>
          </SInputWrapper>
        ) : (
          <DropdownSelect<string>
            id={id}
            closeOnSelect
            width={isTablet ? '200px' : '208px'}
            label={t(`secondStep.field.${id}.value` as any, {
              value: formattedValue || value,
            })}
            options={getSelectOptions()}
            selected={value}
            maxItems={maxItems}
            direction='top'
            onSelect={(newValue) => {
              onChange(id, newValue);
            }}
          />
        )}
        <SDescription variant={3} weight={600}>
          {t(`secondStep.field.${id}.description` as any, {
            value: formattedDescription || value,
          })}
        </SDescription>
      </SContentPart>
    </SContainer>
  );
};

export default TabletFieldBlock;

TabletFieldBlock.defaultProps = {
  type: '',
  options: [],
  maxItems: 0,
  inputProps: {
    type: 'text',
  },
  formattedValue: '',
  formattedDescription: '',
};

const SContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SContentPart = styled.div`
  gap: 16px;
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const STitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-bottom: 6px;
`;

const SDescription = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SInputLabel = styled.label`
  top: 50%;
  left: 0;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  position: absolute;
  transform: translateY(-50%);

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const SInputWrapper = styled.div`
  width: 200px;
  padding: 12px 20px;
  overflow: hidden;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;

  ${({ theme }) => theme.media.laptop} {
    width: 208px;
  }
`;

const SInputContent = styled.div`
  display: flex;
  position: relative;
  justify-content: space-between;
`;

interface ISInput {
  withLabel: boolean;
}

const SInput = styled.input<ISInput>`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding-left: ${(props) => (props.withLabel ? '9px' : '0')};

  -webkit-appearance: none;
  -ms-appearance: none;
  -o-appearance: none;
  appearance: none;

  /* Works for Chrome, Safari, Edge, Opera */
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }

  /* Works for Firefox */
  -moz-appearance: textfield;

  &::placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.quaternary};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }
`;
