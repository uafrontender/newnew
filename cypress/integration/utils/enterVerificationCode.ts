const VERIFICATION_CODE = '111111';

function enterVerificationCode() {
  cy.get('#verification-input').invoke('click');
  VERIFICATION_CODE.split('').forEach((symbol) => {
    cy.wait(200);
    cy.focused().type(symbol);
  });
}

export default enterVerificationCode;
