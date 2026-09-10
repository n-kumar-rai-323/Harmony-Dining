import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DataTable, type Column } from './data-table';

type Row = { id: string; name: string };

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', render: (r) => r.name },
];

describe('DataTable', () => {
  it('renders a row per item', () => {
    render(
      <DataTable
        columns={columns}
        rows={[
          { id: '1', name: 'Alpha' },
          { id: '2', name: 'Beta' },
        ]}
        getRowKey={(r) => r.id}
      />,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('shows the empty text when there are no rows and not loading', () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        getRowKey={(r) => r.id}
        emptyText="Nothing here"
      />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('calls onRowClick with the clicked row', async () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        rows={[{ id: '7', name: 'Gamma' }]}
        getRowKey={(r) => r.id}
        onRowClick={onRowClick}
      />,
    );
    await userEvent.click(screen.getByText('Gamma'));
    expect(onRowClick).toHaveBeenCalledWith({ id: '7', name: 'Gamma' });
  });
});
