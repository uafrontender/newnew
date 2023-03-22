function enterVerificationCode(verificationCode: string) {
  cy.get('#verification-input').invoke('click');
  verificationCode.split('').forEach((symbol) => {
    cy.wait(200);
    cy.focused().type(symbol);
  });
}

export default enterVerificationCode;
