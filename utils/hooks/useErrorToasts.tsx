import { useMemo, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { toast, ToastOptions } from 'react-toastify';
import { useRouter } from 'next/router';

// eslint-disable-next-line no-shadow
export enum ErrorToastPredefinedMessage {
  ServerError = 'serverError',
  RecaptchaError = 'recaptchaError',
  UnsupportedImageFormatError = 'usupportedImageFormatError',
  ProcessingLimitReachedError = 'processingLimitReachedError',
  InvalidDateError = 'invalidDateError',
}

interface IUseErrorToasts {
  showErrorToastPredefined: (
    messageEnum?: ErrorToastPredefinedMessage,
    options?: ToastOptions<{}> | undefined
  ) => void;
  showErrorToastCustom: (
    message: string,
    options?: ToastOptions<{}> | undefined
  ) => void;
}

export default function useErrorToasts(): IUseErrorToasts {
  const { locale } = useRouter();
  const { t } = useTranslation('common');

  const showErrorToastPredefined = useCallback(
    (
      messageEnum?: ErrorToastPredefinedMessage,
      options?: ToastOptions<{}> | undefined
    ) => {
      if (!messageEnum) {
        toast.error(t('toastErrors.generic'), options ?? undefined);
      } else {
        toast.error(t(`toastErrors.${messageEnum}`), options ?? undefined);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      locale,
      // t - removed as common is present everywhere, we need update on language changed
    ]
  );

  const showErrorToastCustom = useCallback(
    (message: string, options?: ToastOptions<{}> | undefined) => {
      toast.error(message, options ?? undefined);
    },
    []
  );

  const value = useMemo(
    () => ({
      showErrorToastPredefined,
      showErrorToastCustom,
    }),

    [showErrorToastPredefined, showErrorToastCustom]
  );

  return value;
}
