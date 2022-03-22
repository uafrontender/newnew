import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface ISuggestionTextArea {
  value: string;
  placeholder: string;
  disabled?: boolean;
  autofocus?: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const SuggestionTextArea:React.FunctionComponent<ISuggestionTextArea> = ({
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
    }
  }, [value]);

  useEffect(() => {
    if (autofocus) textareaRef.current?.focus();
  }, [autofocus]);

  return (
    <STextarea
      ref={(el) => {
        textareaRef.current = el!!;
      }}
      rows={1}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChangeCapture={() => {
        if (textareaRef?.current) {
          textareaRef.current.style.height = '';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 3}px`;
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

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border: 1.5px solid transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colorsThemed.background.outlines2};
  }
`;
