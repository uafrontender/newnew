import React, { useCallback, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Button from '../Button';
import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';
import InlineSVG from '../InlineSVG';
import CommentTextArea from './CommentTextArea';
import { useAppSelector } from '../../../redux-store/store';

interface ICommentForm {
  onSubmit: (text: string) => void;
  onBlur?: () => void;
};

const CommentForm = React.forwardRef<HTMLFormElement, ICommentForm>(({
  onSubmit,
  onBlur,
}, ref) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [commentText, setCommentText] = useState('');
  const [focusedInput, setFocusedInput] = useState<boolean>(false);

  const handleChange = useCallback((id, value) => {
    setCommentText(value);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    console.log('submit');

    await onSubmit(commentText);
    setCommentText('');
  }, [commentText, onSubmit]);

  const handleBlur = useCallback(() => {
    setFocusedInput(false);
    if (onBlur !== undefined) onBlur();
  }, [onBlur]);

  return (
    <SCommentsForm
      {...{
        ...(ref ? {
          ref,
        } : {}),
      }}
    >
      <SInputWrapper focus={focusedInput}>
        <CommentTextArea
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
            width={isMobile ? '20px' : '24px'}
            height={isMobile ? '20px' : '24px'}
          />
        </SButton>
      )}
    </SCommentsForm>
  );
});

export default CommentForm;

CommentForm.defaultProps = {
  onBlur: () => {},
};

const SInlineSVG = styled(InlineSVG)`
`;

const SButton = styled(Button)`
  padding: 12px;
  margin-left: 12px;

  height: 36px;
  width: 36px;
  border-radius: 12px;

  position: relative;
  top: 6px;

  &:disabled {
    background: ${({ theme }) => theme.colorsThemed.background.secondary};
  }

  ${({ theme }) => theme.media.tablet} {
    top: 0px;
    height: 48px;
    width: 48px;
    border-radius: 16px;
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
