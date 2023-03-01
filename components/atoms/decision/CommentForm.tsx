import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { CommentFromUrlContext } from '../../../contexts/commentFromUrlContext';
import validateInputText from '../../../utils/validateMessageText';
import { I18nNamespaces } from '../../../@types/i18next';
import { useAppState } from '../../../contexts/appStateContext';

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
  onBlur?: () => void;
  onFocus?: () => void;
  onSubmit: (text: string) => void;
}

const CommentForm = React.forwardRef<HTMLFormElement, ICommentForm>(
  (
    { postUuidOrShortId, position, zIndex, isRoot, onBlur, onFocus, onSubmit },
    ref
  ) => {
    const theme = useTheme();
    const router = useRouter();
    const { t } = useTranslation('page-Post');
    const user = useAppSelector((state) => state.user);
    const { resizeMode } = useAppState();
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
    const { newCommentContentFromUrl, handleResetNewCommentContentFromUrl } =
      useContext(CommentFromUrlContext);

    const [focusedInput, setFocusedInput] = useState<boolean>(false);

    const [commentText, setCommentText] = useState('');
    const [commentTextError, setCommentTextError] = useState('');
    const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
    const [commentToSend, setCommentToSend] = useState('');

    const validateTextAbortControllerRef = useRef<
      AbortController | undefined
    >();
    const validateTextViaAPI = useCallback(async (text: string) => {
      if (validateTextAbortControllerRef.current) {
        validateTextAbortControllerRef.current?.abort();
      }
      validateTextAbortControllerRef.current = new AbortController();
      setIsAPIValidateLoading(true);
      try {
        const payload = new newnewapi.ValidateTextRequest({
          kind: newnewapi.ValidateTextRequest.Kind.POST_COMMENT,
          text,
        });

        const res = await validateText(
          payload,
          validateTextAbortControllerRef?.current?.signal
        );

        if (!res.data?.status) throw new Error('An error occurred');

        if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
          setCommentTextError(errorSwitch(res.data?.status));
        } else {
          setCommentTextError('');
        }

        if (text.length > 0) {
          const isValidLocal = validateInputText(text);
          if (!isValidLocal) {
            setCommentTextError(
              errorSwitch(newnewapi.ValidateTextResponse.Status.TOO_SHORT)
            );
            setIsAPIValidateLoading(false);
            return;
          }
        }

        setIsAPIValidateLoading(false);
      } catch (err) {
        console.error(err);
        setIsAPIValidateLoading(false);
      }
    }, []);

    const validateTextViaAPIDebounced = useMemo(
      () =>
        debounce((text: string) => {
          validateTextViaAPI(text);
        }, 250),
      [validateTextViaAPI]
    );

    const handleChange = useCallback(
      (id: string, value: string) => {
        setCommentText(value);
        validateTextViaAPIDebounced(value);
      },
      [validateTextViaAPIDebounced]
    );

    const handleSubmit = useCallback(
      async (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        // Redirect only after the persist data is pulled
        if (!user.loggedIn && user._persist?.rehydrated) {
          if (!isRoot) {
            router.push(
              `/sign-up?reason=comment&redirect=${encodeURIComponent(
                window.location.href
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

        setCommentToSend(commentText);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [commentText, user.loggedIn, user._persist?.rehydrated, onSubmit, isRoot]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (!isMobileOrTablet) {
          if (e.shiftKey && e.key === 'Enter' && commentText.length > 0) {
            if (commentText.charCodeAt(commentText.length - 1) === 10) {
              setCommentText((curr) => curr.slice(0, -1));
            }
          } else if (e.key === 'Enter') {
            handleSubmit(e);
          }
        } else if (e.key === 'Enter' && commentText.length > 0) {
          if (commentText.charCodeAt(commentText.length - 1) === 10) {
            setCommentText((curr) => curr.slice(0, -1));
          }
        }
      },
      [commentText, handleSubmit, isMobileOrTablet]
    );

    // TODO: Add loading state for mobile button on mobile
    useEffect(() => {
      if (!commentToSend || !!commentTextError) {
        return;
      }

      if (isAPIValidateLoading) {
        return;
      }

      const handleOnSubmit = async () => {
        setIsSubmitting(true);
        await onSubmit(commentToSend);
        setIsSubmitting(false);
        setCommentText('');
        setCommentToSend('');
      };

      handleOnSubmit();
    }, [commentToSend, commentTextError, isAPIValidateLoading, onSubmit]);

    const handleBlur = useCallback(() => {
      setFocusedInput(false);
      if (onBlur !== undefined) onBlur();
    }, [onBlur]);

    useEffect(() => {
      if (!isRoot || !newCommentContentFromUrl) return;

      if (newCommentContentFromUrl) {
        setCommentText(newCommentContentFromUrl);
        handleResetNewCommentContentFromUrl?.();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newCommentContentFromUrl]);

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
            maxlength={150}
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
  padding-bottom: 16px;
  position: ${({ position }) => position ?? 'relative'};
  top: 0;
  z-index: ${({ zIndex }) => zIndex ?? 'unset'};
  background: ${({ theme }) => theme.colorsThemed.background.primary};
`;

interface ISInputWrapper {}
const SInputWrapper = styled.div<ISInputWrapper>`
  width: 100%;
  border-radius: 16px;
`;
