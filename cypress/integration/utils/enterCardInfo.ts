function enterCardInfo(
  cardNumber: string,
  cardExpiry: string,
  cardCvc: string
) {
  cy.getIframeElementOf('#stripePayment', '#Field-numberInput').type(
    cardNumber
  );

  cy.getIframeElementOf('#stripePayment', '#Field-expiryInput').type(
    cardExpiry
  );

  cy.getIframeElementOf('#stripePayment', '#Field-cvcInput').type(cardCvc);
}

export default enterCardInfo;
