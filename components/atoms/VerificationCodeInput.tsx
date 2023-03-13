/* eslint-disable react/no-array-index-key */
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface IVerificationInput {
  id?: string;
  length: number;
  initialValue?: string[];
  error?: boolean;
  disabled: boolean;
  onComplete: (completeCode: string) => void;
  isInputFocused?: boolean;
}

const VerificationCodeInput: React.FunctionComponent<IVerificationInput> = ({
  id,
  length,
  initialValue,
  error,
  disabled,
  onComplete,
  isInputFocused,
}) => {
  const [code, setCode] = useState(
    initialValue ?? new Array(length).join('.').split('.')
  );
  const inputs = useRef<HTMLInputElement[]>(new Array(length));
  const wrapperRef = useRef<HTMLDivElement>();

  const handleSlotInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: number
  ) => {
    e.preventDefault();
    const newValue = e.target.value;
    // if (/[^1-9]/.test(newValue)) return;
    if (/[^0-9]/.test(newValue)) return;

    const workingCode = [...code];
    workingCode[slot] = newValue;
    setCode(() => [...workingCode]);

    if (slot !== length - 1) {
      inputs.current!![slot + 1].focus();
    }
    if (workingCode.every((v) => v !== '')) {
      inputs.current!![length - 1].blur();
    }
  };

  const handleDeleteSymbol = (
    e: React.KeyboardEvent<HTMLInputElement>,
    slot: number
  ) => {
    if (e.key === 'Backspace' && !code[slot] && slot !== 0) {
      const workingCode = [...code];
      workingCode[slot - 1] = '';
      setCode(() => [...workingCode]);
      inputs.current!![slot - 1].focus();
    }
  };

  const handlePreventTab = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const handlePasteToFirstSlot = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    let data = e.clipboardData.getData('Text');

    if (!data) return;

    const regex = /[0-9]/;

    data = data.replaceAll(/\s/g, '');

    if (data && !Array.isArray(data) && data.length === 6 && regex.test(data)) {
      const pastedCode = data.split('');
      setCode(() => [...pastedCode]);
    }
  };

  useEffect(() => {
    if (initialValue) setCode(() => [...initialValue]);
  }, [initialValue]);

  useEffect(() => {
    if (code.every((v) => v !== '')) {
      const completeCode = code.join('');

      inputs.current!![length - 1].blur();
      onComplete(completeCode);
    }
  }, [code, length, onComplete]);

  return (
    <>
      {/* Allows tabbing to the input */}
      <input
        style={{
          position: 'absolute',
          left: '-120vw',
          width: 0,
          height: 0,
        }}
        aria-roledescription='Confirmation code input'
        autoComplete='false'
        onFocus={(e) => {
          if (!disabled) wrapperRef?.current?.click();
          e.preventDefault();
        }}
      />
      <SVerficationInput
        id={id}
        errorBordersShown={error}
        role='textbox'
        ref={(el) => {
          wrapperRef.current = el!!;
        }}
        onClick={(e) => {
          if (error) return;

          e.stopPropagation();

          const lastEmpty = code.findIndex((el) => el === '');

          if (lastEmpty !== -1) {
            inputs.current!![lastEmpty].focus();
          } else {
            inputs.current!![length - 1].focus();
          }
        }}
      >
        {code.map((symbol, i) => (
          <input
            key={i}
            name='email-verification'
            inputMode='numeric'
            maxLength={1}
            value={symbol}
            tabIndex={-1}
            autoComplete='off'
            // We need this one to be focused once page opens
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={isInputFocused && !code[0].length && i === 0}
            disabled={disabled}
            readOnly={code[i].length > 0}
            onChange={(e) => handleSlotInput(e, i)}
            onKeyUp={(e) => handleDeleteSymbol(e, i)}
            onKeyDown={(e) => handlePreventTab(e)}
            onPaste={(e) => {
              e.preventDefault();
              if (i !== 0) {
                return;
              }
              handlePasteToFirstSlot(e);
            }}
            ref={(el) => {
              inputs.current[i] = el!!;
            }}
          />
        ))}
      </SVerficationInput>
    </>
  );
};

VerificationCodeInput.defaultProps = {
  initialValue: undefined,
  error: undefined,
  isInputFocused: true,
};

export default VerificationCodeInput;

interface ISVerficationInput {
  errorBordersShown?: boolean;
}

const SVerficationInput = styled.div<ISVerficationInput>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;

  padding-top: 24px;
  padding-bottom: 24px;

  input {
    display: block;

    text-align: center;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border-width: 1.5px;
    border-style: solid;
    border-color: ${({ theme, errorBordersShown }) => {
      if (!errorBordersShown) {
        // NB! Temp
        return theme.colorsThemed.background.outlines1;
      }
      return theme.colorsThemed.accent.error;
    }};

    // 32px - left and right padding, 6px - gap between inputs
    width: calc((100vw - 32px - (6px * 5)) / 6);
    max-width: 52px;
    height: 68px;

    padding: 14px;

    font-weight: 600;
    font-size: 32px;
    line-height: 40px;

    color: ${({ theme }) => theme.colorsThemed.text.primary};
    background: transparent;

    caret-color: transparent;

    ${({ theme }) => theme.media.mobileM} {
      width: 52px;
      height: 72px;
    }

    &:read-only {
      outline: none;
      cursor: default;

      pointer-events: none;

      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    &:focus,
    &:active {
      outline: none;

      border-color: ${({ theme, errorBordersShown }) => {
        if (!errorBordersShown) {
          return theme.colorsThemed.background.outlines2;
        }
        return theme.colorsThemed.accent.error;
      }};
    }
  }
`;

SVerficationInput.defaultProps = {
  errorBordersShown: undefined,
};
