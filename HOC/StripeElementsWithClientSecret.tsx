import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Elements } from '@stripe/react-stripe-js';
import { StripeElementLocale, StripeElementsOptions } from '@stripe/stripe-js';
import { useTheme } from 'styled-components';

import getStripe from '../utils/getStripejs';
import assets from '../constants/assets';

const stripePromise = getStripe();

interface IStripeElements {
  children: React.ReactNode;
  stipeSecret: string | undefined;
}

export const StripeElements: React.FC<IStripeElements> = ({
  children,
  stipeSecret,
}) => {
  const theme = useTheme();

  const { locale } = useRouter();

  const stripeOptions: StripeElementsOptions | null = useMemo(
    () => ({
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
          spacingGridRow: '12px',
          spacingGridColumn: '10px',
        },
        rules: {
          '.Label': {
            color: 'transparent',
            lineHeight: '0px',
          },
          '.Input': {
            padding: '10.5px 20px',
            lineHeight: '24px',
            border: '1.5px solid transparent',
            fontWeight: '500',
          },
          '.Input:focus': {
            borderColor: `${theme.colorsThemed.background.outlines2}`,
            outline: '0',
          },
          '.Input:hover': {
            borderColor: `${theme.colorsThemed.background.outlines2}`,
            outline: '0',
          },
          '.Input::placeholder': {
            color: `${theme.colorsThemed.text.tertiary}`,
          },
          '.Error': {
            fontWeight: '600',
            fontSize: '12px',
            lineHeight: '16px',
          },
          '.TermsText': {
            color: `${theme.colorsThemed.text.tertiary}`,
            fontSize: '13px',
            lineHeight: '20px',
            fontWeight: '600',
          },
        },
      },
      locale: locale as StripeElementLocale,
      fonts: [
        {
          family: 'Gilroy',
          src: `url(${assets.gilroyFont.regular})`,
          weight: '400',
        },
        {
          family: 'Gilroy',
          src: `url(${assets.gilroyFont.medium})`,
          weight: '500',
        },
        {
          family: 'Gilroy',
          src: `url(${assets.gilroyFont.semiBold})`,
          weight: '600',
        },
      ],
    }),
    [stipeSecret, theme, locale]
  );

  if (!stipeSecret) {
    return null;
  }

  return (
    <Elements stripe={stripePromise} options={stripeOptions} key={stipeSecret}>
      {children}
    </Elements>
  );
};

export default StripeElements;
