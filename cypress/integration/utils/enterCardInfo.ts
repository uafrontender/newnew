function enterCardInfo(
  cardNumber: string,
  cardExpiry: string,
  cardCvc: string,
  postalCode: string
) {
  cy.getIframeElementOf('#stripePayment', '#Field-numberInput').type(
    cardNumber
  );

  cy.getIframeElementOf('#stripePayment', '#Field-expiryInput').type(
    cardExpiry
  );

  cy.getIframeElementOf('#stripePayment', '#Field-cvcInput').type(cardCvc);

  cy.getIframeElementOf('#stripePayment', '#Field-countryInput').select(
    'United States'
  );

  cy.getIframeElementOf('#stripePayment', '#Field-postalCodeInput').type(
    postalCode
  );
}

export default enterCardInfo;
