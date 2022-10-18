import { newnewapi } from 'newnew-api';

export function getUpdateStripeSetupIntentErrorStatusTextKey(
  status?: newnewapi.UpdateStripeSetupIntentResponse.Status
) {
  switch (status) {
    case newnewapi.UpdateStripeSetupIntentResponse.Status.EMAIL_CANNOT_BE_USED:
      return 'errors.wrongEmail';
    case newnewapi.UpdateStripeSetupIntentResponse.Status
      .SETUP_INTENT_IS_INVALID:
      return 'errors.paymentFailed';
    default:
      return 'errors.requestFailed';
  }
}

export function getCreateStripeSetupIntentErrorStatusTextKey(
  status?: newnewapi.CreateStripeSetupIntentResponse.Status
) {
  switch (status) {
    case newnewapi.CreateStripeSetupIntentResponse.Status.INVALID_CUSTOMER_FEE:
      return 'errors.invalidFee';
    default:
      return 'errors.requestFailed';
  }
}
