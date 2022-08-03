import React, { ChangeEvent, useCallback, useState } from 'react';
import styled from 'styled-components';
import TextAreaAutoSize from 'react-textarea-autosize';

import InlineSvg from '../InlineSVG';
import AnimatedPresence from '../AnimatedPresence';

import alertIcon from '../../../public/images/svg/icons/filled/Alert.svg';

interface ITextArea {
  id?: string;
  value: string;
  error?: string;
  maxlength?: number;
  onChange: (key: string, value: string, isShiftEnter: boolean) => void;
  placeholder: string;
  // onKeydown?: (e: React.KeyboardEvent) => void;
}

export const TextArea: React.FC<ITextArea> = (props) => {
  const {
    id = '',
    maxlength,
    value,
    error,
    onChange,
    placeholder,
    // onKeydown,
  } = props;

  const [isShiftEnter, setisShiftEnter] = useState<boolean>(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(id, e.target.value, isShiftEnter);
    },
    [id, onChange, isShiftEnter]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    /* eslint-disable no-unused-expressions */
    e.key === 'Enter' && e.shiftKey === true
      ? setisShiftEnter(true)
      : setisShiftEnter(false);
  }, []);

  return (
    <SWrapper>
      <SContent error={!!error}>
        <STextArea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxlength}
          onKeyDown={handleKeyDown}
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
  // onKeydown: (e: React.KeyboardEvent) => {},
};

const SWrapper = styled.div`
  position: relative;
`;

interface ISContent {
  error: boolean;
}

const SContent = styled.div<ISContent>`
  padding: 10.5px 18.5px 10.5px 18.5px;
  position: relative;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;

  border-width: 1.5px;
  border-style: solid;
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
