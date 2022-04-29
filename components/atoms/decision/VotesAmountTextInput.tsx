import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { useAppSelector } from '../../../redux-store/store';
import { formatNumber } from '../../../utils/format';

interface IVotesAmountTextInput {
  value: string;
  minAmount: number;
  disabled?: boolean;
  autofocus?: boolean;
  inputAlign: 'left' | 'center';
  bottomPlaceholder?: string;
  placeholder: string;
  widthHardCoded?: string;
  onChange: (newValue: string) => void;
}

const VotesAmountTextInput: React.FunctionComponent<IVotesAmountTextInput> = ({
  value,
  minAmount,
  disabled,
  autofocus,
  inputAlign,
  bottomPlaceholder,
  placeholder,
  widthHardCoded,
  onChange,
}) => {
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const inputRef = useRef<HTMLInputElement>();
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      value.length > 0
        ? e.target.value
            .split(',')
            .filter((v) => v !== ',')
            .join('')
        : e.target.value;
    if (/[^0-9]/.test(newValue)) return;

    if (newValue.length > 5) return;

    // @ts-ignore
    onChange(newValue ? (newValue as number) : '');
  };

  useEffect(() => {
    if (autofocus) inputRef.current?.focus();
  }, [autofocus]);

  return (
    <SWrapper>
      <SInput
        ref={(el) => {
          inputRef.current = el!!;
        }}
        value={value ? `${formatNumber(parseInt(value), true)}` : value}
        disabled={disabled ?? false}
        align={inputAlign}
        inputMode='numeric'
        placeholder={`${minAmount.toString()} ${placeholder}`}
        onChange={handleOnChange}
        style={{
          ...(!isMobile
            ? {
                width: `calc(86px + ${Math.floor(value.length / 1.4)}em)`,
              }
            : {}),
          ...(widthHardCoded
            ? {
                width: widthHardCoded,
              }
            : {}),
        }}
      />
      <SPseudoPlaceholder
        onClick={() => {
          inputRef.current?.focus();
        }}
        style={{
          left: `calc(${Math.floor(value.length / 2)}em + 1.2em + ${
            isMobile ? '8px' : '16px'
          })`,
        }}
      >
        {value ? placeholder : ''}
      </SPseudoPlaceholder>
      {bottomPlaceholder && (
        <SBottomPlaceholder>{bottomPlaceholder}</SBottomPlaceholder>
      )}
    </SWrapper>
  );
};

VotesAmountTextInput.defaultProps = {
  disabled: undefined,
  autofocus: undefined,
  widthHardCoded: undefined,
  bottomPlaceholder: undefined,
};

export default VotesAmountTextInput;

const SWrapper = styled.div`
  position: relative;

  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 12px;

  ${({ theme }) => theme.media.tablet} {
    display: block;
  }
`;

const SInput = styled.input<{
  align: string;
}>`
  font-weight: 600;
  font-size: 32px;
  line-height: 40px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  text-align: left;

  padding: 12.5px 16px;
  padding-right: 4em;
  width: 100%;

  background-color: transparent;
  border: 1.5px solid transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colorsThemed.background.outlines2};
  }

  ${({ theme }) => theme.media.tablet} {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    min-width: 80px;

    padding-right: 0px;

    color: ${({ theme }) => theme.colorsThemed.text.primary};
    text-align: ${({ align }) => align};

    background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  }
`;

const SPseudoPlaceholder = styled.div`
  position: absolute;
  top: 12.5px;

  font-weight: 600;
  font-size: 32px;
  line-height: 40px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  ${({ theme }) => theme.media.tablet} {
    top: 14px;

    font-weight: 500;
    font-size: 16px;
    line-height: 24px;

    padding: 0px;
  }
`;

const SBottomPlaceholder = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    left: calc(100% + 12px);
    top: calc(50% - 8px);

    width: max-content;
  }

  ${({ theme }) => theme.media.laptop} {
    display: none;
  }
`;
