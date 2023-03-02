import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import TextArea from 'react-textarea-autosize';
import AnimatedPresence from '../AnimatedPresence';

import InlineSvg from '../InlineSVG';
import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';
import getChunks from '../../../utils/getChunks/getChunks';

interface IEditPostTitleTextArea {
  id?: string;
  value: string;
  placeholder: string;
  maxChars: number;
  isValid: boolean;
  errorCaption?: string;
  disabled?: boolean;
  autofocus?: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

const EditPostTitleTextArea: React.FunctionComponent<
  IEditPostTitleTextArea
> = ({
  id,
  value,
  placeholder,
  disabled,
  autofocus,
  maxChars,
  isValid,
  errorCaption,
  onChange,
  onFocus,
  onBlur,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>();
  const [focused, setFocused] = useState(false);
  const [errorBordersShown, setErrorBordersShown] = useState(false);

  const clearValue = useCallback((rawValue: string): string => {
    if (!rawValue.trim()) {
      return '';
    }

    return rawValue.replaceAll('\n', '');
  }, []);

  const handleChange = useCallback(
    (e: any) => {
      const clearedValue = clearValue(e.target.value || '');
      onChange({
        target: {
          value: clearedValue,
        },
      } as ChangeEvent<HTMLTextAreaElement>);
    },
    [clearValue, onChange]
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(true);
      setErrorBordersShown(false);
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );
  const chunks = getChunks(value);
  const showPlaceholder = !value && !focused && !!placeholder;

  useEffect(() => {
    if (focused) return;
    if (isValid) setErrorBordersShown(false);

    if (!isValid && errorCaption) {
      setErrorBordersShown(true);
    }
  }, [focused, isValid, errorCaption]);

  useEffect(() => {
    if (autofocus) {
      setTimeout(() => {
        textareaRef.current?.focus();

        if (textareaRef.current?.setSelectionRange) {
          // Required to move the caret to the end of the textarea
          textareaRef.current?.setSelectionRange(999, 999);
        }
      }, 100);
    }
  }, [autofocus]);

  return (
    <SWrapper>
      <SInputContainer
        error={!!errorBordersShown}
        showPlaceholder={showPlaceholder}
      >
        <STextArea
          id={id}
          ref={(el) => {
            textareaRef.current = el!!;
          }}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxChars}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <SInputRenderer>
          {chunks.map((chunk, index) => {
            if (chunk.type === 'text') {
              // eslint-disable-next-line react/no-array-index-key
              return <span key={index}>{chunk.text}</span>;
            }

            if (chunk.type === 'hashtag') {
              // eslint-disable-next-line react/no-array-index-key
              return <Hashtag key={index}>#{chunk.text}</Hashtag>;
            }

            // TODO: Add assertNever
            throw new Error('Unexpected chunk');
          })}
        </SInputRenderer>
      </SInputContainer>
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

EditPostTitleTextArea.defaultProps = {
  disabled: undefined,
  autofocus: undefined,
};

export default EditPostTitleTextArea;

const SWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

interface ISTextArea {
  value: string;
}

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
