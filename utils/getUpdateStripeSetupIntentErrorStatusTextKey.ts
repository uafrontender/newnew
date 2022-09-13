import { newnewapi } from 'newnew-api';

function getUpdateStripeSetupIntentErrorStatusTextKey(
  status?: newnewapi.UpdateStripeSetupIntentResponse.Status
) {
  switch (status) {
    case newnewapi.UpdateStripeSetupIntentResponse.Status.EMAIL_CANNOT_BE_USED:
      return 'errors.wrongEmail';
    case newnewapi.UpdateStripeSetupIntentResponse.Status.INSUFFICIENT_REWARDS:
      return 'errors.rewardNotEnough';
    case newnewapi.UpdateStripeSetupIntentResponse.Status
      .SETUP_INTENT_IS_INVALID:
      return 'errors.paymentFailed';
    default:
      return 'errors.requestFailed';
  }
}

export default getUpdateStripeSetupIntentErrorStatusTextKey;
