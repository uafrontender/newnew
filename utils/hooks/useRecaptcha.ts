import { useCallback, useState, RefObject } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import ReCAPTCHA from 'react-google-recaptcha';

import { IReCaptchaRes } from '../../components/interfaces/reCaptcha';

// first executes reCaptcha v3 if the score is lower that minSuccessScore, reCaptca v2 is shown
const useRecaptcha = (
  callback: () => Promise<void>,
  minSuccessScore: number,
  minDoubleCheckScore: number,
  recaptchaV2Ref: RefObject<ReCAPTCHA>
) => {
  const { executeRecaptcha: executeGoogleRecaptchaV3 } = useGoogleReCaptcha();

  const [isRecaptchaV2Required, setIsRecaptchaV2Required] =
    useState<boolean>(false);
  const [recaptchaTokenV2, setRecaptchaTokenV2] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onChangeRecaptchaV2 = useCallback(
    (recaptchaToken: string | null) => {
      console.log(recaptchaToken, 'e recaptcha');
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
      const res = await fetch('/api/post_recaptcha_query', {
        method: 'POST',
        body: JSON.stringify({
          recaptchaToken,
        }),
      });

      if (res.status === 200) {
        return { isPassed: true };
      }

      return { isPassed: false };
    } catch (err) {
      console.error(err);
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

      return {
        isPassed: false,
        // eslint-disable-next-line no-nested-ternary
        error: jsonRes?.errors
          ? Array.isArray(jsonRes?.errors)
            ? jsonRes.errors[0]?.toString()
            : jsonRes.errors?.toString()
          : 'ReCaptcha failed',
      };
    } catch (err: any) {
      console.error(err);

      return {
        isPassed: false,
        error: err.message,
      };
    }
  }, [executeGoogleRecaptchaV3]);

  const submitWithRecaptchaProtection = useCallback(
    async (e: React.ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsSubmitting(true);

      // call callback if reCaptcha v2 is passed if v3 score was low that minSuccessScore
      if (isRecaptchaV2Required && recaptchaTokenV2) {
        const { isPassed: isReCaptchaV2Passed } = await checkRecaptchaV2(
          recaptchaTokenV2
        );

        if (isReCaptchaV2Passed) {
          callback();
        } else {
          setErrorMessage('Recaptcha failed');
        }

        setIsSubmitting(false);
        return;
      }

      // reCaptcha v3
      const { isPassed, score, error } = await executeRecaptchaV3();

      if (isPassed && score && score >= minSuccessScore) {
        await callback();
        setIsSubmitting(false);
        return;
      }

      // show reCaptcha v2 if score for v3 is between minDoubleCheckScore and minSuccessScore
      if (isPassed && score && score >= minDoubleCheckScore) {
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
