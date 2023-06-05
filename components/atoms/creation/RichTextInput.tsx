/* eslint-disable react/no-array-index-key */
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import TextArea from 'react-textarea-autosize';

import getChunks from '../../../utils/getChunks/getChunks';
import AnimatedPresence from '../AnimatedPresence';
import InlineSvg from '../InlineSVG';
import alertIcon from '../../../public/images/svg/icons/filled/Alert.svg';

interface IRichTextInput {
  id?: string;
  value: string;
  placeholder: string;
  maxlength?: number;
  error?: string;
  onChange: (key: string, text: string) => void;
  onBlur?: (key: string, value: string) => void;
  onFocus?: (key: string) => void;
}

const RichTextInput: React.FC<IRichTextInput> = ({
  id = '',
  value,
  placeholder,
  maxlength,
  error,
  onChange,
  onBlur = () => {},
  onFocus = () => {},
}) => {
  const [focused, setFocused] = useState(false);

  const clearValue = useCallback((rawValue: string): string => {
    if (!rawValue.trim()) {
      return '';
    }

    return rawValue.replaceAll('\n', '');
  }, []);

  const handleChange = useCallback(
    (e: any) => {
      // eslint-disable-next-line no-nested-ternary
      const newValue = e?.target?.value
        ? typeof e.target.value === 'string'
          ? e.target.value
          : e.target.value.toString()
        : '';

      const clearedValue = clearValue(newValue);
      onChange(id, clearedValue);
    },
    [id, clearValue, onChange]
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocus(id);
  }, [id, onFocus]);

  const handleBlur = useCallback(
    (e: any) => {
      const clearedValue = clearValue(e.target.value || '');
      setFocused(false);
      onBlur(id, clearedValue);
    },
    [id, clearValue, onBlur]
  );

  const chunks = getChunks(value);
  const showPlaceholder = !value && !focused && !!placeholder;

  return (
    <SWrapper>
      <SInputContainer error={!!error} showPlaceholder={showPlaceholder}>
        <STextArea
          id={id}
          value={value}
          placeholder={placeholder}
          maxLength={maxlength}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <SInputRenderer>
          {chunks.map((chunk, index) => {
            if (chunk.type === 'text') {
              return <span key={index}>{chunk.text}</span>;
            }

            if (chunk.type === 'hashtag') {
              return <Hashtag key={index}>#{chunk.text}</Hashtag>;
            }

            // TODO: Add assertNever
            throw new Error('Unexpected chunk');
          })}
        </SInputRenderer>
      </SInputContainer>
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

RichTextInput.defaultProps = {
  id: '',
  error: '',
  maxlength: 524288,
  onBlur: () => {},
  onFocus: () => {},
};

export default RichTextInput;

const SWrapper = styled.div`
  position: relative;
`;

interface ISInputContainer {
  error: boolean;
  showPlaceholder: boolean;
}

const SInputContainer = styled.div<ISInputContainer>`
  position: relative;
  width: 100%;
  height: auto;
  min-height: 44px;
  padding: 10.5px 18.5px 10.5px 18.5px;

  border-radius: 16px;
  border-width: 1.5px;
  border-style: solid;
  border-color: ${({ theme, error }) => {
    if (!error) {
      return 'transparent';
    }
    return theme.colorsThemed.accent.error;
  }};

  background: ${(props) => props.theme.colorsThemed.background.tertiary};

  ${({ theme }) => theme.media.tablet} {
    min-height: 48px;
  }
`;

interface ISTextArea {
  value: string;
}

const STextArea = styled(TextArea)<ISTextArea>`
  position: relative;
  display: block;
  width: 100%;
  resize: none;
  border: none;
  outline: none;

  background: transparent;

  overflow: hidden;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  inset: 0;

  z-index: 1;

  -webkit-text-fill-color: ${({ value }) =>
    value ? 'transparent' : undefined};
  color: transparent;
  caret-color: ${({ theme }) => (theme.name === 'light' ? 'black' : 'white')};

  ::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: ${({ theme }) => theme.colorsThemed.text.quaternary};
    opacity: 1; /* Firefox */
  }

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }

  font-size: 14px;
  line-height: 20px;

  // Prevents size changes on initial rendering
  &&& {
    height: ${({ value }) => (!value ? '20px!important' : undefined)};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;

    // Prevents size changes on initial rendering
    &&& {
      height: ${({ value }) => (!value ? '24px!important' : undefined)};
    }
  }
`;

const SInputRenderer = styled.div`
  position: absolute;
  inset: 0;
  display: inline;
  margin: 10.5px 18.5px 10.5px 18.5px;

  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.colorsThemed.text.primary};

  overflow-wrap: break-word;
  white-space: pre-wrap;
  overflow-x: auto;
  user-select: none;
  scrollbar-width: none;

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }

  ::selection {
    color: ${(props) => props.theme.colors.white};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const Hashtag = styled.span`
  color: ${(props) => props.theme.colorsThemed.accent.blue};
  font-weight: 500;
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
