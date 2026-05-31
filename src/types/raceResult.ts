export interface RaceResult {
  position: number
  driverName: string
  constructor: string
  points: number
  status: string
}

export interface RaceResultsData {
  season: number
  round: number
  raceName: string
  date: string
  results: RaceResult[]
}
