export const CALENDAR_TABLE_COLUMNS = {
  round: 'Round',
  date: 'Date',
  grandPrix: 'Grand Prix',
  country: 'Country',
  circuit: 'Circuit',
  status: 'Status',
} as const

export const RESULTS_TABLE_COLUMNS = {
  position: 'Pos',
  driver: 'Driver',
  team: 'Team',
  points: 'Points',
  status: 'Status',
} as const

export const DRIVER_STANDINGS_TABLE_COLUMNS = {
  position: 'Pos',
  driver: 'Driver',
  team: 'Team',
  points: 'Points',
  wins: 'Wins',
} as const

export const CONSTRUCTOR_STANDINGS_TABLE_COLUMNS = {
  position: 'Pos',
  team: 'Team',
  points: 'Points',
  wins: 'Wins',
} as const
