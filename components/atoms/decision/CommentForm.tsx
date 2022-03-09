import React, { useCallback, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Button from '../Button';
import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';
import InlineSVG from '../InlineSVG';
import TextArea from '../creation/TextArea';

interface ICommentForm {
  onBlur?: () => void;
}

const CommentForm: React.FC<ICommentForm> = ({ onBlur }) => {
  const { t } = useTranslation('decision');
  const theme = useTheme();

  const [commentText, setCommentText] = useState('');
  const [focusedInput, setFocusedInput] = useState<boolean>(false);

  const handleChange = useCallback((id, value) => {
    setCommentText(value);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('submit');
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedInput(false);
    if (onBlur !== undefined) onBlur();
  }, [onBlur]);

  return (
    <SCommentsForm>
      <SInputWrapper focus={focusedInput}>
        <TextArea
          id="title"
          maxlength={150}
          value={commentText}
          onFocus={() => {
            setFocusedInput(true);
          }}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder={t('comments.placeholder')}
        />
      </SInputWrapper>
      {(focusedInput || commentText) && (
        <SButton
          withShadow
          view={commentText ? 'primaryGrad' : 'quaternary'}
          onClick={handleSubmit}
          disabled={!commentText}
        >
          <SInlineSVG
            svg={sendIcon}
            fill={commentText ? theme.colors.white : theme.colorsThemed.text.primary}
            width="24px"
            height="24px"
          />
        </SButton>
      )}
    </SCommentsForm>
  );
};

export default CommentForm;

CommentForm.defaultProps = {
  onBlur: () => {},
};

const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
`;

const SButton = styled(Button)`
  padding: 12px;
  margin-left: 12px;
  &:disabled {
    background: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
`;

const SCommentsForm = styled.form`
  display: flex;
  padding-bottom: 16px;
  position: sticky;
  top: 0;
  z-index: 1;
  background: ${({ theme }) => theme.colorsThemed.background.primary};

  ${(props) => props.theme.media.tablet} {
    background: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
`;

interface ISInputWrapper {
  focus: boolean;
}
const SInputWrapper = styled.div<ISInputWrapper>`
  width: 100%;
  border-radius: 12px;
  border: 1px solid
    ${(props) => {
      if (props.focus) {
        return props.theme.colorsThemed.background.outlines2;
      }
      return props.theme.colorsThemed.background.secondary;
    }};
`;
