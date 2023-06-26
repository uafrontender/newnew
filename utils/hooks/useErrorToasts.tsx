import { useMemo, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { toast, ToastOptions } from 'react-toastify';
import { useRouter } from 'next/router';
import { useGetAppConstants } from '../../contexts/appConstantsContext';

// eslint-disable-next-line no-shadow
export enum ErrorToastPredefinedMessage {
  ServerError = 'serverError',
  RecaptchaError = 'recaptchaError',
  UnsupportedImageFormatError = 'unsupportedImageFormatError',
  AnnouncementTooShort = 'announcementTooShort',
  AnnouncementTooLong = 'announcementTooLong',
  InitialResponseTooShort = 'initialResponseTooShort',
  InitialResponseTooLong = 'initialResponseTooLong',
  AdditionalResponseTooShort = 'additionalResponseTooShort',
  AdditionalResponseTooLong = 'additionalResponseTooLong',
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
  const { appConstants } = useGetAppConstants();
  const { locale } = useRouter();
  const { t } = useTranslation('common');

  const getErrorToastPredefinedData = useCallback(
    (
      error: ErrorToastPredefinedMessage
    ): { [key: string]: string } | undefined => {
      if (error === ErrorToastPredefinedMessage.AnnouncementTooShort) {
        return {
          amount:
            appConstants.announcementVideoLimits?.minLengthSeconds?.toString() ??
            '30',
        };
      }

      if (error === ErrorToastPredefinedMessage.AnnouncementTooLong) {
        return {
          amount:
            appConstants.announcementVideoLimits?.maxLengthSeconds?.toString() ??
            '3600',
        };
      }

      if (error === ErrorToastPredefinedMessage.InitialResponseTooShort) {
        return {
          amount:
            appConstants.responseVideoLimits?.minLengthSeconds?.toString() ??
            '15',
        };
      }

      if (error === ErrorToastPredefinedMessage.InitialResponseTooLong) {
        return {
          amount:
            appConstants.responseVideoLimits?.maxLengthSeconds?.toString() ??
            '3600',
        };
      }

      if (error === ErrorToastPredefinedMessage.AdditionalResponseTooShort) {
        return {
          amount:
            appConstants.responseVideoLimits?.minLengthSeconds?.toString() ??
            '15',
        };
      }

      if (error === ErrorToastPredefinedMessage.AdditionalResponseTooLong) {
        return {
          amount:
            appConstants.responseVideoLimits?.maxLengthSeconds?.toString() ??
            '3600',
        };
      }

      return undefined;
    },
    [appConstants]
  );

  const showErrorToastPredefined = useCallback(
    (
      messageEnum?: ErrorToastPredefinedMessage,
      options?: ToastOptions<{}> | undefined
    ) => {
      if (!messageEnum) {
        toast.error(t('toastErrors.generic'), options ?? undefined);
      } else {
        const errorData = getErrorToastPredefinedData(messageEnum);
        toast.error(
          t(`toastErrors.${messageEnum}`, errorData),
          options ?? undefined
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      locale,
      // t - removed as common is present everywhere, we need update on language changed
      getErrorToastPredefinedData,
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
