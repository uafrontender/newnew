import React, { useState, useMemo, useEffect } from 'react';
import { PaymentElement, useElements } from '@stripe/react-stripe-js';
import {
  StripePaymentElementChangeEvent,
  StripePaymentElementOptions,
} from '@stripe/stripe-js';

interface ICheckoutForm {
  onFormStatusCompleteChange: (value: boolean) => void;
  onFormReadyStatusChange: (value: boolean) => void;
}

const NewCardForm: React.FC<ICheckoutForm> = ({
  onFormStatusCompleteChange,
  onFormReadyStatusChange,
}) => {
  const [isStripeReady, setIsStripeReady] = useState(false);

  const elements = useElements();
  const paymentEl = elements?.getElement('payment');

  useEffect(() => {
    const handleChangeStripeElement = (
      event: StripePaymentElementChangeEvent
    ) => {
      onFormStatusCompleteChange(event.complete);
    };

    if (isStripeReady && paymentEl) {
      paymentEl?.on('change', handleChangeStripeElement);
    }

    return () => {
      if (isStripeReady && paymentEl) {
        paymentEl?.off('change', handleChangeStripeElement);
      }
      onFormStatusCompleteChange(false);
    };
  }, [isStripeReady, elements, paymentEl, onFormStatusCompleteChange]);

  useEffect(
    () => () => {
      setIsStripeReady(false);
    },
    []
  );

  useEffect(() => {
    onFormReadyStatusChange(isStripeReady);

    return () => {
      onFormReadyStatusChange(false);
    };
  }, [isStripeReady, onFormReadyStatusChange]);

  const paymentElementOptions: StripePaymentElementOptions = useMemo(
    () => ({
      terms: { card: 'never' },
      wallets: {
        googlePay: 'never',
        applePay: 'never',
      },
    }),
    []
  );

  return (
    <PaymentElement
      id='stripePayment'
      onReady={() => setIsStripeReady(true)}
      options={paymentElementOptions}
    />
  );
};

export default NewCardForm;
