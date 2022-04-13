import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { formatNumber } from '../../../utils/format';

interface IVotesAmountInputModal {
  value: string;
  minAmount: number;
  disabled?: boolean;
  autofocus?: boolean;
  inputAlign: 'left' | 'center';
  bottomPlaceholder?: string;
  placeholder: string;
  pseudoPlaceholder: string;
  onChange: (newValue: string) => void;
}

const VotesAmountInputModal: React.FunctionComponent<IVotesAmountInputModal> = ({
  value,
  minAmount,
  disabled,
  autofocus,
  inputAlign,
  bottomPlaceholder,
  placeholder,
  pseudoPlaceholder,
  onChange,
}) => {

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
        inputMode="numeric"
        placeholder={`${minAmount.toString()} ${placeholder}`}
        onChange={handleOnChange}
        style={{
          width: `calc(86px + ${Math.floor(value.length / 1.4)}em)`,
        }}
      />
      <SPseudoPlaceholder
        onClick={() => {
          inputRef.current?.focus();
        }}
        style={{
          left: `calc(${Math.floor(value.length / 1.8)}em + 1.3em + 16px`,
        }}
      >
        {value ? pseudoPlaceholder : ''}
      </SPseudoPlaceholder>
      {bottomPlaceholder && (
        <SBottomPlaceholder>{bottomPlaceholder}</SBottomPlaceholder>
      )}
    </SWrapper>
  );
};

VotesAmountInputModal.defaultProps = {
  disabled: undefined,
  autofocus: undefined,
  bottomPlaceholder: undefined,
};

export default VotesAmountInputModal;

const SWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;

  margin-top: 24px;
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

  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  min-width: 80px;

  padding-right: 0px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  text-align: ${({ align }) => align};

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
`;

const SPseudoPlaceholder = styled.div`
  position: absolute;
  top: 12.5px;

  font-weight: 600;
  font-size: 32px;
  line-height: 40px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  top: 14px;

  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  padding: 0px;
`;

const SBottomPlaceholder = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
