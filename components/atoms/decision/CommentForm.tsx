import React, { useCallback, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { debounce } from 'lodash';

import { useAppSelector } from '../../../redux-store/store';

import Button from '../Button';
import InlineSVG from '../InlineSVG';
import CommentTextArea from './CommentTextArea';

import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';
import { validateText } from '../../../api/endpoints/infrastructure';

const errorSwitch = (status: newnewapi.ValidateTextResponse.Status) => {
  let errorMsg = 'generic';

  switch (status) {
    case newnewapi.ValidateTextResponse.Status.TOO_LONG: {
      errorMsg = 'tooLong';
      break;
    }
    case newnewapi.ValidateTextResponse.Status.TOO_SHORT: {
      errorMsg = 'tooShort';
      break;
    }
    case newnewapi.ValidateTextResponse.Status.INAPPROPRIATE: {
      errorMsg = 'innappropriate';
      break;
    }
    case newnewapi.ValidateTextResponse.Status.ATTEMPT_AT_REDIRECTION: {
      errorMsg = 'linksForbidden';
      break;
    }
    default: {
      break;
    }
  }

  return errorMsg;
};

interface ICommentForm {
  position?: string;
  zIndex?: number;
  onBlur?: () => void;
  onSubmit: (text: string) => void;
};

const CommentForm = React.forwardRef<HTMLFormElement, ICommentForm>(({
  position,
  zIndex,
  onBlur,
  onSubmit,
}, ref) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('decision');
  const user = useAppSelector((state) => state.user)
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [focusedInput, setFocusedInput] = useState<boolean>(false);

  const [commentText, setCommentText] = useState('');
  const [commentTextError, setCommentTextError] = useState('');
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);

  const validateTextViaAPI = useCallback(async (
    text: string,
  ) => {
    setIsAPIValidateLoading(true);
    try {
      const payload = new newnewapi.ValidateTextRequest({
        kind: newnewapi.ValidateTextRequest.Kind.POST_COMMENT,
        text,
      });

      const res = await validateText(
        payload,
      );

      if (!res.data?.status) throw new Error('An error occured');

      if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
        setCommentTextError(errorSwitch(res.data?.status!!));
      } else {
        setCommentTextError('');
      }

      setIsAPIValidateLoading(false);
    } catch (err) {
      console.error(err);
      setIsAPIValidateLoading(false);
    }
  }, []);

  const validateTextViaAPIDebounced = useMemo(() => debounce((
    text: string,
  ) => {
    validateTextViaAPI(text);
  }, 250),
  [validateTextViaAPI]);

  const handleChange = useCallback((id, value) => {
    setCommentText(value);
    validateTextViaAPIDebounced(value);
  }, [validateTextViaAPIDebounced]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isAPIValidateLoading) return;

    if (!user.loggedIn) {
      window?.history.replaceState({
        fromPost: true,
      }, '', '');
      router.push(`/sign-up?reason=comment&redirect=${window.location.href}`);
    }

    await onSubmit(commentText);
    setCommentText('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentText, user.loggedIn, isAPIValidateLoading, onSubmit]);

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
      position={position}
      zIndex={zIndex}
      onKeyDown={(e) => {
        if (e.shiftKey && e.key === 'Enter') {
          handleSubmit(e);
        }
      }}
    >
      <SInputWrapper>
        <CommentTextArea
          id="title"
          maxlength={150}
          value={commentText}
          focus={focusedInput}
          error={commentTextError ? t(`comments.errors.${commentTextError}`) : ''}
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
          disabled={!commentText || !!commentTextError}
          style={{
            ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
          }}
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
  zIndex: undefined,
  position: undefined,
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

const SCommentsForm = styled.form<{
  position: string | undefined;
  zIndex: number | undefined;
}>`
  display: flex;
  padding-bottom: 16px;
  position: ${({ position }) => position ?? 'relative'};
  top: 0;
  z-index: ${({ zIndex }) => zIndex ?? 'unset'};
  background: ${({ theme }) => theme.colorsThemed.background.primary};

  ${(props) => props.theme.media.tablet} {
    background: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
`;

interface ISInputWrapper {}
const SInputWrapper = styled.div<ISInputWrapper>`
  width: 100%;
  border-radius: 16px;
`;
