import React, { useCallback } from 'react';
import styled from 'styled-components';
import CommentTextAreaAutoSize from 'react-textarea-autosize';

import InlineSvg from '../InlineSVG';
import AnimatedPresence from '../AnimatedPresence';

import alertIcon from '../../../public/images/svg/icons/filled/Alert.svg';

interface ICommentTextArea {
  id?: string;
  value: string;
  error?: string;
  maxlength?: number;
  onBlur?: (key: string, value: string) => void;
  onFocus?: (key: string) => void;
  onChange: (key: string, value: string | boolean) => void;
  placeholder: string;
}

export const CommentTextArea: React.FC<ICommentTextArea> = (props) => {
  const { id = '', maxlength, value, error, onBlur = () => {}, onFocus = () => {}, onChange, placeholder } = props;

  const handleChange = useCallback(
    (e) => {
      onChange(id, e.target.value);
    },
    [id, onChange]
  );
  const handleFocus = useCallback(() => {
    onFocus(id);
  }, [id, onFocus]);
  const handleBlur = useCallback(
    (e) => {
      onBlur(id, e.target.value);
    },
    [id, onBlur]
  );

  return (
    <SWrapper>
      <SContent error={!!error}>
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
        <AnimatedPresence animation="t-09">
          <SErrorDiv>
            <InlineSvg svg={alertIcon} width="16px" height="16px" />
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
  onBlur: (key, value) => console.log(key, value),
  onFocus: (key) => console.log(key),
};

const SWrapper = styled.div`
  position: relative;
`;

interface ISContent {
  error: boolean;
}

const SContent = styled.div<ISContent>`
  padding: 9px 20px;
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
`;

const SCommentTextArea = styled(CommentTextAreaAutoSize)`
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
