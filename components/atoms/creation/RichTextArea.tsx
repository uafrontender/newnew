import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import ContentEditable from 'react-contenteditable';

import InlineSvg from '../InlineSVG';
import AnimatedPresence from '../AnimatedPresence';

import alertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import getChunks from '../../../utils/getChunks/getChunks';

interface IRichTextArea {
  id?: string;
  value: string;
  placeholder: string;
  maxlength?: number;
  error?: string;
  onChange: (key: string, text: string) => void;
  onBlur?: (key: string, value: string) => void;
  onFocus?: (key: string) => void;
}

export const RichTextArea: React.FC<IRichTextArea> = React.memo((props) => {
  const {
    id = '',
    value,
    placeholder,
    maxlength,
    error,
    onChange,
    onBlur = () => {},
    onFocus = () => {},
  } = props;

  const inputRef = useRef<ContentEditable>();
  const [focused, setFocused] = useState(false);

  const clearValue = (rawValue: string) => {
    // Removes spans used to highlight chunks
    const undecoratedValue = rawValue
      .replaceAll(/<\/?span.*?>/g, '')
      .replaceAll('<br>', '');

    // Decodes all html entities
    const txt = document.createElement('textarea');
    txt.innerHTML = undecoratedValue;
    const decodedValue = txt.value;

    // Replace non breakable spaces with regular ones
    const clearedValue = decodedValue.replaceAll(String.fromCharCode(160), ' ');
    return clearedValue;
  };

  // TODO: improve control over chariot. Manually control. Old position +- length diff

  // Will do hashes only for now, can be expanded
  const decorateValue = (rawValue: string) => {
    const chunks = getChunks(rawValue);
    return chunks
      .map((chunk) => {
        if (chunk.type === 'text') {
          return chunk.text.replaceAll(' ', '&nbsp;');
        }

        if (chunk.type === 'hashtag') {
          return `<span class="hashtag">#${chunk.text}</span>`;
        }

        // TODO: Add assertNever
        throw new Error('Unexpected chunk');
      })
      .join('');
  };

  const handleFocus = useCallback(() => {
    setFocused(true);

    onFocus(id);
  }, [id, onFocus]);

  const handleBlur = () => {
    setFocused(false);

    if (inputRef.current) {
      const clearedValue = clearValue(inputRef.current.lastHtml || '');
      onBlur(id, clearedValue);
    }
  };

  const showPlaceholder = !value && !focused && !!placeholder;

  const enrichedValue = decorateValue(value);

  return (
    <SWrapper>
      <SContent error={!!error} showPlaceholder={showPlaceholder}>
        <ContentEditable
          ref={(element: any) => {
            if (element) {
              inputRef.current = element;
            }
          }}
          id={id}
          className='div-input'
          onBlur={handleBlur}
          onFocus={handleFocus}
          onChange={(e) => {
            const clearedValue = clearValue(e.target.value);
            if (maxlength && clearValue.length > maxlength) {
              return;
            }

            onChange(id, clearedValue);
          }}
          html={showPlaceholder ? placeholder : enrichedValue}
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
});

export default RichTextArea;

RichTextArea.defaultProps = {
  id: '',
  error: '',
  maxlength: 524288,
  onBlur: () => {},
  onFocus: () => {},
};

const SWrapper = styled.div`
  position: relative;
`;

interface ISContent {
  error: boolean;
  showPlaceholder: boolean;
}

const SContent = styled.div<ISContent>`
  padding: 10.5px 18.5px 10.5px 18.5px;
  position: relative;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;
  border-width: 1.5px;
  border-style: solid;
  border-color: ${({ theme, error }) => {
    if (!error) {
      return 'transparent';
    }
    return theme.colorsThemed.accent.error;
  }};

  .div-input {
    display: inline-block;
    color: ${(props) =>
      props.showPlaceholder
        ? props.theme.colorsThemed.text.quaternary
        : props.theme.colorsThemed.text.primary};
    width: 100%;
    border: none;
    resize: none;
    outline: none;
    background: transparent;
    font-weight: 500;
    word-break: break-word;

    font-size: 14px;
    line-height: 20px;

    ${({ theme }) => theme.media.tablet} {
      font-size: 16px;
      line-height: 24px;
    }

    span {
      display: inline;
      word-spacing: normal;
      overflow-wrap: break-word;
    }

    .hashtag {
      color: ${(props) => props.theme.colorsThemed.accent.blue};
      font-weight: 500;
    }
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
