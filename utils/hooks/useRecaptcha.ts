import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { IReCaptchaRes } from '../../components/interfaces/reCaptcha';

const useRecaptcha = () => {
  const { executeRecaptcha: executeGoogleRecaptchaV3 } = useGoogleReCaptcha();

  const executeRecaptcha = useCallback(async () => {
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

      if (jsonRes?.success && jsonRes?.score && jsonRes?.score > 0.5) {
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

  return { executeRecaptcha };
};

export default useRecaptcha;
