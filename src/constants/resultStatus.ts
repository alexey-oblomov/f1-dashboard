export const RESULT_STATUS = {
  finished: 'Finished',
  retired: 'Retired',
  lapped: 'Lapped',
  disqualified: 'Disqualified',
  plusLap: '+1 Lap',
} as const

export type ResultStatus = (typeof RESULT_STATUS)[keyof typeof RESULT_STATUS]
