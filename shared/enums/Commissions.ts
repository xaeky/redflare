export enum CommissionStatusType {
  None             = 0,
  Settled          = 1 << 0,
  Missing          = 1 << 1,
  Backlog          = 1 << 2,
  InSetup          = 1 << 3,
  NextUp           = 1 << 4,
  InDevelopment    = 1 << 5,
  AwaitingResponse = 1 << 6,
  Showtime         = 1 << 7,
  Maintenance      = 1 << 8,
  Cancelled        = 1 << 9,
};