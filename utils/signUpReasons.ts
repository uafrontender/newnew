export const signupReasons = [
  'comment',
  'bid',
  'pledge',
  'subscribe',
  'follow-decision',
  'follow-creator',
  'session_expired',
  'report',
] as const;

export type SignupReason = typeof signupReasons[number];
