import React, { useRef } from 'react';
import styled from 'styled-components';

interface IBidAmountTextInput {
  value: string;
  minAmount: number;
  onChange: (newValue: string) => void;
  inputAlign: 'left' | 'center';
  bottomPlaceholder?: string;
  horizontalPadding?: string;
  style?: React.CSSProperties;
}

const BidAmountTextInput:React.FunctionComponent<IBidAmountTextInput> = ({
  value,
  minAmount,
  inputAlign,
  horizontalPadding,
  onChange,
  bottomPlaceholder,
  style,
}) => {
  const inputRef = useRef<HTMLInputElement>();
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(1);
    if (/[^0-9]/.test(newValue)) return;
    // if (parseInt(newValue, 10) < minAmount) return;
    onChange(newValue);
  };

  return (
    <SWrapper>
      <SInput
        ref={(el) => {
          inputRef.current = el!!;
        }}
        value={`$${value}`}
        align={inputAlign}
        horizontalPadding={horizontalPadding}
        onChange={handleOnChange}
        style={style ?? {}}
      />
      {!value && (
        <PseudoPlaceholder
          onClick={() => inputRef.current?.focus()}
          align={inputAlign}
          horizontalPadding={horizontalPadding}
        >
          { minAmount }
        </PseudoPlaceholder>
      )}
      {bottomPlaceholder && (
        <SBottomPlaceholder>
          { bottomPlaceholder }
        </SBottomPlaceholder>
      )}
    </SWrapper>
  );
};

BidAmountTextInput.defaultProps = {
  bottomPlaceholder: undefined,
  horizontalPadding: undefined,
  style: {},
};

export default BidAmountTextInput;

const SWrapper = styled.div`
  position: relative;
`;

const SInput = styled.input<{
  align: string;
  horizontalPadding?: string;
}>`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  padding: 12.5px ${({ horizontalPadding }) => horizontalPadding ?? '5px'};
  min-width: 80px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  text-align: ${({ align }) => align};

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }

  &:focus {
    outline: none;
  }
`;

const PseudoPlaceholder = styled.div<{
  align: string;
  horizontalPadding?: string;
}>`
  position: absolute;
  left: 0;
  top: 0;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: ${(props) => props.theme.colorsThemed.text.quaternary};
  padding: 12.5px calc(.6rem + ${({ horizontalPadding }) => horizontalPadding ?? '5px'});
  text-align: ${({ align }) => align};
`;

const SBottomPlaceholder = styled.div`

`;
