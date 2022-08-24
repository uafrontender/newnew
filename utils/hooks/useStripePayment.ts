import { newnewapi } from 'newnew-api';
import { useEffect, useRef, useState } from 'react';
import { createStripePaymentMC, StripePayment } from '../stripePayment';

function useStripePayment(
  // Must be wrapped into a useCallback
  createStripeRequest: () => newnewapi.CreateStripeSetupIntentRequest
) {
  const [stripePayment, setStripePayment] = useState<StripePayment>(
    createStripePaymentMC(createStripeRequest)
  );
  const skippedFirstEffect = useRef(false);

  useEffect(() => {
    if (!skippedFirstEffect.current) {
      // Skip initial effect as state is initialized in a default value of a hook
      skippedFirstEffect.current = true;
      return;
    }

    const payment = createStripePaymentMC(createStripeRequest);
    setStripePayment(payment);
  }, [createStripeRequest]);

  return stripePayment;
}

export default useStripePayment;
