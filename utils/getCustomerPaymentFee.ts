const getCustomerPaymentFee = (paymentSum: number, fee: number) =>
  Math.ceil(paymentSum * fee);

export default getCustomerPaymentFee;
