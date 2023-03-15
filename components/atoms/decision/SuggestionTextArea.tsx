import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import AnimatedPresence from '../AnimatedPresence';
import InlineSvg from '../InlineSVG';
import alertIcon from '../../../public/images/svg/icons/filled/Alert.svg';

interface ISuggestionTextArea {
  id?: string;
  className?: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  autofocus?: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const SuggestionTextArea: React.FunctionComponent<ISuggestionTextArea> = ({
  id,
  className,
  value,
  placeholder,
  disabled,
  autofocus,
  error,
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
    <SWrapper className={className}>
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
      {error ? (
        <AnimatedPresence animation='t-09'>
          <SErrorDiv>
            <InlineSvg svg={alertIcon} width='16px' height='16px' />
            {error}
          </SErrorDiv>
        </AnimatedPresence>
      ) : null}
    </SWrapper>
  );
};

SuggestionTextArea.defaultProps = {
  disabled: undefined,
  autofocus: undefined,
};

export default SuggestionTextArea;

const SWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 277px;
`;

const STextarea = styled.textarea`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  padding: 12.5px 20px;
  resize: none;
  width: 100%;

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
