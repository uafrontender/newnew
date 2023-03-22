import React, { ChangeEvent, FocusEvent, useCallback } from 'react';
import styled from 'styled-components';
import CommentTextAreaAutoSize from 'react-textarea-autosize';

import InlineSvg from '../InlineSVG';
import AnimatedPresence from '../AnimatedPresence';

import alertIcon from '../../../public/images/svg/icons/filled/Alert.svg';

interface ICommentTextArea {
  id?: string;
  value: string;
  error?: string;
  focus?: boolean;
  maxlength?: number;
  onBlur?: (key: string, value: string) => void;
  onFocus?: (key: string) => void;
  onChange: (key: string, value: string) => void;
  placeholder: string;
}

export const CommentTextArea: React.FC<ICommentTextArea> = (props) => {
  const {
    id = '',
    maxlength,
    value,
    error,
    focus,
    onBlur = () => {},
    onFocus = () => {},
    onChange,
    placeholder,
  } = props;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(id, e.target.value);
    },
    [id, onChange]
  );

  const handleFocus = useCallback(() => {
    onFocus(id);
  }, [id, onFocus]);

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLTextAreaElement>) => {
      onBlur(id, e.target.value);
    },
    [id, onBlur]
  );

  return (
    <SWrapper>
      <SContent error={!!error} focus={focus ?? false}>
        <SCommentTextArea
          value={value}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxlength}
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

export default CommentTextArea;

CommentTextArea.defaultProps = {
  id: '',
  error: '',
  maxlength: 524288,
  focus: undefined,
  onBlur: (key, value) => console.log(key, value),
  onFocus: (key) => console.log(key),
};

const SWrapper = styled.div`
  position: relative;
`;

interface ISContent {
  focus: boolean;
  error: boolean;
}

const SContent = styled.div<ISContent>`
  position: relative;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;

  border: 1.5px solid
    ${({ focus, theme, error }) => {
      if (error) {
        return theme.colorsThemed.accent.error;
      }
      if (focus) {
        return theme.colorsThemed.background.outlines2;
      }
      return theme.colorsThemed.background.secondary;
    }};
`;

const SCommentTextArea = styled(CommentTextAreaAutoSize)`
  padding: 9px 20px;
  width: 100%;

  resize: none;

  border: none;
  outline: none;
  background: transparent;
  font-weight: 500;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 14px;
  line-height: 20px;
  vertical-align: middle;

  border: 1.5px solid transparent;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }

  &:focus {
    outline: none;
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
