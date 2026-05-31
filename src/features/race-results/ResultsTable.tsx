import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui'
import { RESULTS_TABLE_COLUMNS } from '@/constants'
import type { RaceResult } from '@/types'
import { ResultStatusBadge } from './ResultStatusBadge'
import styles from './ResultsTable.module.css'

interface ResultsTableProps {
  results: RaceResult[]
}

export function ResultsTable({ results }: ResultsTableProps) {
  return (
    <Table className={styles.table}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>{RESULTS_TABLE_COLUMNS.position}</TableHeaderCell>
          <TableHeaderCell>{RESULTS_TABLE_COLUMNS.driver}</TableHeaderCell>
          <TableHeaderCell>{RESULTS_TABLE_COLUMNS.team}</TableHeaderCell>
          <TableHeaderCell>{RESULTS_TABLE_COLUMNS.points}</TableHeaderCell>
          <TableHeaderCell>{RESULTS_TABLE_COLUMNS.status}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {results.map((result) => (
          <TableRow key={`${result.position}-${result.driverName}`}>
            <TableCell>{result.position}</TableCell>
            <TableCell>{result.driverName}</TableCell>
            <TableCell>{result.constructor}</TableCell>
            <TableCell>{result.points}</TableCell>
            <TableCell>
              <ResultStatusBadge status={result.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
