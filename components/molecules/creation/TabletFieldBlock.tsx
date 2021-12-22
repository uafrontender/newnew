import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';

interface ITabletFieldBlock {
  id: string;
  type?: 'input' | 'select' | 'date' | '';
  value: any;
  options?: {}[];
  onChange: (key: string, value: string | number | boolean | object) => void;
  inputProps?: {
    min?: number;
    type?: 'text' | 'number' | 'tel';
    pattern?: string;
  };
  formattedValue?: any;
  formattedDescription?: any;
}

export const TabletFieldBlock: React.FC<ITabletFieldBlock> = (props) => {
  const {
    id,
    type,
    value,
    inputProps,
    formattedValue,
    formattedDescription,
    onChange,
  } = props;
  const inputRef: any = useRef();
  const { t } = useTranslation('creation');

  const handleChange = useCallback((e) => {
    onChange(id, e.target.value);
  }, [id, onChange]);
  const handleBlur = useCallback(() => {
    if (inputProps?.type === 'number' && inputProps?.min as number > value) {
      onChange(id, inputProps?.min as number);
    }
  }, [inputProps, id, onChange, value]);

  const inputLabel = t(`secondStep.field.${id}.label`);

  return (
    <SContainer>
      <STitle variant={2} weight={600}>
        {t(`secondStep.field.${id}.title`)}
      </STitle>
      <SContentPart>
        {type === 'input' ? (
          <SInputWrapper>
            <SInputContent>
              {inputLabel && (
                <SInputLabel htmlFor={id}>
                  {inputLabel}
                </SInputLabel>
              )}
              <SInput
                id={id}
                ref={inputRef}
                value={value}
                onBlur={handleBlur}
                onChange={handleChange}
                withLabel={!!inputLabel}
                placeholder={t(`secondStep.field.${id}.placeholder`)}
                {...inputProps}
              />
            </SInputContent>
          </SInputWrapper>
        ) : (
          <SValue variant={6}>
            {t(`secondStep.field.${id}.value`, { value: formattedValue || value })}
          </SValue>
        )}
        <SDescription variant={3} weight={600}>
          {t(`secondStep.field.${id}.description`, { value: formattedDescription || value })}
        </SDescription>
      </SContentPart>
    </SContainer>
  );
};

export default TabletFieldBlock;

TabletFieldBlock.defaultProps = {
  type: '',
  options: [],
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

const SValue = styled(Headline)``;

const SDescription = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  width: 50%;
`;

const SInputLabel = styled.label`
  top: 50%;
  left: 0;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  position: absolute;
  transform: translateY(-50%);

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const SInputWrapper = styled.div`
  width: 50%;
  padding: 12px 20px;
  overflow: hidden;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;
`;

const SInputContent = styled.div`
  position: relative;
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
  -moz-appearance: none;
  -ms-appearance: none;
  -o-appearance: none;
  appearance: none;

  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }
`;
