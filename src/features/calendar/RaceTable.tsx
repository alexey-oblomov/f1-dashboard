import { useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui'
import { CALENDAR_TABLE_COLUMNS, routePaths } from '@/constants'
import { formatRaceDate } from '@/lib/formatters'
import type { Race } from '@/types'
import { RaceStatusBadge } from './RaceStatusBadge'
import styles from './RaceTable.module.css'

interface RaceTableProps {
  races: Race[]
}

export function RaceTable({ races }: RaceTableProps) {
  const navigate = useNavigate()

  return (
    <Table className={styles.table}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.round}</TableHeaderCell>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.date}</TableHeaderCell>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.grandPrix}</TableHeaderCell>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.country}</TableHeaderCell>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.circuit}</TableHeaderCell>
          <TableHeaderCell>{CALENDAR_TABLE_COLUMNS.status}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {races.map((race) => {
          const racePath = routePaths.raceResults(race.season, race.round)

          const handleNavigate = () => navigate(racePath)

          return (
            <TableRow
              key={`${race.season}-${race.round}`}
              className={styles.clickableRow}
              onClick={handleNavigate}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleNavigate()
                }
              }}
              role="link"
              tabIndex={0}
            >
              <TableCell>{race.round}</TableCell>
              <TableCell>{formatRaceDate(race.date)}</TableCell>
              <TableCell>{race.name}</TableCell>
              <TableCell>{race.country}</TableCell>
              <TableCell>{race.circuit}</TableCell>
              <TableCell>
                <RaceStatusBadge status={race.status} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
