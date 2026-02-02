'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { Download, Search, ArrowUpDown, FileDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ExtractedData } from '@/lib/types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface DataTabProps {
  data: ExtractedData[];
}

export default function DataTab({ data }: DataTabProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const columns = [
    {
      accessorKey: 'pdf_file_name',
      header: 'File Name',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: any) =>
        row.original.date ?? '—',
    },
    {
      accessorKey: 'handwritten',
      header: 'Type',
      cell: ({ row }: any) =>
        row.original.handwritten ? 'Handwritten' : 'Typed',
    },
    {
      accessorKey: 'confidence',
      header: 'Confidence',
      cell: ({ row }: any) => `${row.original.confidence?.toFixed(1)}%`,
    },
    {
      accessorKey: 'model',
      header: 'Model',
    },
  ];


  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportToCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docuextract-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docuextract-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');
    XLSX.writeFile(wb, `docuextract-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Toolbar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search all fields..."
              className="w-full pl-10 pr-4 py-2 bg-[rgba(var(--card),0.6)] border border-[rgba(var(--border),0.3)] rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                table.setPageSize(Number(e.target.value));
              }}
              className="px-3 py-2 bg-[rgba(var(--card),0.6)] border border-[rgba(var(--border),0.3)] rounded-lg focus:outline-none focus:border-primary-500"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[rgba(var(--card),0.6)] border border-[rgba(var(--border),0.3)] rounded-lg hover:bg-[rgba(var(--card-hover),0.6)] hover:border-primary-500/50 transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span className="text-sm font-medium">CSV</span>
            </button>

            <button
              onClick={exportToJSON}
              className="flex items-center gap-2 px-4 py-2 bg-[rgba(var(--card),0.6)] border border-[rgba(var(--border),0.3)] rounded-lg hover:bg-[rgba(var(--card-hover),0.6)] hover:border-primary-500/50 transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span className="text-sm font-medium">JSON</span>
            </button>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-all"
            >
              <Download className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-400">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {data.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-[rgba(var(--border),0.3)]">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[rgba(var(--border),0.2)] hover:bg-[rgba(var(--card-hover),0.4)] transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(var(--border),0.3)]">
            <div className="text-sm text-gray-400">
              Showing {table.getRowModel().rows.length} of {data.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-4 py-2 rounded-lg bg-[rgba(var(--card),0.6)] border border-[rgba(var(--border),0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(var(--card-hover),0.6)] transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-4 py-2 rounded-lg bg-[rgba(var(--card),0.6)] border border-[rgba(var(--border),0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(var(--card-hover),0.6)] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <FileDown className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-gray-400">Upload and process documents to see extracted data here</p>
        </div>
      )}
    </div>
  );
}
