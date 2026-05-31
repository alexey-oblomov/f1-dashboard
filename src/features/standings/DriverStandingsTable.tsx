import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui'
import { DRIVER_STANDINGS_TABLE_COLUMNS } from '@/constants'
import type { DriverStanding } from '@/types'
import styles from './DriverStandingsTable.module.css'

interface DriverStandingsTableProps {
  standings: DriverStanding[]
}

export function DriverStandingsTable({ standings }: DriverStandingsTableProps) {
  return (
    <Table className={styles.table}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>{DRIVER_STANDINGS_TABLE_COLUMNS.position}</TableHeaderCell>
          <TableHeaderCell>{DRIVER_STANDINGS_TABLE_COLUMNS.driver}</TableHeaderCell>
          <TableHeaderCell>{DRIVER_STANDINGS_TABLE_COLUMNS.team}</TableHeaderCell>
          <TableHeaderCell>{DRIVER_STANDINGS_TABLE_COLUMNS.points}</TableHeaderCell>
          <TableHeaderCell>{DRIVER_STANDINGS_TABLE_COLUMNS.wins}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {standings.map((standing) => (
          <TableRow key={`${standing.position}-${standing.driverName}`}>
            <TableCell>{standing.position}</TableCell>
            <TableCell>{standing.driverName}</TableCell>
            <TableCell>{standing.constructor}</TableCell>
            <TableCell>{standing.points}</TableCell>
            <TableCell>{standing.wins}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
