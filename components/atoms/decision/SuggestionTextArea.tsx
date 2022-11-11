import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface ISuggestionTextArea {
  id?: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  autofocus?: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const SuggestionTextArea: React.FunctionComponent<ISuggestionTextArea> = ({
  id,
  value,
  placeholder,
  disabled,
  autofocus,
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>();

  useEffect(() => {
    if (!value && textareaRef?.current) {
      textareaRef.current.style.height = '';
    } else if (value && textareaRef?.current) {
      // (textareaRef.current.scrollHeight % 24) need to prevent input jump. 24 is text line-height
      textareaRef.current.style.height = `${
        textareaRef.current.scrollHeight -
        (textareaRef.current.scrollHeight % 24)
      }px`;
    }
  }, [value]);

  useEffect(() => {
    if (autofocus) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [autofocus]);

  return (
    <STextarea
      id={id}
      ref={(el) => {
        textareaRef.current = el!!;
      }}
      rows={1}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      // (textareaRef.current.scrollHeight % 24) need to prevent input jump. 24 is text line-height
      onChangeCapture={() => {
        if (textareaRef?.current) {
          textareaRef.current.style.height = '';
          textareaRef.current.style.height = `${
            textareaRef.current.scrollHeight -
            (textareaRef.current.scrollHeight % 24)
          }px`;
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      }}
      onChange={onChange}
    />
  );
};

SuggestionTextArea.defaultProps = {
  disabled: undefined,
  autofocus: undefined,
};

export default SuggestionTextArea;

const STextarea = styled.textarea`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  padding: 12.5px 20px;
  resize: none;
  width: 277px;

  height: 48px;
  max-height: 200px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border: 1.5px solid transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colorsThemed.background.outlines2};
  }
`;
