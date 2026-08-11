export type TurnstileValidationErrorCode =
  | 'missing-input-secret'
  | 'invalid-input-secret'
  | 'missing-input-response'
  | 'invalid-input-response'
  | 'bad-request'
  | 'timeout-or-duplicate'
  | 'internal-error';

export interface TurnstileValidationResponse {
  success: boolean;
  hostname: string;
  'error-codes': TurnstileValidationErrorCode[];
  challenge_ts?: string;
  action?: string;
  cdata?: string;
}