import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface ITopUpWalletInput {
  isOpen: boolean;
  value: number;
  onChange: (newValue: number) => void;
}

const TopUpWalletInput: React.FunctionComponent<ITopUpWalletInput> = ({
  isOpen,
  value,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>();

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(1);
    if (/[^0-9]/.test(newValue)) return;

    onChange(parseInt(newValue));
  };

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <SContainer>
      <SInput
        ref={(el) => {
          inputRef.current = el!!;
        }}
        inputMode='numeric'
        value={`$${value}`}
        onChange={handleOnChange}
      />
    </SContainer>
  );
};

export default TopUpWalletInput;

const SContainer = styled.div`
  margin-top: 154px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 34px;
    margin-bottom: 24px;
  }
`;

const SInput = styled.input`
  font-weight: 600;
  font-size: 32px;
  line-height: 40px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  background-color: transparent;
  border: transparent;

  text-align: center;

  width: 100%;

  &:focus {
    outline: none;
  }
`;
