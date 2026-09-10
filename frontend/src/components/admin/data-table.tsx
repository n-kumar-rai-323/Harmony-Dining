'use client';

import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  emptyText?: string;
  /** Server pagination. Omit to hide the footer. */
  pagination?: {
    page: number; // 1-based
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  onRowClick?: (row: T) => void;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading = false,
  emptyText = 'Nothing to show.',
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <Paper variant="outlined">
      <TableContainer sx={{ position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(255,255,255,0.6)',
              zIndex: 2,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  align={c.align}
                  sx={{ width: c.width, fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  {c.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 4, textAlign: 'center' }}
                  >
                    {emptyText}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} align={c.align} sx={{ verticalAlign: 'top' }}>
                      {c.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={(_, p) => pagination.onPageChange(p + 1)}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={(e) =>
            pagination.onPageSizeChange(Number(e.target.value))
          }
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      )}
    </Paper>
  );
}
