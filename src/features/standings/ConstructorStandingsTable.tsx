import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui'
import { CONSTRUCTOR_STANDINGS_TABLE_COLUMNS } from '@/constants'
import type { ConstructorStanding } from '@/types'
import styles from './ConstructorStandingsTable.module.css'

interface ConstructorStandingsTableProps {
  standings: ConstructorStanding[]
}

export function ConstructorStandingsTable({ standings }: ConstructorStandingsTableProps) {
  return (
    <Table className={styles.table}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>{CONSTRUCTOR_STANDINGS_TABLE_COLUMNS.position}</TableHeaderCell>
          <TableHeaderCell>{CONSTRUCTOR_STANDINGS_TABLE_COLUMNS.team}</TableHeaderCell>
          <TableHeaderCell>{CONSTRUCTOR_STANDINGS_TABLE_COLUMNS.points}</TableHeaderCell>
          <TableHeaderCell>{CONSTRUCTOR_STANDINGS_TABLE_COLUMNS.wins}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {standings.map((standing) => (
          <TableRow key={`${standing.position}-${standing.name}`}>
            <TableCell>{standing.position}</TableCell>
            <TableCell>{standing.name}</TableCell>
            <TableCell>{standing.points}</TableCell>
            <TableCell>{standing.wins}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
