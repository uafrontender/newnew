import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import InlineSvg from '../InlineSVG';
import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import AnimatedPresence from '../AnimatedPresence';

type TBioTextarea = React.ComponentPropsWithoutRef<'textarea'> & {
  maxChars: number;
  isValid: boolean;
  errorCaption: string;
};

const BioTextarea: React.FunctionComponent<TBioTextarea> = ({
  maxChars,
  value,
  isValid,
  errorCaption,
  onChange,
  ...rest
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>();
  const [charCounter, setCharCounter] = useState((value as string).length);

  const [errorBordersShown, setErrorBordersShown] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (focused) return;
    if (isValid) setErrorBordersShown(false);

    if (!isValid && errorCaption) {
      setErrorBordersShown(true);
    }
  }, [focused, isValid, errorCaption]);

  useEffect(() => {
    setCharCounter((value as string).length);
  }, [value, setCharCounter]);

  useEffect(() => {
    if (!value && textareaRef?.current) {
      textareaRef.current.style.height = '';
    } else if (value && textareaRef?.current) {
      textareaRef.current.style.height = `${
        textareaRef.current.scrollHeight + 3
      }px`;
    }
  }, [value]);

  return (
    <SWrapper>
      <SBioTextareaDiv errorBordersShown={errorBordersShown}>
        <textarea
          ref={(el) => {
            textareaRef.current = el!!;
          }}
          value={value}
          maxLength={maxChars}
          rows={2}
          onChange={(e) => {
            if (onChange && e.target.value.length <= maxChars) {
              onChange(e);
            }
          }}
          onChangeCapture={() => {
            if (textareaRef?.current) {
              textareaRef.current.style.height = '';
              textareaRef.current.style.height = `${
                textareaRef.current.scrollHeight + 3
              }px`;
            }
          }}
          onPaste={(e) => {
            const data = e.clipboardData.getData('Text');

            if (!data || data.length > maxChars) {
              e.preventDefault();
            }
          }}
          onBlur={() => {
            setFocused(false);
          }}
          onFocus={() => {
            setFocused(true);
            setErrorBordersShown(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (value as string)?.length > 0) {
              const localValue = value as string;
              if (localValue.charCodeAt(localValue.length - 1) === 10) {
                onChange?.({
                  target: {
                    value: localValue.slice(0, -1),
                  },
                } as any);
              }
            }
          }}
          {...rest}
        />
        <SCharCounter>
          {charCounter}/{maxChars}
        </SCharCounter>
      </SBioTextareaDiv>
      {errorBordersShown ? (
        <AnimatedPresence animation='t-09'>
          <SErrorDiv>
            <InlineSvg svg={AlertIcon} width='16px' height='16px' />
            {errorCaption}
          </SErrorDiv>
        </AnimatedPresence>
      ) : null}
    </SWrapper>
  );
};

export default BioTextarea;

const SWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

interface ISBioTextareaDiv {
  errorBordersShown?: boolean;
}

const SBioTextareaDiv = styled.div<ISBioTextareaDiv>`
  position: relative;

  display: flex;

  textarea {
    display: block;
    white-space: break-spaces;

    width: 100%;

    padding: 12.5px 20px;

    padding-bottom: 36px;

    font-weight: 500;
    font-size: 16px;
    line-height: 24px;

    /* Hide scrollbar */
    ::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border-width: 1.5px;
    border-style: solid;
    border-color: ${({ theme, errorBordersShown }) => {
      if (!errorBordersShown) {
        return 'transparent';
      }
      return theme.colorsThemed.accent.error;
    }};

    color: ${({ theme }) => theme.colorsThemed.text.primary};
    background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

    resize: none;

    &::placeholder {
      color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    }
    &:-ms-input-placeholder {
      color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    }
    &::-ms-input-placeholder {
      color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    }

    &:hover:enabled,
    &:focus:enabled,
    &:active:enabled {
      outline: none;

      border-color: ${({ theme, errorBordersShown }) => {
        if (!errorBordersShown) {
          // NB! Temp
          return theme.colorsThemed.background.outlines2;
        }
        return theme.colorsThemed.accent.error;
      }};
    }

    &:disabled {
      opacity: 0.5;
    }
  }
`;

const SCharCounter = styled.div`
  position: absolute;
  right: 12px;
  bottom: 6px;

  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  user-select: none;
`;

const SErrorDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

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
