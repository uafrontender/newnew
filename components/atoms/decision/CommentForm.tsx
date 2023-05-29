import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../redux-store/store';

import Button from '../Button';
import InlineSVG from '../InlineSVG';
import CommentTextArea from './CommentTextArea';

import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';
import { validateText } from '../../../api/endpoints/infrastructure';
import { CommentFromUrlContext } from '../../../contexts/commentFromUrlContext';
import validateInputText from '../../../utils/validateMessageText';
import { I18nNamespaces } from '../../../@types/i18next';
import { useAppState } from '../../../contexts/appStateContext';
import useDebouncedValue from '../../../utils/hooks/useDebouncedValue';
import { APIResponse } from '../../../api/apiConfigs';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';

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
      errorMsg = 'inappropriate';
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
  postUuidOrShortId?: string;
  position?: string;
  zIndex?: number;
  isRoot?: boolean;
  commentId?: number;
  value?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  onSubmit: (text: string) => Promise<APIResponse<newnewapi.ICommentMessage>>;
  onChange?: (text: string) => void;
}

const CommentForm = React.forwardRef<HTMLFormElement, ICommentForm>(
  (
    {
      value: initialValue,
      postUuidOrShortId,
      position,
      zIndex,
      isRoot,
      commentId,
      onBlur,
      onFocus,
      onSubmit,
      onChange,
    },
    ref
  ) => {
    const theme = useTheme();
    const router = useRouter();
    const { t } = useTranslation('page-Post');
    const user = useAppSelector((state) => state.user);
    const { resizeMode } = useAppState();
    const { showErrorToastPredefined } = useErrorToasts();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const isMobileOrTablet = [
      'mobile',
      'mobileS',
      'mobileM',
      'mobileL',
      'tablet',
    ].includes(resizeMode);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Comment content from URL
    const {
      newCommentContentFromUrl,
      commentIdFromUrl,
      handleResetNewCommentContentFromUrl,
      handleResetCommentIdFromUrl,
    } = useContext(CommentFromUrlContext);

    const [focusedInput, setFocusedInput] = useState<boolean>(false);

    const [commentText, setCommentText] = useState(initialValue || '');
    const [commentTextError, setCommentTextError] = useState('');
    const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);

    const debouncedCommentText = useDebouncedValue(commentText, 500);

    useEffect(() => {
      if (onChange) {
        onChange(debouncedCommentText);
      }
    }, [debouncedCommentText, onChange]);

    const validateTextAbortControllerRef = useRef<
      AbortController | undefined
    >();
    const validateTextViaAPI = useCallback(
      async (text: string): Promise<boolean> => {
        if (validateTextAbortControllerRef.current) {
          validateTextAbortControllerRef.current?.abort();
        }
        validateTextAbortControllerRef.current = new AbortController();
        setIsAPIValidateLoading(true);
        try {
          if (text.length > 0) {
            const isValidLocal = validateInputText(text);
            if (!isValidLocal) {
              setCommentTextError(
                errorSwitch(newnewapi.ValidateTextResponse.Status.TOO_SHORT)
              );
              setIsAPIValidateLoading(false);
              return false;
            }
          }

          const payload = new newnewapi.ValidateTextRequest({
            kind: newnewapi.ValidateTextRequest.Kind.POST_COMMENT,
            text,
          });

          const res = await validateText(
            payload,
            validateTextAbortControllerRef?.current?.signal
          );

          if (!res?.data?.status) {
            throw new Error('An error occurred');
          }

          setIsAPIValidateLoading(false);
          if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
            setCommentTextError(errorSwitch(res.data?.status));
            return false;
          }
          setCommentTextError('');
          return true;
        } catch (err) {
          console.error(err);
          setIsAPIValidateLoading(false);
          return true;
        }
      },
      []
    );

    const handleChange = useCallback((id: string, value: string) => {
      setCommentTextError('');
      setCommentText(value);
    }, []);

    const handleSubmit = useCallback(
      async (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
          const isValid = await validateTextViaAPI(commentText);
          if (isValid) {
            // Redirect only after the persist data is pulled
            if (!user.loggedIn && user._persist?.rehydrated) {
              if (!isRoot && commentId) {
                // router.push(
                //   `/sign-up?reason=comment&redirect=${encodeURIComponent(
                //     window.location.href
                //   )}`
                // );
                router.push(
                  `/sign-up?reason=comment&redirect=${encodeURIComponent(
                    `${process.env.NEXT_PUBLIC_APP_URL}/${
                      router.locale !== 'en-US' ? `${router.locale}/` : ''
                    }p/${postUuidOrShortId}?comment_content=${commentText}&comment_id=${commentId}#comments`
                  )}`
                );
              } else {
                router.push(
                  `/sign-up?reason=comment&redirect=${encodeURIComponent(
                    `${process.env.NEXT_PUBLIC_APP_URL}/${
                      router.locale !== 'en-US' ? `${router.locale}/` : ''
                    }p/${postUuidOrShortId}?comment_content=${commentText}#comments`
                  )}`
                );
              }

              return;
            }

            const res = await onSubmit(commentText);

            if (res?.data && !res.error) {
              setCommentText('');
            } else {
              throw new Error(res?.error?.message || 'Could not add comment');
            }
          }
          setIsSubmitting(false);
        } catch (err) {
          console.error(err);
          showErrorToastPredefined(undefined);
          setIsSubmitting(false);
        }
      },
      [
        validateTextViaAPI,
        commentText,
        user.loggedIn,
        user._persist?.rehydrated,
        onSubmit,
        isRoot,
        commentId,
        router,
        postUuidOrShortId,
        showErrorToastPredefined,
      ]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (isSubmitting || isAPIValidateLoading) {
          e.preventDefault();
          return;
        }
        if (commentText.trim().length > 0) {
          if (!isMobileOrTablet) {
            if (e.shiftKey && e.key === 'Enter') {
              if (commentText.charCodeAt(commentText.length - 1) === 10) {
                setCommentText((curr) => curr.slice(0, -1));
              }
            } else if (e.key === 'Enter') {
              handleSubmit(e);
            }
          } else if (e.key === 'Enter' && commentText.trim().length > 0) {
            if (commentText.charCodeAt(commentText.length - 1) === 10) {
              setCommentText((curr) => curr.slice(0, -1));
            }
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
        }
      },
      [
        commentText,
        handleSubmit,
        isAPIValidateLoading,
        isMobileOrTablet,
        isSubmitting,
      ]
    );

    const handleBlur = useCallback(() => {
      setFocusedInput(false);
      if (onBlur !== undefined) onBlur();
    }, [onBlur]);

    useEffect(() => {
      if (!newCommentContentFromUrl) {
        return;
      }

      if (isRoot && commentIdFromUrl) {
        return;
      }

      if (
        !isRoot &&
        !newCommentContentFromUrl &&
        commentIdFromUrl !== commentId?.toString()
      ) {
        return;
      }

      if (newCommentContentFromUrl) {
        setCommentText(newCommentContentFromUrl);
        handleResetNewCommentContentFromUrl?.();
        handleResetCommentIdFromUrl?.();
      }
    }, [
      newCommentContentFromUrl,
      commentIdFromUrl,
      isRoot,
      commentId,
      handleResetNewCommentContentFromUrl,
      handleResetCommentIdFromUrl,
    ]);

    return (
      <SCommentsForm
        {...{
          ...(ref
            ? {
                ref,
              }
            : {}),
        }}
        position={position}
        zIndex={zIndex}
        onKeyDown={handleKeyDown}
      >
        <SInputWrapper>
          <CommentTextArea
            id='title'
            maxlength={500}
            value={commentText}
            focus={focusedInput}
            error={
              commentTextError
                ? t(
                    `comments.errors.${
                      commentTextError as keyof I18nNamespaces['page-Post']['comments']['errors']
                    }`
                  )
                : ''
            }
            onFocus={() => {
              setFocusedInput(true);
              onFocus?.();
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
            disabled={!commentText || !!commentTextError || isSubmitting}
            style={{
              ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
            }}
            loading={isSubmitting}
            loadingAnimationColor='blue'
          >
            <SInlineSVG
              svg={!isSubmitting ? sendIcon : ''}
              fill={
                commentText
                  ? theme.colors.white
                  : theme.colorsThemed.text.primary
              }
              width={isMobile ? '20px' : '24px'}
              height={isMobile ? '20px' : '24px'}
            />
          </SButton>
        )}
      </SCommentsForm>
    );
  }
);

export default CommentForm;

CommentForm.defaultProps = {
  onBlur: () => {},
  onFocus: () => {},
  zIndex: undefined,
  position: undefined,
  isRoot: false,
  commentId: undefined,
  postUuidOrShortId: '',
};

const SInlineSVG = styled(InlineSVG)``;

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
  padding-bottom: 24px;
  position: ${({ position }) => position ?? 'relative'};
  top: 0;
  z-index: ${({ zIndex }) => zIndex ?? 'unset'};
  background: ${({ theme }) => theme.colorsThemed.background.primary};

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 22px;
  }
`;

interface ISInputWrapper {}
const SInputWrapper = styled.div<ISInputWrapper>`
  width: 100%;
  border-radius: 16px;
`;
