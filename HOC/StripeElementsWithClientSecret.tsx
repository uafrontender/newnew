import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Elements } from '@stripe/react-stripe-js';
import { StripeElementLocale, StripeElementsOptions } from '@stripe/stripe-js';
import { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../redux-store/store';
import { createStripeSetupIntent } from '../api/endpoints/payments';
import getStripe from '../utils/geStripejs';
import isBrowser from '../utils/isBrowser';

const stripePromise = getStripe();

interface IStripeElements {
  children: React.ReactNode;
}

export const StripeElements: React.FC<IStripeElements> = (props) => {
  const { children } = props;
  const theme = useTheme();
  const { loggedIn } = useAppSelector((state) => state.user);

  const { locale } = useRouter();

  const [stipeSecret, setStripeSecret] = useState('');

  useEffect(() => {
    const getStripeClientSecret = async () => {
      try {
        const payload = new newnewapi.EmptyRequest({});
        const response = await createStripeSetupIntent(payload);

        if (!response.data || response.error) {
          throw new Error(response.error?.message || 'Some error occurred');
        }

        setStripeSecret(response.data.stripeSetupIntentClientSecret);

        console.log(response, 'response');
      } catch (err) {
        console.error(err);
      }
    };

    if (loggedIn) {
      getStripeClientSecret();
    }
  }, [loggedIn]);

  const isBrowserBool = isBrowser();

  const stripeOptions: StripeElementsOptions | null = useMemo(() => {
    if (!isBrowserBool) {
      return null;
    }

    return {
      clientSecret: stipeSecret,
      appearance: {
        theme: 'none',
        variables: {
          colorPrimary: theme.colorsThemed.accent.blue,
          colorBackground: theme.colorsThemed.background.tertiary,
          colorText: theme.colorsThemed.text.primary,
          colorDanger: theme.colorsThemed.accent.error,
          fontFamily: 'Gilroy, Arial, Helvetica, sans-serif',
          spacingUnit: '2px',
          borderRadius: '16px',
          fontSizeBase: '16px',
          fontLineHeight: '24px',
        },
        rules: {
          '.Label': {
            color: 'transparent',
          },
          '.Input': {
            padding: '12px 20px',
            lineHeight: '24px',
            border: `1.5px solid ${theme.colorsThemed.background.outlines1}`,
          },
          '.Input:focus': {
            borderColor: `${theme.colorsThemed.background.outlines2}`,
            outline: '0',
          },
          '.Input::placeholder': {
            color: `${theme.colorsThemed.text.quaternary}`,
          },
          '.Error': {
            fontWeight: '600',
            fontSize: '12px',
            lineHeight: '16px',
          },
          '.TermsText': {
            color: `${theme.colorsThemed.text.tertiary}`,
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: '600',
          },
        },
      },
      locale: locale as StripeElementLocale,
      fonts: [
        {
          family: 'Gilroy',
          src: `url(
            ${window?.location?.origin}/fonts/Radomir-Tinkov-Gilroy-Regular.otf
          ) format("opentype")`,
          weight: '400',
        },
        {
          family: 'Gilroy',
          src: `url(${encodeURI(
            `${window?.location?.origin}/fonts/Radomir-Tinkov-Gilroy-SemiBold.otf`
          )}) format("opentype")`,
          weight: '600',
        },
      ],
    };
  }, [stipeSecret, theme, locale, isBrowserBool]);

  if (!stipeSecret || !stripeOptions) {
    return null;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={stipeSecret ? stripeOptions : undefined}
      key={stipeSecret}
    >
      {children}
    </Elements>
  );
};

export default StripeElements;
