/* eslint-disable no-nested-ternary */
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import TextAreaAutoSize from 'react-textarea-autosize';
import { useRouter } from 'next/router';
import InlineSvg from '../InlineSVG';
import AnimatedPresence from '../AnimatedPresence';

import alertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import { useGetChats } from '../../../contexts/chatContext';

interface ITextArea {
  id?: string;
  value: string;
  error?: string;
  maxlength?: number;
  onChange: (key: string, value: string, isShiftEnter: boolean) => void;
  placeholder: string;
  gotMaxLength?: () => void;
  setTextareaFocused?: () => void;
}

export const TextArea: React.FC<ITextArea> = (props) => {
  const {
    id = '',
    maxlength,
    value,
    error,
    onChange,
    placeholder,
    gotMaxLength,
    setTextareaFocused,
  } = props;

  const [isShiftEnter, setisShiftEnter] = useState<boolean>(false);
  const router = useRouter();
  const { mobileChatOpened } = useGetChats();

  const isDashboard = useMemo(() => {
    if (
      router.asPath.includes('/creator/dashboard') ||
      router.asPath.includes('/creator/bundles')
    ) {
      return true;
    }
    return false;
  }, [router.asPath]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(id, e.target.value, isShiftEnter);
    },
    [id, onChange, isShiftEnter]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      /* eslint-disable no-unused-expressions */
      if (e.key === 'Enter' && value.length === 500) {
        gotMaxLength?.();
      }

      e.key === 'Enter' && e.shiftKey === true
        ? setisShiftEnter(true)
        : setisShiftEnter(false);
    },
    [gotMaxLength, value.length]
  );

  const handleFocus = useCallback(() => {
    setTextareaFocused?.();
  }, [setTextareaFocused]);

  return (
    <SWrapper>
      <SContent
        error={!!error}
        isDashboard={isDashboard}
        isMobileChatOpened={mobileChatOpened}
      >
        <STextArea
          maxRows={8}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxlength}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
        />
      </SContent>
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

export default TextArea;

TextArea.defaultProps = {
  id: '',
  error: '',
  maxlength: 524288,
  gotMaxLength: () => {},
  setTextareaFocused: () => {},
};

const SWrapper = styled.div`
  position: relative;
`;

interface ISContent {
  error: boolean;
  isDashboard?: boolean;
  isMobileChatOpened?: boolean;
}

const SContent = styled.div<ISContent>`
  position: relative;
  background: ${({ theme, isDashboard, isMobileChatOpened }) =>
    !isDashboard || isMobileChatOpened
      ? theme.name === 'light'
        ? theme.colors.white
        : theme.colorsThemed.background.tertiary
      : theme.colorsThemed.background.tertiary};
  border-radius: 16px;

  border-width: 0;
  border-style: solid;
  display: flex;
  border-color: ${({ theme, error }) => {
    if (!error) {
      return 'transparent';
    }
    return theme.colorsThemed.accent.error;
  }};
`;

const STextArea = styled(TextAreaAutoSize)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  resize: none;
  outline: none;
  background: transparent;
  font-weight: 500;
  padding: 13px 18.5px;
  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
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
