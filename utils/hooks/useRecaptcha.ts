import { useCallback, useState, RefObject } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import ReCAPTCHA from 'react-google-recaptcha';

import { IReCaptchaRes } from '../../components/interfaces/reCaptcha';

// first executes reCaptcha v3 if the score is lower that minSuccessScore, reCaptcha v2 is shown
const useRecaptcha = (
  callback: (args: any) => Promise<void>,
  recaptchaV2Ref: RefObject<ReCAPTCHA>,
  options?: {
    minSuccessScore?: number;
    minDoubleCheckScore?: number;
  }
) => {
  const { executeRecaptcha: executeGoogleRecaptchaV3 } = useGoogleReCaptcha();
  const { minSuccessScore = 0.5, minDoubleCheckScore = 0.1 } = options || {};

  const [isRecaptchaV2Required, setIsRecaptchaV2Required] =
    useState<boolean>(false);
  const [recaptchaTokenV2, setRecaptchaTokenV2] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onChangeRecaptchaV2 = useCallback(
    (recaptchaToken: string | null) => {
      try {
        if (!recaptchaToken) {
          throw new Error('Failed');
        }

        setRecaptchaTokenV2(recaptchaToken);
      } catch (err) {
        recaptchaV2Ref?.current?.reset();
      }
    },
    [recaptchaV2Ref]
  );

  const checkRecaptchaV2 = useCallback(async (recaptchaToken: string) => {
    try {
      const res = await fetch('/api/post_recaptcha_v2_query', {
        method: 'POST',
        body: JSON.stringify({
          recaptchaToken,
        }),
      });

      if (res.status === 200) {
        return { isPassed: true };
      }

      console.error(`Recaptcha v2 failed. Status: ${res.status}`);

      return { isPassed: false };
    } catch (err: any) {
      console.error(`Recaptcha v2 failed. ${err?.message}`);
      return { isPassed: false };
    }
  }, []);

  const executeRecaptchaV3 = useCallback(async () => {
    try {
      if (!executeGoogleRecaptchaV3) {
        throw new Error('executeRecaptcha not available');
      }

      const recaptchaToken = await executeGoogleRecaptchaV3();

      if (!recaptchaToken) {
        throw new Error('recaptchaToken not found');
      }

      const res = await fetch('/api/post_recaptcha_query', {
        method: 'POST',
        body: JSON.stringify({
          recaptchaToken,
        }),
      });

      const jsonRes: IReCaptchaRes = await res.json();

      if (jsonRes?.success && jsonRes?.score) {
        return { isPassed: true, score: jsonRes?.score };
      }

      console.error(
        `Recaptcha v3 failed. score:${jsonRes.score}, error codes: ${jsonRes[
          'error-codes'
        ]?.toString()}`
      );

      return {
        isPassed: false,
        // eslint-disable-next-line no-nested-ternary
        error: jsonRes?.errors
          ? Array.isArray(jsonRes?.errors)
            ? jsonRes.errors[0]?.toString()
            : jsonRes.errors?.toString()
          : 'ReCaptcha failed',
        errorCodes: jsonRes['error-codes'],
      };
    } catch (err: any) {
      console.error(`Recaptcha v3 failed. ${err?.message}`);

      return {
        isPassed: false,
        error: err.message,
      };
    }
  }, [executeGoogleRecaptchaV3]);

  const submitWithRecaptchaProtection = useCallback(
    async (callbackArgs?: any) => {
      setIsSubmitting(true);

      // skip reCaptcha for tests
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'test') {
        await callback(callbackArgs);
        setIsSubmitting(false);
        return;
      }

      // call callback if reCaptcha v2 is passed if v3 score was low that minSuccessScore
      if (isRecaptchaV2Required && recaptchaTokenV2) {
        const { isPassed: isReCaptchaV2Passed } = await checkRecaptchaV2(
          recaptchaTokenV2
        );

        if (isReCaptchaV2Passed) {
          await callback(callbackArgs);
        } else {
          setErrorMessage('Recaptcha failed');
        }

        setIsSubmitting(false);
        return;
      }

      // reCaptcha v3
      const { isPassed, score, error, errorCodes } = await executeRecaptchaV3();

      if (isPassed && score && score >= minSuccessScore) {
        await callback(callbackArgs);
        setIsSubmitting(false);
        return;
      }

      // show reCaptcha v2 if score for v3 is between minDoubleCheckScore and minSuccessScore
      if (isPassed && score && score >= minDoubleCheckScore) {
        setIsRecaptchaV2Required(true);
        setIsSubmitting(false);
        return;
      }

      // show reCaptcha v2 when incorrect-captcha-sol error appears
      if (
        errorCodes &&
        errorCodes.length === 1 &&
        errorCodes.includes('incorrect-captcha-sol')
      ) {
        setIsRecaptchaV2Required(true);
        setIsSubmitting(false);
        return;
      }

      // show error without showing reCaptcha v2 if score for v3 is lower that minDoubleCheckScore
      if (error) {
        setErrorMessage('Recaptcha failed');
        setIsSubmitting(false);
      }
    },
    [
      callback,
      isRecaptchaV2Required,
      minSuccessScore,
      executeRecaptchaV3,
      minDoubleCheckScore,
      recaptchaTokenV2,
      checkRecaptchaV2,
    ]
  );

  return {
    isRecaptchaV2Required,
    isSubmitting,
    errorMessage,
    onChangeRecaptchaV2,
    submitWithRecaptchaProtection,
  };
};

export default useRecaptcha;
