export interface IReCaptchaRes {
  success?: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  errors?: Array<string> | string;
  'error-codes'?: Array<string>;
}
